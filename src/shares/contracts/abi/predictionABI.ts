export const predictionABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'eventId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'predictNum',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'CashBackClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'idx', type: 'uint256' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'deadlineTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'helperAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'odds',
        type: 'uint256[]',
      },
      { indexed: false, internalType: 'string', name: 'datas', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'pro', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'affiliate', type: 'bool' },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_hostFee',
        type: 'uint256',
      },
    ],
    name: 'EventCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'eventId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'LPClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'eventId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'LPDeposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'eventId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'predictNum',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'optionIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'PredictionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'eventId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'predictNum',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'RewardClaimed',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_index', type: 'uint256' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'calculateSponsor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_predictNum', type: 'uint256' },
    ],
    name: 'claimCashBack',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address[]', name: '_tokens', type: 'address[]' },
    ],
    name: 'claimRemainingLP',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_predictNum', type: 'uint256' },
    ],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'claimedLiquidityPool',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[3]', name: '_times', type: 'uint256[3]' },
      { internalType: 'address', name: '_helperAddress', type: 'address' },
      { internalType: 'uint256[]', name: '_odds', type: 'uint256[]' },
      { internalType: 'string', name: '_datas', type: 'string' },
      { internalType: 'address[]', name: '_tokens', type: 'address[]' },
      { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
      { internalType: 'uint256', name: '_pro', type: 'uint256' },
      { internalType: 'bool', name: '_affiliate', type: 'bool' },
      { internalType: 'uint256', name: '_hostFee', type: 'uint256' },
    ],
    name: 'createSingleEvent',
    outputs: [{ internalType: 'uint256', name: '_idx', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address[]', name: '_tokens', type: 'address[]' },
      { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
    ],
    name: 'depositLP',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'efunToken',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_predictNum', type: 'uint256' },
      { internalType: 'bool', name: '_validate', type: 'bool' },
    ],
    name: 'estimateReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_predictNum', type: 'uint256' },
    ],
    name: 'estimateRewardSponsor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eventData',
    outputs: [{ internalType: 'contract IEvent', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eventDataAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeCollector',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_reward', type: 'uint256' },
    ],
    name: 'getAmountHasFee',
    outputs: [
      { internalType: 'uint256', name: 'amountHasFee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'eventId', type: 'uint256' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'getEventInfo',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_eventId', type: 'uint256' }],
    name: 'getFee',
    outputs: [
      { internalType: 'uint256', name: 'hostFee', type: 'uint256' },
      { internalType: 'uint256', name: 'platformFee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_index', type: 'uint256' },
    ],
    name: 'getMaxPayout',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_index', type: 'uint256' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'getPotentialReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'eventId', type: 'uint256' },
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'getPredictInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'predictionAmount',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'predictOptions', type: 'uint256' },
          { internalType: 'bool', name: 'claimed', type: 'bool' },
        ],
        internalType: 'struct EDataTypes.Prediction',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'address[]', name: '_tokens', type: 'address[]' },
    ],
    name: 'getRemainingLP',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'getTokenAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_helperAddress', type: 'address' },
      { internalType: 'address', name: '_eventDataAddress', type: 'address' },
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
    ],
    name: 'hostFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_participateRate', type: 'uint256' },
      { internalType: 'uint256', name: '_oneHundredPrecent', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'liquidityPool',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'liquidityPoolEvent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_helperAddress', type: 'address' },
    ],
    name: 'platFormfeeBefore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_helperAddress', type: 'address' },
    ],
    name: 'platformFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_eventId', type: 'uint256' },
      { internalType: 'uint256[]', name: '_optionIndexs', type: 'uint256[]' },
      { internalType: 'address[]', name: '_tokens', type: 'address[]' },
      { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
    ],
    name: 'predict',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'predictStats',
    outputs: [{ internalType: 'uint256', name: 'value', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'predictions',
    outputs: [
      { internalType: 'uint256', name: 'predictionAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'predictOptions', type: 'uint256' },
      { internalType: 'bool', name: 'claimed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_efunToken', type: 'address' }],
    name: 'setEfunToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_eventData', type: 'address' }],
    name: 'setEventData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_feeCollector', type: 'address' },
    ],
    name: 'setFeeCollector',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
