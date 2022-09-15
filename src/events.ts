export type TransferEvent = {
  readonly to: string;
  readonly value: BigInt;
  readonly read_cnt: number;
};

export type ServerEvents = {
  // eslint-disable-next-line functional/no-return-void
  readonly 'tron:bridge_tx': (tx_hash: string) => void;
  // eslint-disable-next-line functional/no-return-void
  // readonly 'web3:bridge_tx': (chain: number, tx_hash: string) => void;
  readonly 'web3:bridge_tx': (
    fromChain: number,
    fromHash: string,
    actionId?: string,
    type?: string,
    toChain?: number,
    txFees?: string,
    senderAddress?: string,
    targetAddress?: string,
    nftUri?: string,
    tokenId?: string,
    contract?: string
  ) => void;
  // eslint-disable-next-line functional/no-return-void
  readonly 'algorand:bridge_tx': (tx_hash: string) => void;
  readonly 'tezos:bridge_tx': (tx_hash: string) => void;
  readonly 'elrond:bridge_tx': (
    tx_hash: string,
    sender: string,
    uris: string[],
    action_id: string
  ) => void;
  readonly 'solana:bridge_tx': (tx_hash: string) => void;
  readonly whitelist_nft: (chain: number, contract: string) => void;
  readonly 'secret:bridge_tx': (tx_hash: string) => void;
  readonly 'dfinity:bridge_tx': (action_id: string) => void;
  readonly 'near:bridge_tx': (tx_hash: string) => void;
  readonly 'aptos:bridge_tx': (tx_hash: string) => void;
};

export type ClientEvents = {
  // eslint-disable-next-line functional/no-return-void
  readonly dummy: () => void;
};
