export const UserStore1155ABI = [
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_noWhitelistUtils',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'actionId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'chainNonce',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'txFees',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'to',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'contractAddr',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'tokenData',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'mintWith',
        type: 'string',
      },
    ],
    name: 'TransferErc1155',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'actionId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'chainNonce',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'txFees',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'to',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'contractAddr',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'mintWith',
        type: 'string',
      },
    ],
    name: 'TransferErc1155Batch',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC1155MetadataURI',
        name: 'erc1155Contract',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: 'chainNonce',
        type: 'uint64',
      },
      {
        internalType: 'string',
        name: 'to',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'mintWith',
        type: 'string',
      },
    ],
    name: 'freezeErc1155',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC1155',
        name: 'erc1155Contract',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: 'tokenIds',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'ones',
        type: 'uint256[]',
      },
      {
        internalType: 'uint64',
        name: 'chainNonce',
        type: 'uint64',
      },
      {
        internalType: 'string',
        name: 'to',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'mintWith',
        type: 'string',
      },
    ],
    name: 'freezeErc1155Batch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'noWhitelistUtils',
    outputs: [
      {
        internalType: 'contract INoWhitelistUtils',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'actionId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'contract IERC1155',
        name: 'contractAddr',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'sig',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'proofAddr',
        type: 'address',
      },
    ],
    name: 'validateUnfreezeErc1155',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'actionId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
      {
        internalType: 'contract IERC1155[]',
        name: 'contractAddrs',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'sig',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'proofAddr',
        type: 'address',
      },
    ],
    name: 'validateUnfreezeErc1155Batch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
