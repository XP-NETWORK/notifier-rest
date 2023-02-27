import { config } from 'dotenv';
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
  node: string;
  contract: string;
  nonce: string;
  id: string;
  actionIdOffset?: number;
}
interface Config {
  web3: ChainConfig[];
}

const chainData: Config = {
  web3: [
    {
      name: 'ABEYCHAIN',
      node: getOrThrow('ABEYCHAIN_RPC_URL'),
      contract: getOrThrow('ABEYCHAIN_MINTER_ADDRESS'),
      nonce: getOrThrow('ABEYCHAIN_NONCE'),
      id: 'abey',
    },
    {
      name: 'AURORA',
      node: getOrThrow('AURORA_RPC_URL'),
      contract: getOrThrow('AURORA_MINTER_ADDRESS'),
      nonce: getOrThrow('AURORA_NONCE'),
      id: 'aurora-near',
    },
    {
      name: 'BSC',
      node: getOrThrow('BSC_RPC_URL'),
      contract: getOrThrow('BSC_MINTER_ADDRESS'),
      nonce: getOrThrow('BSC_NONCE'),
      id: 'binancecoin',
    },
    {
      name: 'ETHEREUM',
      node: getOrThrow('ETHEREUM_RPC_URL'),
      contract: getOrThrow('ETHEREUM_MINTER_ADDRESS'),
      nonce: getOrThrow('ETHEREUM_NONCE'),
      id: 'ethereum',
    },
    {
      name: 'VELAS',
      node: getOrThrow('VELAS_RPC_URL'),
      contract: getOrThrow('VELAS_MINTER_ADDRESS'),
      nonce: getOrThrow('VELAS_NONCE'),
      id: 'velas',
    },
    {
      name: 'POLYGON',
      node: getOrThrow('POLYGON_RPC_URL'),
      contract: getOrThrow('POLYGON_MINTER_ADDRESS'),
      nonce: getOrThrow('POLYGON_NONCE'),
      id: 'matic-network',
    },
    {
      name: 'AVALANCHE',
      node: getOrThrow('AVALANCHE_RPC_URL'),
      contract: getOrThrow('AVALANCHE_MINTER_ADDRESS'),
      nonce: getOrThrow('AVALANCHE_NONCE'),
      id: 'avalanche-2',
    },
    {
      name: 'IOTEX',
      node: getOrThrow('IOTEX_RPC_URL'),
      contract: getOrThrow('IOTEX_MINTER_ADDRESS'),
      nonce: getOrThrow('IOTEX_NONCE'),
      id: 'iotex',
      actionIdOffset: 10,
    },
    {
      name: 'FANTOM',
      node: getOrThrow('FANTOM_RPC_URL'),
      contract: getOrThrow('FANTOM_MINTER_ADDRESS'),
      nonce: getOrThrow('FANTOM_NONCE'),
      id: 'fantom',
    },
    {
      name: 'HARMONY',
      node: getOrThrow('HARMONY_RPC_URL'),
      contract: getOrThrow('HARMONY_MINTER_ADDRESS'),
      nonce: getOrThrow('HARMONY_NONCE'),
      id: 'harmony',
    },
    {
      name: 'GNOSIS',
      node: getOrThrow('GNOSIS_RPC_URL'),
      contract: getOrThrow('GNOSIS_MINTER_ADDRESS'),
      nonce: getOrThrow('GNOSIS_NONCE'),
      id: 'gnosis',
    },
    {
      name: 'FUSE',
      node: getOrThrow('FUSE_RPC_URL'),
      contract: getOrThrow('FUSE_MINTER_ADDRESS'),
      nonce: getOrThrow('FUSE_NONCE'),
      id: 'fuse-network-token',
    },
    {
      name: 'GATECHAIN',
      node: getOrThrow('GATECHAIN_RPC_URL'),
      contract: getOrThrow('GATECHAIN_MINTER_ADDRESS'),
      nonce: getOrThrow('GATECHAIN_NONCE'),
      id: 'gatechain-wormhole',
    },
    {
      name: 'VECHAIN',
      node: getOrThrow('VECHAIN_RPC_URL'),
      contract: getOrThrow('VECHAIN_MINTER_ADDRESS'),
      nonce: getOrThrow('VECHAIN_NONCE'),
      id: 'vechain',
    },
    {
      name: 'GODWOKEN',
      node: getOrThrow('GODWOKEN_RPC_URL'),
      contract: getOrThrow('GODWOKEN_MINTER_ADDRESS'),
      nonce: getOrThrow('GODWOKEN_NONCE'),
      id: 'godwoken',
    },
    {
      name: 'MOONBEAM',
      node: getOrThrow('MOONBEAM_RPC_URL'),
      contract: getOrThrow('MOONBEAM_MINTER_ADDRESS'),
      nonce: getOrThrow('MOONBEAM_NONCE'),
      id: 'moonbeam',
    },
    {
      name: 'CADUCEUS',
      node: getOrThrow('CADUCEUS_RPC_URL'),
      contract: getOrThrow('CADUCEUS_MINTER_ADDRESS'),
      nonce: getOrThrow('CADUCEUS_NONCE'),
      id: 'caduceus',
    },
    {
      name: 'OKC',
      node: getOrThrow('OKC_RPC_URL'),
      contract: getOrThrow('OKC_MINTER_ADDRESS'),
      nonce: getOrThrow('OKC_NONCE'),
      id: 'abey',
    },
    {
      name: 'SKALE',
      node: getOrThrow('SKALE_RPC_URL'),
      contract: getOrThrow('SKALE_MINTER_ADDRESS'),
      nonce: getOrThrow('SKALE_NONCE'),
      id: 'abey',
    },
    {
      name: 'ARBITRUM',
      node: getOrThrow('ARBITRUM_RPC_URL'),
      contract: getOrThrow('ARBITRUM_MINTER_ADDRESS'),
      nonce: getOrThrow('ARBITRUM_NONCE'),
      id: 'abey',
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
