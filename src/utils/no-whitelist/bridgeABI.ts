export const NoWhitelistEVMBridgeABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_validatorPKX',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: '_validatorPKYP',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: '_actionCnt',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'HALF_Q',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'Q',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'actionCnt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'collectionAddr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'contractAddr',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'actionId',
        type: 'uint256',
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
    name: 'addNewContractAddress',
    outputs: [],
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
    ],
    name: 'collectionToContract',
    outputs: [
      {
        internalType: 'address',
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
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'consumedActions',
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
        name: '',
        type: 'uint256',
      },
    ],
    name: 'consumedConfigActions',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'contractToCollection',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'incrementor',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pubKeyYParity',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
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
        internalType: 'uint256',
        name: 'sig',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'proofAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'actionHash',
        type: 'uint256',
      },
    ],
    name: 'requireValidatorSig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_actionCnt',
        type: 'uint256',
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
    name: 'setActionCnt',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'signingPubKeyX',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
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
        internalType: 'uint256',
        name: '_signingPubKeyX',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: '_pubKeyYParity',
        type: 'uint8',
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
    name: 'validateUpdateGroupKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
];
