import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity()
export class TxStore {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  chainId: number;

  @Property()
  txHash: string;

  constructor(chainId: number, txHash: string) {
    this.chainId = chainId;
    this.txHash = txHash;
  }
}
