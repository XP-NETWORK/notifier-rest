import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity()
export class WhiteListStore {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  chainNonce: number;

  @Property()
  contract: string;

  @Property()
  isWhiteListed: boolean;

  constructor(chainNonce: number, contract: string) {
    this.chainNonce = chainNonce;
    this.contract = contract;
    this.isWhiteListed = false;
  }
}
