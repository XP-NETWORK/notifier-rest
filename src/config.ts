import { config } from 'dotenv';
import { ChainFactoryConfigs } from 'xp.network';
import { TExplorerConfig } from './types';
config();

export const mongo_uri = process.env.MONGO_URI;
export const environment = process.env.ENVIRONMENT;
export const port = parseInt(process.env.PORT);
export const secret_hash = process.env.EVENT_SECRET_HASH;
export const elrond_uri = process.env.ELROND_NODE_URI;
export const elrond_minter = process.env.ELROND_MINTER;
export const dfinity_uri = process.env.DFINITY_AGENT_URI;
export const dfinity_bridge = process.env.DFINITY_BRIDGE;
export const config_scan: TExplorerConfig =
  process.env.EVM_WHITELIST_CONFIG &&
  JSON.parse(process.env.EVM_WHITELIST_CONFIG);
export interface ChainConfig {
  name: string;
  chainFactory: any;
  nonce: string;
}
interface Config {
  web3: ChainConfig[];
}

export const getChainFactory = async (chain: string) => {
  const con = await ChainFactoryConfigs.MainNet();
  return con[chain];
};

const chainData: Config = {
  web3: [
    {
      name: 'ABEYCHAIN',
      chainFactory: getChainFactory('abeyChainParams'),
      nonce: getOrThrow('ABEYCHAIN_NONCE'),
    },
    {
      name: 'AURORA',
      chainFactory: getChainFactory('auroraParams'),
      nonce: getOrThrow('AURORA_NONCE'),
    },
    {
      name: 'BSC',
      chainFactory: getChainFactory('bscParams'),
      nonce: getOrThrow('BSC_NONCE'),
    },
    {
      name: 'ETHEREUM',
      chainFactory: getChainFactory('ropstenParams'),
      nonce: getOrThrow('ETHEREUM_NONCE'),
    },
    {
      name: 'VELAS',
      chainFactory: getChainFactory('velasParams'),
      nonce: getOrThrow('VELAS_NONCE'),
    },
    {
      name: 'POLYGON',
      chainFactory: getChainFactory('polygonParams'),
      nonce: getOrThrow('POLYGON_NONCE'),
    },
    {
      name: 'AVALANCHE',
      chainFactory: getChainFactory('avalancheParams'),
      nonce: getOrThrow('AVALANCHE_NONCE'),
    },
    {
      name: 'IOTEX',
      chainFactory: getChainFactory('iotexParams'),
      nonce: getOrThrow('IOTEX_NONCE'),
    },
    {
      name: 'FANTOM',
      chainFactory: getChainFactory('fantomParams'),
      nonce: getOrThrow('FANTOM_NONCE'),
    },
    {
      name: 'HARMONY',
      chainFactory: getChainFactory('harmonyParams'),
      nonce: getOrThrow('HARMONY_NONCE'),
    },
    {
      name: 'GNOSIS',
      chainFactory: getChainFactory('xDaiParams'),
      nonce: getOrThrow('GNOSIS_NONCE'),
    },
    {
      name: 'FUSE',
      chainFactory: getChainFactory('fuseParams'),
      nonce: getOrThrow('FUSE_NONCE'),
    },
    {
      name: 'GATECHAIN',
      chainFactory: getChainFactory('gateChainParams'),
      nonce: getOrThrow('GATECHAIN_NONCE'),
    },
    {
      name: 'VECHAIN',
      chainFactory: getChainFactory('vechainParams'),
      nonce: getOrThrow('VECHAIN_NONCE'),
    },
    {
      name: 'GODWOKEN',
      chainFactory: getChainFactory('godwokenParams'),
      nonce: getOrThrow('GODWOKEN_NONCE'),
    },
    {
      name: 'MOONBEAM',
      chainFactory: getChainFactory('moonbeamParams'),
      nonce: getOrThrow('MOONBEAM_NONCE'),
    },
    {
      name: 'CADUCEUS',
      chainFactory: getChainFactory('caduceusParams'),
      nonce: getOrThrow('CADUCEUS_NONCE'),
    },
    {
      name: 'OKC',
      chainFactory: getChainFactory('okcParams'),
      nonce: getOrThrow('OKC_NONCE'),
    },
    {
      name: 'SKALE',
      chainFactory: getChainFactory('okcParams'),
      nonce: getOrThrow('SKALE_NONCE'),
    },
    {
      name: 'ARBITRUM',
      chainFactory: getChainFactory('arbitrumParams'),
      nonce: getOrThrow('ARBITRUM_NONCE'),
    },
  ],
};

function getOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var ${key}`);
  }
  return value;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const getChain = (nonce: string) => {
  try {
    Object.keys(chainData).forEach((key: string) => {
      const item: ChainConfig | ChainConfig[] = chainData[key];

      if (Array.isArray(item)) {
        for (const c of item) {
          if (c.nonce === nonce || c.name.toUpperCase() === nonce.toUpperCase())
            throw c;
        }
      } else {
        if (
          (item.nonce && item.nonce === nonce) ||
          (item.name && item.name.toUpperCase() === nonce.toUpperCase())
        )
          throw item;
      }
    });
  } catch (chain) {
    return chain as ChainConfig;
  }
};
