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

  @Property()
  isOpenSeaCollection: boolean;

  @Property()
  openSeaCollectionIdentifier: string;

  constructor(
    chainNonce: number,
    contract: string,
    isWhiteListed: boolean,
    isOpenSeaCollection: boolean,
    openSeaCollectionIdentifier: string
  ) {
    this.chainNonce = chainNonce;
    this.contract = contract;
    this.isWhiteListed = isWhiteListed;
    this.isOpenSeaCollection = isOpenSeaCollection;
    this.openSeaCollectionIdentifier = openSeaCollectionIdentifier;
  }
}
