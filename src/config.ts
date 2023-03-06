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

type TChainParams =
  | 'abeyChainParams'
  | 'auroraParams'
  | 'bscParams'
  | 'ropstenParams'
  | 'velasParams'
  | 'polygonParams'
  | 'avalancheParams'
  | 'iotexParams'
  | 'fantomParams'
  | 'harmonyParams'
  | 'xDaiParams'
  | 'fuseParams'
  | 'gateChainParams'
  | 'vechainParams'
  | 'godwokenParams'
  | 'moonbeamParams'
  | 'caduceusParams'
  | 'okcParams'
  | 'skaleParams'
  | 'arbitrumParams';

export const getChainFactory = async (chain: TChainParams) => {
  const con = await ChainFactoryConfigs.MainNet();
  return con[chain];
};

const chainData: Config = {
  web3: [
    {
      name: 'ABEYCHAIN',
      chainFactory: getChainFactory('abeyChainParams'),
      nonce: '33',
    },
    {
      name: 'AURORA',
      chainFactory: getChainFactory('auroraParams'),
      nonce: '21',
    },
    {
      name: 'BSC',
      chainFactory: getChainFactory('bscParams'),
      nonce: '4',
    },
    {
      name: 'ETHEREUM',
      chainFactory: getChainFactory('ropstenParams'),
      nonce: '5',
    },
    {
      name: 'VELAS',
      chainFactory: getChainFactory('velasParams'),
      nonce: '19',
    },
    {
      name: 'POLYGON',
      chainFactory: getChainFactory('polygonParams'),
      nonce: '7',
    },
    {
      name: 'AVALANCHE',
      chainFactory: getChainFactory('avalancheParams'),
      nonce: '6',
    },
    {
      name: 'IOTEX',
      chainFactory: getChainFactory('iotexParams'),
      nonce: '20',
    },
    {
      name: 'FANTOM',
      chainFactory: getChainFactory('fantomParams'),
      nonce: '8',
    },
    {
      name: 'HARMONY',
      chainFactory: getChainFactory('harmonyParams'),
      nonce: '12',
    },
    {
      name: 'GNOSIS',
      chainFactory: getChainFactory('xDaiParams'),
      nonce: '14',
    },
    {
      name: 'FUSE',
      chainFactory: getChainFactory('fuseParams'),
      nonce: '16',
    },
    {
      name: 'GATECHAIN',
      chainFactory: getChainFactory('gateChainParams'),
      nonce: '23',
    },
    {
      name: 'VECHAIN',
      chainFactory: getChainFactory('vechainParams'),
      nonce: '25',
    },
    {
      name: 'GODWOKEN',
      chainFactory: getChainFactory('godwokenParams'),
      nonce: '22',
    },
    {
      name: 'MOONBEAM',
      chainFactory: getChainFactory('moonbeamParams'),
      nonce: '32',
    },
    {
      name: 'CADUCEUS',
      chainFactory: getChainFactory('caduceusParams'),
      nonce: '35',
    },
    {
      name: 'OKC',
      chainFactory: getChainFactory('okcParams'),
      nonce: '36',
    },
    {
      name: 'SKALE',
      chainFactory: getChainFactory('skaleParams'),
      nonce: '30',
    },
    {
      name: 'ARBITRUM',
      chainFactory: getChainFactory('arbitrumParams'),
      nonce: '37',
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const getChain = (nonce: string) => {
  try {
    Object.keys(chainData).find((key: string) => {
      const item: ChainConfig | ChainConfig[] = chainData[key];
      if (Array.isArray(item)) {
        return item.find((i) => i.nonce == nonce);
      } else {
        if (item.nonce == nonce) return item;
      }
    });
  } catch (chain) {
    return chain as ChainConfig;
  }
};
