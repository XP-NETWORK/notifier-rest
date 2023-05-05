import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

type TStatus = 'SUCCESS' | 'FAILURE';

@Entity()
export default class NoWhitelistStore {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  contractAddress: string;

  @Property()
  collectionAddress: string;

  @Property()
  chainNonce: number;

  @Property()
  status: TStatus;

  @Property()
  message?: string;

  constructor({
    contractAddress,
    chainNonce,
    collectionAddress,
    status,
  }: {
    contractAddress: string;
    chainNonce: number;
    collectionAddress: string;
    status: TStatus;
  }) {
    this.contractAddress = contractAddress;
    this.chainNonce = chainNonce;
    this.collectionAddress = collectionAddress;
    this.status = status;
  }
}
