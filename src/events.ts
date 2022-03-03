export type TransferEvent = {
  readonly to: string;
  readonly value: BigInt;
  readonly read_cnt: number;
};

export type ServerEvents = {
  // eslint-disable-next-line functional/no-return-void
  readonly 'tron:bridge_tx': (tx_hash: string) => void;
  // eslint-disable-next-line functional/no-return-void
  readonly 'web3:bridge_tx': (chain: number, tx_hash: string) => void;
  // eslint-disable-next-line functional/no-return-void
  readonly 'algorand:bridge_tx': (
    action_id: string,
    chain_nonce: number,
    target_address: string,
    transaction_fees: string,
    nft_url: string
  ) => void;
  readonly 'tezos:bridge_tx': (tx_hash: string) => void;
  readonly 'elrond:bridge_tx': (
    tx_hash: string,
    sender: string,
    uris: string[],
    action_id: string
  ) => void;
};

export type ClientEvents = {
  // eslint-disable-next-line functional/no-return-void
  readonly dummy: () => void;
};
