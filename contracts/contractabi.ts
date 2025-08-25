export const contractAbi = [
  {
    "type": "function",
    "name": "ADMIN_ROLE",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "DEFAULT_ADMIN_ROLE",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "DISPUTE_ACTIVATION_PERIOD",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "DISPUTE_COOL_DOWN_PERIOD",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "DISPUTE_PERIOD",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_DESCRIPTION_LENGTH",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_DISPUTE_PERIOD",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_EVIDENCE_COUNT",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_VOTE_REASON_LENGTH",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_DESCRIPTION_LENGTH",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_DISPUTE_PERIOD",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_EVIDENCE_COUNT",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_VOTE_REASON_LENGTH",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MODERATOR_ROLE",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "RESOLUTION_PERIOD",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "RESOLVER_ROLE",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "UPGRADE_INTERFACE_VERSION",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "VOTING_PERIOD",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "canCreateDispute",
    "inputs": [{"name": "_user", "type": "address", "internalType": "address"}],
    "outputs": [
      {"name": "canCreate", "type": "bool", "internalType": "bool"},
      {"name": "remainingCooldown", "type": "uint40", "internalType": "uint40"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "castVote",
    "inputs": [
      {"name": "_disputeId", "type": "uint256", "internalType": "uint256"},
      {"name": "_supportsCreator", "type": "bool", "internalType": "bool"},
      {"name": "_reason", "type": "string", "internalType": "string"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "categoryCount",
    "inputs": [{"name": "", "type": "uint8", "internalType": "enum DisputeEvents.DisputeCategory"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createDispute",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct DisputeStorage.CreateDisputeParams",
        "components": [
          {"name": "respondent", "type": "address", "internalType": "address"},
          {"name": "title", "type": "string", "internalType": "string"},
          {"name": "description", "type": "string", "internalType": "string"},
          {"name": "category", "type": "uint8", "internalType": "enum DisputeEvents.DisputeCategory"},
          {"name": "priority", "type": "uint8", "internalType": "enum DisputeStorage.Priority"},
          {"name": "requiresEscrow", "type": "bool", "internalType": "bool"},
          {"name": "escrowAmount", "type": "uint256", "internalType": "uint256"},
          {"name": "customPeriod", "type": "uint40", "internalType": "uint40"},
          {"name": "evidenceDescriptions", "type": "string[]", "internalType": "string[]"},
          {"name": "evidenceHashes", "type": "string[]", "internalType": "string[]"},
          {"name": "evidenceSupportsCreator", "type": "bool[]", "internalType": "bool[]"}
        ]
      }
    ],
    "outputs": [{"name": "disputeId", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "disputeCounter",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "disputeEvidences",
    "inputs": [
      {"name": "", "type": "uint256", "internalType": "uint256"},
      {"name": "", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {"name": "description", "type": "string", "internalType": "string"},
      {"name": "documentHash", "type": "string", "internalType": "string"},
      {"name": "submittedBy", "type": "address", "internalType": "address"},
      {"name": "timestamp", "type": "uint40", "internalType": "uint40"},
      {"name": "verified", "type": "bool", "internalType": "bool"},
      {"name": "supportsCreator", "type": "bool", "internalType": "bool"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "disputeToNftToken",
    "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "disputeVotes",
    "inputs": [
      {"name": "", "type": "uint256", "internalType": "uint256"},
      {"name": "", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {"name": "voter", "type": "address", "internalType": "address"},
      {"name": "supportsCreator", "type": "bool", "internalType": "bool"},
      {"name": "reason", "type": "string", "internalType": "string"},
      {"name": "timestamp", "type": "uint40", "internalType": "uint40"},
      {"name": "verified", "type": "bool", "internalType": "bool"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "disputes",
    "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "disputeCreatorAddress", "type": "address", "internalType": "address"},
      {"name": "respondentAddress", "type": "address", "internalType": "address"},
      {"name": "title", "type": "string", "internalType": "string"},
      {"name": "description", "type": "string", "internalType": "string"},
      {"name": "category", "type": "uint8", "internalType": "enum DisputeEvents.DisputeCategory"},
      {"name": "priority", "type": "uint8", "internalType": "enum DisputeStorage.Priority"},
      {"name": "escrowAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "creationTime", "type": "uint40", "internalType": "uint40"},
      {"name": "activationTime", "type": "uint40", "internalType": "uint40"},
      {"name": "endTime", "type": "uint40", "internalType": "uint40"},
      {"name": "votingEndTime", "type": "uint40", "internalType": "uint40"},
      {"name": "resolutionDeadline", "type": "uint40", "internalType": "uint40"},
      {"name": "status", "type": "uint8", "internalType": "enum DisputeEvents.DisputeStatus"},
      {"name": "creatorVotes", "type": "uint256", "internalType": "uint256"},
      {"name": "respondentVotes", "type": "uint256", "internalType": "uint256"},
      {"name": "winner", "type": "address", "internalType": "address"},
      {"name": "winnerNftTokenId", "type": "uint256", "internalType": "uint256"},
      {"name": "resolutionSummary", "type": "string", "internalType": "string"},
      {"name": "requiresEscrow", "type": "bool", "internalType": "bool"},
      {"name": "votingStartTime", "type": "uint40", "internalType": "uint40"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "evidenceSubmitters",
    "inputs": [
      {"name": "", "type": "uint256", "internalType": "uint256"},
      {"name": "", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getApproved",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCurrentTokenId",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDisputeBasicInfo",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "creator", "type": "address", "internalType": "address"},
      {"name": "respondent", "type": "address", "internalType": "address"},
      {"name": "title", "type": "string", "internalType": "string"},
      {"name": "description", "type": "string", "internalType": "string"},
      {"name": "category", "type": "uint8", "internalType": "enum DisputeEvents.DisputeCategory"},
      {"name": "priority", "type": "uint8", "internalType": "enum DisputeStorage.Priority"},
      {"name": "status", "type": "uint8", "internalType": "enum DisputeEvents.DisputeStatus"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDisputeEvidence",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {
        "type": "tuple[]",
        "internalType": "struct DisputeStorage.Evidence[]",
        "components": [
          {"name": "description", "type": "string", "internalType": "string"},
          {"name": "documentHash", "type": "string", "internalType": "string"},
          {"name": "submittedBy", "type": "address", "internalType": "address"},
          {"name": "timestamp", "type": "uint40", "internalType": "uint40"},
          {"name": "verified", "type": "bool", "internalType": "bool"},
          {"name": "supportsCreator", "type": "bool", "internalType": "bool"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDisputeResults",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "creatorVotes", "type": "uint256", "internalType": "uint256"},
      {"name": "respondentVotes", "type": "uint256", "internalType": "uint256"},
      {"name": "winner", "type": "address", "internalType": "address"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDisputeTimestamps",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "creationTime", "type": "uint40", "internalType": "uint40"},
      {"name": "endTime", "type": "uint40", "internalType": "uint40"},
      {"name": "votingEndTime", "type": "uint40", "internalType": "uint40"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDisputeVotes",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {
        "type": "tuple[]",
        "internalType": "struct DisputeStorage.Vote[]",
        "components": [
          {"name": "voter", "type": "address", "internalType": "address"},
          {"name": "supportsCreator", "type": "bool", "internalType": "bool"},
          {"name": "reason", "type": "string", "internalType": "string"},
          {"name": "timestamp", "type": "uint40", "internalType": "uint40"},
          {"name": "verified", "type": "bool", "internalType": "bool"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getEvidenceSubmitters",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "address[]", "internalType": "address[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRoleAdmin",
    "inputs": [{"name": "role", "type": "bytes32", "internalType": "bytes32"}],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserDisputes",
    "inputs": [{"name": "_user", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "grantRole",
    "inputs": [
      {"name": "role", "type": "bytes32", "internalType": "bytes32"},
      {"name": "account", "type": "address", "internalType": "address"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasRole",
    "inputs": [
      {"name": "role", "type": "bytes32", "internalType": "bytes32"},
      {"name": "account", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasSubmittedEvidence",
    "inputs": [
      {"name": "", "type": "uint256", "internalType": "uint256"},
      {"name": "", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasVoted",
    "inputs": [
      {"name": "", "type": "uint256", "internalType": "uint256"},
      {"name": "", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initialize",
    "inputs": [{"name": "_admin", "type": "address", "internalType": "address"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isApprovedForAll",
    "inputs": [
      {"name": "owner", "type": "address", "internalType": "address"},
      {"name": "operator", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isBlacklisted",
    "inputs": [{"name": "", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lastDisputeTime",
    "inputs": [{"name": "", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint40", "internalType": "uint40"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nftTokenToDispute",
    "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "proxiableUUID",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceRole",
    "inputs": [
      {"name": "role", "type": "bytes32", "internalType": "bytes32"},
      {"name": "callerConfirmation", "type": "address", "internalType": "address"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resolveDispute",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeRole",
    "inputs": [
      {"name": "role", "type": "bytes32", "internalType": "bytes32"},
      {"name": "account", "type": "address", "internalType": "address"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {"name": "from", "type": "address", "internalType": "address"},
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {"name": "from", "type": "address", "internalType": "address"},
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"},
      {"name": "data", "type": "bytes", "internalType": "bytes"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setApprovalForAll",
    "inputs": [
      {"name": "operator", "type": "address", "internalType": "address"},
      {"name": "approved", "type": "bool", "internalType": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setUserBlacklist",
    "inputs": [
      {"name": "_user", "type": "address", "internalType": "address"},
      {"name": "_blacklisted", "type": "bool", "internalType": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "startVoting",
    "inputs": [{"name": "_disputeId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitEvidence",
    "inputs": [
      {"name": "_disputeId", "type": "uint256", "internalType": "uint256"},
      {"name": "_description", "type": "string", "internalType": "string"},
      {"name": "_documentHash", "type": "string", "internalType": "string"},
      {"name": "_supportsCreator", "type": "bool", "internalType": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [{"name": "interfaceId", "type": "bytes4", "internalType": "bytes4"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {"name": "from", "type": "address", "internalType": "address"},
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferTieNFT",
    "inputs": [
      {"name": "_tokenId", "type": "uint256", "internalType": "uint256"},
      {"name": "_to", "type": "address", "internalType": "address"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "upgradeToAndCall",
    "inputs": [
      {"name": "newImplementation", "type": "address", "internalType": "address"},
      {"name": "data", "type": "bytes", "internalType": "bytes"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "version",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "userDisputeCount",
    "inputs": [{"name": "", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "userDisputes",
    "inputs": [
      {"name": "", "type": "address", "internalType": "address"},
      {"name": "", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  }
];
