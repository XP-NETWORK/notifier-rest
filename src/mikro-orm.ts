import { Options } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { mongo_uri } from './config';
import { TxStore } from './db/TxStore';
import { WhiteListStore } from './db/WhiteListStore';

const mikroConf: Options<MongoDriver> = {
  entities: [TxStore, WhiteListStore],
  clientUrl: mongo_uri,
  type: 'mongo',
};

export default mikroConf;
