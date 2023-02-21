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
