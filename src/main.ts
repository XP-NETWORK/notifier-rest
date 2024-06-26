/* eslint-disable @typescript-eslint/ban-types */
import { HttpAgent } from '@dfinity/agent';
import { PipeArrayBuffer, safeReadUint8 } from '@dfinity/candid';
import { Nat, encode } from '@dfinity/candid/lib/cjs/idl';
import { Principal } from '@dfinity/principal';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { EntityManager, MongoDriver } from '@mikro-orm/mongodb';
import { Mutex } from 'async-mutex';
import axios from 'axios';
import BN from 'bignumber.js';
import cors from 'cors';
import express, { Request } from 'express';
import http from 'http';
import { Minter__factory } from 'xpnet-web3-contracts';
import {
  config_scan,
  dfinity_bridge,
  dfinity_uri,
  elrond_minter,
  elrond_uri,
  getChain,
  port,
} from './config';
import { TxStore } from './db/TxStore';
import { WhiteListStore } from './db/WhiteListStore';
import mikroConf from './mikro-orm';
import * as socket from './socket';
import {
  ICreateCollectionContractBody,
  IRequest,
  IWhiteListBody,
  TExplorerConfig,
} from './types';
import { isWhitelistable } from './utils';
import { getRandomArbitrary } from './utils/getRandomArbitrary';
import {
  getNoWhitelistMapping,
  isSuccessNoWhitelistRes,
} from './utils/noWhitelist';
import { checkIfMappingExistsInBridge } from './utils/no-whitelist/checkIfMappingExistsInBridge';
import { deployNoWhitelistEvmContract } from './utils/no-whitelist/deployNoWhitelistEvmContract';
import { getEthSigner } from './utils/no-whitelist/getEthSigner';

const mutex = new Mutex();

const app = express();
const server = http.createServer(app);
const io = socket.socketMain(server);

console.log('WARN: using permissive cors!!');

app.use(cors({ origin: '*' }));
app.use(express.json());

const requireAuth = async (_, __, next) => {
  return next();
};

async function emitEvent(
  em: EntityManager,
  chainId: number,
  txHash: string,
  cb: (chain: number, txHash: string) => void
): Promise<'err' | 'ok'> {
  const ent = await em.findOne(TxStore, { chainId, txHash });
  if (ent != null) return 'err';
  await em.persistAndFlush(new TxStore(chainId, txHash));

  cb(chainId, txHash);

  return 'ok';
}

type TxRespMin = {
  readonly data?: {
    readonly transaction?: {
      readonly smartContractResults?: readonly {
        readonly data: string;
        readonly hash: string;
        readonly receiver: string;
        readonly sender: string;
      }[];
      readonly logs?: readonly unknown[];
    };
  };
};

const elrondWaitTxnConfirmed = async (tx_hash: string) => {
  const uri = `${elrond_uri}/transaction/${tx_hash}?withResults=true`;
  let tries = 0;
  let hit = false;

  while (tries < 10) {
    tries += 1;
    let err;
    // TODO: type safety
    const res = await axios.get(uri).catch((e) => (err = e));
    if (err) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    const data = res.data;
    if (data['code'] != 'successful') {
      throw Error('failed to execute txn');
    }

    const tx_info = data['data']['transaction'];
    if (tx_info['status'] == 'pending') {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    if (tx_info['status'] != 'success') {
      throw Error('failed to execute txn');
    }
    if (!tx_info['smartContractResults']?.length && !tx_info['logs']) {
      await new Promise((r) => setTimeout(r, 5000));
      if (tries > 8 && !hit) {
        tries = 0;
        hit = true;
      }
      continue;
    }

    return data as TxRespMin;
  }

  throw Error(`failed to query transaction exceeded 10 retries ${tx_hash}`);
};

async function elrondExtractFunctionEvent(em: EntityManager, txHash: string) {
  if (txHash.length != 64) {
    console.log('elrond: received invalid hash', txHash);
    return undefined;
  }
  try {
    Buffer.from(txHash, 'hex');
  } catch (_) {
    console.log('elrond: received invalid hash', txHash);
    return undefined;
  }

  let txData: TxRespMin;
  try {
    txData = await elrondWaitTxnConfirmed(txHash);
  } catch (e) {
    console.warn('failed to fetch txdata with err', e);
    return undefined;
  }
  if (!txData.data?.transaction?.smartContractResults?.length) {
    console.warn('no events in transaction');
    return undefined;
  }

  await new Promise((r) => setTimeout(r, 10000));

  let withdrawFlag = false;
  let multiEsdt: string | undefined = undefined;
  const doTxFetch = async () => {
    for (const res of txData.data.transaction.smartContractResults) {
      if (
        res.data.startsWith('MultiESDTNFTTransfer') &&
        res.receiver == elrond_minter
      ) {
        multiEsdt = res.hash;
      }
      if (res.data.startsWith('@6f6b') && res.sender == elrond_minter) {
        withdrawFlag = true;
        return;
      }

      const withdrawDat = await elrondWaitTxnConfirmed(multiEsdt).catch(
        () => undefined
      );
      if (
        withdrawDat &&
        withdrawDat.data.transaction?.logs?.events.some(
          (e: any) =>
            e.identifier == 'withdrawNft' || e.identifier == 'freezeSendNft'
        )
      ) {
        withdrawFlag = true;
      }
    }
  };
  await doTxFetch();

  while (multiEsdt && !withdrawFlag) {
    txData = await elrondWaitTxnConfirmed(txHash);
    await doTxFetch();
  }

  if (withdrawFlag) {
    if (!multiEsdt) return undefined;

    await elrondWaitTxnConfirmed(multiEsdt);
    return (await emitEvent(em, 0x2, multiEsdt, () => {})) == 'ok'
      ? multiEsdt
      : undefined;
  } else {
    return txHash;
  }
}

function dfinitySetup(orm: MikroORM<MongoDriver>) {
  if (!dfinity_uri) return;

  const bridgeContract = Principal.fromText(dfinity_bridge);
  const dfinityAgent = new HttpAgent({
    host: dfinity_uri,
    fetch: require('cross-fetch'),
  });

  app.post(
    '/tx/dfinity',
    async (req: Request<{}, {}, { readonly action_id: string }>, res) => {
      let act: BigInt;
      try {
        act = BigInt(req.body.action_id);
      } catch {
        return res.send({ status: 'err' });
      }

      const evQuery = await dfinityAgent.query(bridgeContract, {
        methodName: 'get_event',
        arg: encode([Nat], [act]),
      });
      if ('reject_code' in evQuery) return res.send({ status: 'err' });

      if (safeReadUint8(new PipeArrayBuffer(evQuery.reply.arg)) == 0)
        return res.send({ status: 'err' });

      emitEvent(orm.em, 0x1c, req.body.action_id, (_, actionId) =>
        io.emit('dfinity:bridge_tx', actionId)
      );

      return res.send({ status: 'ok' });
    }
  );
}

async function main() {
  const orm: MikroORM<MongoDriver> = await MikroORM.init(mikroConf);

  app.use((_, __, next) => {
    RequestContext.create(orm.em, next);
  });

  app.post('/tx/tron', async (req, res) => {
    const status = await emitEvent(orm.em, 9, req.body.tx_hash, (_, txHash) =>
      io.emit('tron:bridge_tx', txHash)
    );
    res.json({ status });
  });

  app.post('/tx/near', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      0x1f,
      req.body.tx_hash,
      (_, txHash) => {
        io.emit('near:bridge_tx', txHash);
      }
    );
    res.json({ status });
  });

  app.post('/tx/web3', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      req.body.chain_nonce,
      req.body.tx_hash,
      (chain, hash) =>
        io.emit(
          'web3:bridge_tx',
          chain,
          hash,
          req.body?.actionId,
          req.body?.type,
          req.body?.toChain,
          req.body?.txFees,
          req.body?.senderAddress,
          req.body?.targetAddress,
          req.body?.nftUri,
          req.body?.tokenId,
          req.body?.contract
        )
    );
    res.json({ status });
  });

  app.post('/tx/algorand', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      15,
      req.body.tx_hash,
      async (_, txHash) => {
        io.emit('algorand:bridge_tx', txHash);
      }
    );
    res.json({ status });
  });

  app.post('/tx/aptos', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      0x22,
      req.body.tx_hash,
      async (_, txHash) => {
        io.emit('aptos:bridge_tx', txHash);
      }
    );
    return res.json({ status });
  });

  app.post('/tx/casper', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      39,
      req.body.tx_hash,
      async (_, txHash) => {
        io.emit('casper:bridge_tx', txHash);
      }
    );
    return res.json({ status });
  });

  app.post('/tx/ton', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      0x1b,
      req.body.tx_hash,
      async (_, txHash) => {
        io.emit('ton:bridge_tx', txHash);
      }
    );
    return res.json({ status });
  });
  app.post('/tx/elrond', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      2,
      req.body.tx_hash,
      async (_, txHash) => {
        const ex = await elrondExtractFunctionEvent(orm.em, txHash);
        ex &&
          io.emit(
            'elrond:bridge_tx',
            ex,
            req.body.sender,
            req.body.uris,
            req.body.action_id
          );
        console.log('elrond sent tx to validator', ex);
      }
    );
    res.json({ status });
  });

  app.post('/tx/elrondevent', async (req, res) => {
    const status = await emitEvent(
      orm.em,
      2,
      req.body.tx_hash,
      async (_, txHash) => {
        const ex = txHash;
        ex &&
          io.emit(
            'elrond:bridge_tx',
            ex,
            req.body.sender,
            req.body.uris,
            req.body.action_id
          );
        console.log('elrond sent tx to validator', ex);
      }
    );
    res.json({ status });
  });

  app.post(
    '/tx/tezos',
    (req: Request<{}, {}, { readonly tx_hash: string }>, res) => {
      emitEvent(orm.em, 0x12, req.body.tx_hash, (_, txHash) =>
        io.emit('tezos:bridge_tx', txHash)
      );

      res.send({ status: 'ok' });
    }
  );

  app.post(
    '/tx/scrt',
    (req: Request<{}, {}, { readonly tx_hash: string }>, res) => {
      emitEvent(orm.em, 0x18, req.body.tx_hash, (_, txHash) =>
        io.emit('secret:bridge_tx', txHash)
      );

      res.send({ status: 'ok' });
    }
  );

  app.post(
    '/tx/solana',
    (req: Request<{}, {}, { readonly tx_hash: string }>, res) => {
      emitEvent(orm.em, 0x1a, req.body.tx_hash, (_, txHash) =>
        io.emit('solana:bridge_tx', txHash)
      );

      res.send({ status: 'ok' });
    }
  );

  app.get(
    '/collection-contract/:collectionAddress/:chainNonce',
    requireAuth,
    async (
      req: IRequest<
        {},
        {
          collectionAddress: string;
          chainNonce: number;
        },
        {}
      >,
      res
    ) => {
      const collectionAddress = req.params.collectionAddress;
      const chainNonce = req.params.chainNonce;

      console.log(collectionAddress, chainNonce);

      if (!chainNonce || !collectionAddress) {
        return res.status(400).send({ error: 'Invalid params!' });
      }

      try {
        const response = await getNoWhitelistMapping(
          collectionAddress,
          Number(chainNonce)
        );
        console.log('trycatch - response', response);
        if (isSuccessNoWhitelistRes(response)) {
          console.log('isSuccessNoWhitelistRes(response)');
          return res.status(200).send({ ...response.data });
        } else {
          return res.status(404).send({ error: 'Not found' });
        }
      } catch (error) {
        console.warn(error?.response?.data?.data);
      }

      return res.status(500).send({ error: 'Internal server error' });
    }
  );

  app.post(
    '/collection-contract',
    requireAuth,
    async (req: IRequest<ICreateCollectionContractBody, {}, {}>, res) => {
      console.log('/create-collection-contract - START');
      const collectionAddress = req.body.collectionAddress;
      const chainNonce = Number(req.body.chainNonce);
      const type = req.body.type;

      console.log(
        '/create-collection-contract - collectionAddress',
        collectionAddress,
        typeof collectionAddress
      );
      console.log(
        '/create-collection-contract - chainNonce',
        chainNonce,
        typeof chainNonce
      );

      if (
        !chainNonce ||
        !collectionAddress ||
        (type !== 'ERC1155' && type !== 'ERC721')
      ) {
        return res.status(400).send({ error: 'Invalid body!' });
      }

      // if (chainNonce === 5) {
      //   return res.status(400).send({ error: 'Not allowed!' });
      // }

      try {
        const response = await getNoWhitelistMapping(
          collectionAddress,
          chainNonce
        );
        console.log('trycatch - response', response);
        if (isSuccessNoWhitelistRes(response)) {
          console.log('isSuccessNoWhitelistRes(response)');
          return res.status(200).send({ ...response.data });
        }
      } catch (error) {
        console.warn(error?.response?.data?.data);
      }

      const randomNonce = getRandomArbitrary();
      const actionId = randomNonce.plus(chainNonce);

      const _type = type === 'ERC1155' ? 1155 : 721;

      io.emit(
        'deploy_contract',
        chainNonce,
        collectionAddress,
        _type,
        actionId,
        undefined
      );

      return res.status(200).send({
        collectionAddress,
        chainNonce,
        status: 'SUCCESS',
      });
    }
  );

  app.post(
    '/eth-collection-contract',
    requireAuth,
    async (req: IRequest<ICreateCollectionContractBody, {}, {}>, res) => {
      console.log('/eth-collection-contract - START');
      const collectionAddress = req.body.collectionAddress;
      const _type = req.body.type;

      console.log(
        '/eth-collection-contract - collectionAddress',
        collectionAddress,
        typeof collectionAddress
      );

      if (!collectionAddress || (_type !== 'ERC1155' && _type !== 'ERC721')) {
        return res.status(400).send({ error: 'Invalid body!' });
      }

      const type = _type === 'ERC1155' ? 1155 : 721;
      const CHAIN_NONCE = 5;
      const signer = getEthSigner();

      /*  ================================================
                      check mapping in bridge
          ================================================    */

      const response = await checkIfMappingExistsInBridge(
        signer,
        collectionAddress
      );

      console.log('handleAddContractToBridge', { response });

      if (response.status === 'exists') {
        return res
          .status(200)
          .send({ msg: 'Already deployed!', data: response.address });
      } else if (response.status === 'error') {
        return res.status(500).send({ error: 'Internal server error!' });
      }

      /*  ================================================
                            deploy contract
          ================================================    */

      let contractAddress: string | undefined;
      console.log('handleAddContractToBridge deploy contract');
      try {
        contractAddress = await deployNoWhitelistEvmContract({
          signer,
          type,
        });
        console.log('handleAddContractToBridge', { contractAddress });
        if (!contractAddress) {
          return res.status(500).send({ error: 'Internal server error!' });
        }
      } catch (error) {
        console.error('deployContractListener - error', error);
        return res.status(500).send({ error: 'Internal server error!' });
      }

      const randomNonce = getRandomArbitrary();
      const actionId = BN(parseInt(collectionAddress, 16))
        .plus(BN(CHAIN_NONCE))
        .plus(randomNonce);

      io.emit(
        'deploy_contract',
        CHAIN_NONCE,
        collectionAddress,
        type,
        actionId,
        contractAddress
      );

      return res.status(200).send({
        collectionAddress,
        status: 'SUCCESS',
      });
    }
  );

  app.post(
    '/whitelist',
    requireAuth,
    async (req: IRequest<IWhiteListBody, {}, {}>, res) => {
      const release = await mutex.acquire();
      try {
        const chainNonce = req?.body?.chain_nonce;
        const contract = req?.body?.contract;
        const authKey = req?.body?.authKey;
        const isOpenSeaCollection = req.body.isOpenSeaCollection;
        const openSeaCollectionIdentifier =
          req.body.openSeaCollectionIdentifier;
        console.log('notifier', { contract, chainNonce });
        if (!chainNonce || chainNonce < 0 || !contract) {
          return res
            .status(400)
            .send({ error: 'Invalid request body', contract, chainNonce });
        }
        const chainConfig = getChain(String(chainNonce));
        if (!chainConfig) {
          return res.status(500).send({ error: 'chain Nonce not found' });
        }
        const chainFactory = await chainConfig.chainFactory;
        const minterContract = Minter__factory.connect(
          chainFactory['minter_addr'],
          chainFactory['provider']
        );
        const isWhitelisted: [boolean] =
          await minterContract.functions.nftWhitelist(contract);

        if (isWhitelisted[0]) {
          return res.send({ status: 'ok' });
        }

        const explorerConfig: TExplorerConfig = config_scan[chainNonce] || {};
        const { secret = '', url = '' } = explorerConfig;
        let isWhitelistable_: { success: boolean; reason?: string };
        if (!url.trim()) {
          isWhitelistable_ = { success: false, reason: 'url not valid' };
        } else {
          try {
            isWhitelistable_ = await isWhitelistable(url, contract, secret);
            // console.log('is whitelistable', isWhitelistable_);
          } catch (error) {
            isWhitelistable_ = {
              success: false,
              reason: 'Something went wrong please try again later!',
            };
          }
        }

        if (!isWhitelistable_.success && !authKey) {
          return res.status(400).send({
            error: 'Contract not whitelistable',
            reason: isWhitelistable_.reason,
            contract,
            chainNonce,
          });
        }
        let ent: WhiteListStore;
        console.log('isOpenSeaCollection', isOpenSeaCollection);
        if (isOpenSeaCollection) {
          ent = await orm.em.findOne(WhiteListStore, {
            chainNonce,
            contract,
            isOpenSeaCollection,
            openSeaCollectionIdentifier,
          });
        } else {
          ent = await orm.em.findOne(WhiteListStore, {
            chainNonce,
            contract,
          });
        }
        if (ent != null) {
          return res.status(400).send({
            error: 'Chain nonce and contract combination already exists',
            contract,
            chainNonce,
          });
        }
        const randomNonce = getRandomArbitrary();
        const actionId = BN(parseInt(contract, 16))
          .plus(BN(chainNonce))
          .plus(randomNonce);
        io.emit('whitelist_nft', chainNonce, contract, actionId, authKey);
        if (isOpenSeaCollection) {
          await orm.em.persistAndFlush(
            new WhiteListStore(
              chainNonce,
              contract,
              false,
              isOpenSeaCollection,
              openSeaCollectionIdentifier
            )
          );
        } else {
          await orm.em.persistAndFlush(
            new WhiteListStore(chainNonce, contract, false, false, '')
          );
        }
        console.log('whitelist event emitted');
        return res.send({ status: 'ok' });
      } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal server error' });
      } finally {
        release();
      }
    }
  );

  app.post('/add_white_list', requireAuth, async (req, res) => {
    const release = await mutex.acquire();
    try {
      const chainNonce = req?.body?.chain_nonce;
      const contract = req?.body?.contract;
      const authKey = req?.body?.authKey;

      console.log('authKey', authKey);

      if (!chainNonce || !contract) {
        return res
          .status(400)
          .send({ error: 'Invalid request body', contract, chainNonce });
      }

      const entity = await orm.em.findOne(WhiteListStore, {
        chainNonce,
        contract,
      });
      console.log('entity', entity);
      if (entity) {
        return res.status(400).json({
          error: 'Already whitelisted',
          status: 'failed',
        });
      }
      await orm.em.persistAndFlush(
        new WhiteListStore(chainNonce, contract, false, false, '')
      );
      return res.status(200).json({
        error: null,
        status: 'success',
      });
    } catch (error) {
      console.log('error in whitelist status', error);
      return res.status(500).send({ error: 'Internal server error' });
    } finally {
      release();
    }
  });

  app.post('/update_white_list_status', requireAuth, async (req, res) => {
    try {
      const chainNonce = req?.body?.chain_nonce;
      const contract = req?.body?.contract;
      const authKey = req?.body?.authKey;
      const isGet = req?.body?.isGet;
      console.log('authKey', authKey);
      if (!chainNonce || !contract) {
        return res
          .status(400)
          .send({ error: 'Invalid request body', contract, chainNonce });
      }
      const entity = await orm.em.findOne(WhiteListStore, {
        chainNonce,
        contract,
      });
      if (isGet) {
        if (!entity) {
          return res.status(400).json({
            status: 'not found',
            whitelisted: false,
          });
        }
        return res.status(200).json({
          status: 'ok',
          whitelisted: entity.isWhiteListed,
        });
      }
      if (entity) {
        if (entity.isWhiteListed) {
          return res.status(200).json({
            status: 'ok',
            whitelisted: true,
          });
        }
        entity.isWhiteListed = true;
        await orm.em.flush();
      }
      return res.status(200).json({
        status: 'ok',
        whitelisted: true,
      });
    } catch (error) {
      console.log('error in whitelist status', error);
      return res.status(500).send({ error: 'Internal server error' });
    }
  });
  dfinitySetup(orm);
  app.all('*', (_req, res) => {
    res.status(404).send("<h1 style='text-align: center;'>404 Not Found</h1>");
  });
  server.listen(port, () => console.log(`Server is up on port ${port}!`));
}

main().catch(console.dir);
