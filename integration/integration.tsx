"use client";

import { useState } from "react";
import { useChainId, useReadContract, useWriteContract } from "wagmi";
import { contractAbi } from "@/contracts/contractabi";
import { contractAddress } from "@/contracts/contractaddress";

// Define the return type based on your smart contract function getDisputeBasicInfo
// This matches the return values from your smart contract:
// function getDisputeBasicInfo(uint256 _disputeId) external view returns (
//     address creator, address respondent, string memory title, string memory description,
//     category, Priority priority, DisputeStatus status
// )
type DisputeBasicInfo = [
  string, // creator address (address)
  string, // respondent address (address)  
  string, // title (string)
  string, // description (string)
  number, // category (DisputeCategory enum)
  number, // priority (Priority enum: 0=Low, 1=Medium, 2=High, 3=Critical)
  number  // status (enum)
];

// Define the return type for getDisputeTimestamps
type DisputeTimestamps = [
  number, // creationTime (uint40)
  number, // endTime (uint40)
  number  // votingEndTime (uint40)
];

// Define the return type for getDisputeResults
type DisputeResults = [
  number, // creatorVotes (uint256)
  number, // respondentVotes (uint256)
  string  // winner (address)
];

// Define the return type for getDisputeVotes
type Vote = {
  voter: string;
  supportsCreator: boolean;
  reason: string;
  timestamp: number;
  verified: boolean;
};

// Define the return type for getDisputeEvidence
type Evidence = {
  description: string;
  documentHash: string;
  submittedBy: string;
  timestamp: number;
  verified: boolean;
  supportsCreator: boolean;
};

// Define the return type for canCreateDispute
type CanCreateDispute = [
  boolean, // canCreate
  number   // remainingCooldown (uint40)
];

// Define the CreateDisputeParams type based on your smart contract struct
type CreateDisputeParams = {
  respondent: string;
  title: string;
  description: string;
  category: number; // DisputeCategory enum
  priority: number; // Priority enum: 0=Low, 1=Medium, 2=High, 3=Critical
  requiresEscrow: boolean;
  escrowAmount: string; // BigInt as string
  customPeriod: number; // uint40
  evidenceDescriptions: string[];
  evidenceHashes: string[];
  evidenceSupportsCreator: boolean[];
};

// Define the Evidence submission type
type EvidenceSubmission = {
  description: string;
  documentHash: string;
  supportsCreator: boolean;
};

// Define the Vote submission type
type VoteSubmission = {
  supportsCreator: boolean;
  reason: string;
};

export default function Integration() {
  const [disputeId, setDisputeId] = useState<number>(1);
  const [userAddress, setUserAddress] = useState<string>("");
  const chainId = useChainId();
  
  console.log("Current chain ID:", chainId);

  // Create Dispute - Write Contract Hook
  const { writeContract: createDisputeContract, isPending: isCreatePending, isSuccess: isCreateSuccess, isError: isCreateError, error: createError } = useWriteContract();

  // Submit Evidence - Write Contract Hook
  const { writeContract: submitEvidenceContract, isPending: isEvidencePending, isSuccess: isEvidenceSuccess, isError: isEvidenceError, error: evidenceError } = useWriteContract();

  // Start Voting - Write Contract Hook
  const { writeContract: startVotingContract, isPending: isVotingPending, isSuccess: isVotingSuccess, isError: isVotingError, error: votingError } = useWriteContract();

  // Cast Vote - Write Contract Hook
  const { writeContract: castVoteContract, isPending: isVotePending, isSuccess: isVoteSuccess, isError: isVoteError, error: voteError } = useWriteContract();

  // Resolve Dispute - Write Contract Hook
  const { writeContract: resolveDisputeContract, isPending: isResolvePending, isSuccess: isResolveSuccess, isError: isResolveError, error: resolveError } = useWriteContract();

  // Form state for creating disputes
  const [disputeForm, setDisputeForm] = useState<CreateDisputeParams>({
    respondent: "",
    title: "",
    description: "",
    category: 0,
    priority: 0,
    requiresEscrow: false,
    escrowAmount: "0",
    customPeriod: 0,
    evidenceDescriptions: [""],
    evidenceHashes: [""],
    evidenceSupportsCreator: [true]
  });

  // Form state for submitting evidence
  const [evidenceForm, setEvidenceForm] = useState<EvidenceSubmission>({
    description: "",
    documentHash: "",
    supportsCreator: true
  });

  // Form state for casting votes
  const [voteForm, setVoteForm] = useState<VoteSubmission>({
    supportsCreator: true,
    reason: ""
  });

  // Read contract data for dispute basic info
  const { 
    data: disputeBasicInfo, 
    isError: isReadError, 
    isLoading: isReadLoading,
    error: readError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getDisputeBasicInfo',
    args: [disputeId],
  }) as { 
    data: DisputeBasicInfo | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for dispute timestamps
  const { 
    data: disputeTimestamps, 
    isError: isTimestampsError, 
    isLoading: isTimestampsLoading,
    error: timestampsError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getDisputeTimestamps',
    args: [disputeId],
  }) as { 
    data: DisputeTimestamps | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for dispute results
  const { 
    data: disputeResults, 
    isError: isResultsError, 
    isLoading: isResultsLoading,
    error: resultsError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getDisputeResults',
    args: [disputeId],
  }) as { 
    data: DisputeResults | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for dispute votes
  const { 
    data: disputeVotes, 
    isError: isVotesError, 
    isLoading: isVotesLoading,
    error: votesError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getDisputeVotes',
    args: [disputeId],
  }) as { 
    data: Vote[] | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for dispute evidence
  const { 
    data: disputeEvidence, 
    isError: isEvidenceReadError, 
    isLoading: isEvidenceLoading,
    error: evidenceReadError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getDisputeEvidence',
    args: [disputeId],
  }) as { 
    data: Evidence[] | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for evidence submitters
  const { 
    data: evidenceSubmitters, 
    isError: isSubmittersError, 
    isLoading: isSubmittersLoading,
    error: submittersError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getEvidenceSubmitters',
    args: [disputeId],
  }) as { 
    data: string[] | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for user disputes
  const { 
    data: userDisputes, 
    isError: isUserDisputesError, 
    isLoading: isUserDisputesLoading,
    error: userDisputesError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getUserDisputes',
    args: [userAddress],
  }) as { 
    data: number[] | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for current token ID
  const { 
    data: currentTokenId, 
    isError: isTokenIdError, 
    isLoading: isTokenIdLoading,
    error: tokenIdError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getCurrentTokenId',
    args: [],
  }) as { 
    data: number | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for can create dispute
  const { 
    data: canCreateDisputeData, 
    isError: isCanCreateError, 
    isLoading: isCanCreateLoading,
    error: canCreateError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'canCreateDispute',
    args: [userAddress],
  }) as { 
    data: CanCreateDispute | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Read contract data for version
  const { 
    data: version, 
    isError: isVersionError, 
    isLoading: isVersionLoading,
    error: versionError 
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'version',
    args: [],
  }) as { 
    data: string | undefined; 
    isError: boolean; 
    isLoading: boolean; 
    error: Error | null; 
  };

  // Function to create a dispute
  const createDispute = async () => {
    try {
      // Validate required fields
      if (!disputeForm.respondent || !disputeForm.title || !disputeForm.description) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate evidence arrays have same length
      if (disputeForm.evidenceDescriptions.length !== disputeForm.evidenceHashes.length ||
          disputeForm.evidenceDescriptions.length !== disputeForm.evidenceSupportsCreator.length) {
        alert("Evidence arrays must have the same length");
        return;
      }

      // Convert escrow amount to BigInt (wei)
      const escrowAmountWei = disputeForm.requiresEscrow ? BigInt(disputeForm.escrowAmount) * BigInt(10 ** 18) : BigInt(0);

      // Call the smart contract
      createDisputeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createDispute',
        args: [disputeForm],
        value: escrowAmountWei, // Send ETH if escrow is required
      });

    } catch (error) {
      console.error("Error creating dispute:", error);
    }
  };

  // Function to submit evidence
  const submitEvidence = async () => {
    try {
      // Validate required fields
      if (!evidenceForm.description || !evidenceForm.documentHash) {
        alert("Please fill in all evidence fields");
        return;
      }

      // Validate description length (from your smart contract constants)
      if (evidenceForm.description.length < 10 || evidenceForm.description.length > 1000) {
        alert("Description must be between 10 and 1000 characters");
        return;
      }

      // Call the smart contract
      submitEvidenceContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'submitEvidence',
        args: [
          disputeId,
          evidenceForm.description,
          evidenceForm.documentHash,
          evidenceForm.supportsCreator
        ],
      });

      // Reset form after submission
      setEvidenceForm({
        description: "",
        documentHash: "",
        supportsCreator: true
      });

    } catch (error) {
      console.error("Error submitting evidence:", error);
    }
  };

  // Function to start voting
  const startVoting = async () => {
    try {
      // Call the smart contract
      startVotingContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'startVoting',
        args: [disputeId],
      });

    } catch (error) {
      console.error("Error starting voting:", error);
    }
  };

  // Function to cast a vote
  const castVote = async () => {
    try {
      // Validate required fields
      if (!voteForm.reason) {
        alert("Please provide a reason for your vote");
        return;
      }

      // Validate reason length (from your smart contract constants)
      if (voteForm.reason.length < 5 || voteForm.reason.length > 500) {
        alert("Reason must be between 5 and 500 characters");
        return;
      }

      // Call the smart contract
      castVoteContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'castVote',
        args: [
          disputeId,
          voteForm.supportsCreator,
          voteForm.reason
        ],
      });

      // Reset form after submission
      setVoteForm({
        supportsCreator: true,
        reason: ""
      });

    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  // Function to resolve dispute
  const resolveDispute = async () => {
    try {
      // Call the smart contract
      resolveDisputeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'resolveDispute',
        args: [disputeId],
      });

    } catch (error) {
      console.error("Error resolving dispute:", error);
    }
  };

  // Function to add evidence field
  const addEvidenceField = () => {
    setDisputeForm(prev => ({
      ...prev,
      evidenceDescriptions: [...prev.evidenceDescriptions, ""],
      evidenceHashes: [...prev.evidenceHashes, ""],
      evidenceSupportsCreator: [...prev.evidenceSupportsCreator, true]
    }));
  };

  // Function to remove evidence field
  const removeEvidenceField = (index: number) => {
    setDisputeForm(prev => ({
      ...prev,
      evidenceDescriptions: prev.evidenceDescriptions.filter((_, i) => i !== index),
      evidenceHashes: prev.evidenceHashes.filter((_, i) => i !== index),
      evidenceSupportsCreator: prev.evidenceSupportsCreator.filter((_, i) => i !== index)
    }));
  };

  // Function to update evidence field
  const updateEvidenceField = (index: number, field: keyof CreateDisputeParams, value: any) => {
    setDisputeForm(prev => ({
      ...prev,
      [field]: prev[field as keyof CreateDisputeParams] instanceof Array 
        ? (prev[field as keyof CreateDisputeParams] as any[]).map((item, i) => 
            i === index ? value : item
          )
        : value
    }));
  };

  // Function to manually trigger getting dispute info
  async function getDisputeInfo(number: number): Promise<void> {
    try {
      console.log(`Manually getting dispute info for ID: ${number}`);
      // You could add additional logic here if needed
    } catch (error) {
      console.error("Error getting dispute info:", error);
    }
  }

  // Helper function to get priority name from number
  const getPriorityName = (priority: number): string => {
    switch (priority) {
      case 0: return "Low";
      case 1: return "Medium";
      case 2: return "High";
      case 3: return "Critical";
      default: return "Unknown";
    }
  };

  // Helper function to get status name from number
  const getStatusName = (status: number): string => {
    switch (status) {
      case 0: return "Pending";
      case 1: return "Active";
      case 2: return "UnderReview";
      case 3: return "Voting";
      case 4: return "Resolved";
      default: return "Unknown";
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div>
      <h1>Dispute Integration</h1>
      
      {/* Contract Version */}
      <div>
        <h2>Contract Information</h2>
        {version && <p>Version: {version}</p>}
        {isVersionError && <p>Error loading version: {versionError?.message}</p>}
      </div>

      <hr />

      {/* Create Dispute Form */}
      <div>
        <h2>Create New Dispute</h2>
        
        <div>
          <label>Respondent Address: </label>
          <input
            type="text"
            value={disputeForm.respondent}
            onChange={(e) => setDisputeForm(prev => ({ ...prev, respondent: e.target.value }))}
            placeholder="0x..."
          />
        </div>

        <div>
          <label>Title: </label>
          <input
            type="text"
            value={disputeForm.title}
            onChange={(e) => setDisputeForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Dispute title"
          />
        </div>

        <div>
          <label>Description: </label>
          <textarea
            value={disputeForm.description}
            onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the dispute"
          />
        </div>

        <div>
          <label>Category: </label>
          <select
            value={disputeForm.category}
            onChange={(e) => setDisputeForm(prev => ({ ...prev, category: Number(e.target.value) }))}
          >
            <option value={0}>Category 0</option>
            <option value={1}>Category 1</option>
            <option value={2}>Category 2</option>
          </select>
        </div>

        <div>
          <label>Priority: </label>
          <select
            value={disputeForm.priority}
            onChange={(e) => setDisputeForm(prev => ({ ...prev, priority: Number(e.target.value) }))}
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
            <option value={3}>Critical</option>
          </select>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={disputeForm.requiresEscrow}
              onChange={(e) => setDisputeForm(prev => ({ ...prev, requiresEscrow: e.target.checked }))}
            />
            Requires Escrow
          </label>
        </div>

        {disputeForm.requiresEscrow && (
          <div>
            <label>Escrow Amount (ETH): </label>
            <input
              type="number"
              step="0.001"
              value={disputeForm.escrowAmount}
              onChange={(e) => setDisputeForm(prev => ({ ...prev, escrowAmount: e.target.value }))}
              placeholder="0.1"
            />
          </div>
        )}

        <div>
          <label>Custom Period (days, 0 for default): </label>
          <input
            type="number"
            value={disputeForm.customPeriod}
            onChange={(e) => setDisputeForm(prev => ({ ...prev, customPeriod: Number(e.target.value) }))}
            placeholder="30"
          />
        </div>

        {/* Evidence Fields */}
        <div>
          <h3>Evidence</h3>
          {disputeForm.evidenceDescriptions.map((desc, index) => (
            <div key={index}>
              <input
                type="text"
                value={desc}
                onChange={(e) => updateEvidenceField(index, 'evidenceDescriptions', e.target.value)}
                placeholder="Evidence description"
              />
              <input
                type="text"
                value={disputeForm.evidenceHashes[index]}
                onChange={(e) => updateEvidenceField(index, 'evidenceHashes', e.target.value)}
                placeholder="Document hash"
              />
              <label>
                <input
                  type="checkbox"
                  checked={disputeForm.evidenceSupportsCreator[index]}
                  onChange={(e) => updateEvidenceField(index, 'evidenceSupportsCreator', e.target.checked)}
                />
                Supports Creator
              </label>
              {disputeForm.evidenceDescriptions.length > 1 && (
                <button onClick={() => removeEvidenceField(index)}>Remove</button>
              )}
            </div>
          ))}
          <button onClick={addEvidenceField}>Add Evidence</button>
        </div>

        <button 
          onClick={createDispute}
          disabled={isCreatePending}
        >
          {isCreatePending ? "Creating..." : "Create Dispute"}
        </button>

        {isCreateSuccess && <div>Dispute created successfully!</div>}
        {isCreateError && <div>Error: {createError?.message}</div>}
      </div>

      <hr />

      {/* Submit Evidence Form */}
      <div>
        <h2>Submit Evidence</h2>
        
        <div>
          <label>Evidence Description: </label>
          <textarea
            value={evidenceForm.description}
            onChange={(e) => setEvidenceForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the evidence (10-1000 characters)"
            minLength={10}
            maxLength={1000}
          />
        </div>

        <div>
          <label>Document Hash: </label>
          <input
            type="text"
            value={evidenceForm.documentHash}
            onChange={(e) => setEvidenceForm(prev => ({ ...prev, documentHash: e.target.value }))}
            placeholder="IPFS hash or document reference"
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={evidenceForm.supportsCreator}
              onChange={(e) => setEvidenceForm(prev => ({ ...prev, supportsCreator: e.target.checked }))}
            />
            Supports Creator
          </label>
        </div>

        <button 
          onClick={submitEvidence}
          disabled={isEvidencePending}
        >
          {isEvidencePending ? "Submitting..." : "Submit Evidence"}
        </button>

        {isEvidenceSuccess && <div>Evidence submitted successfully!</div>}
        {isEvidenceError && <div>Error: {evidenceError?.message}</div>}
      </div>

      <hr />

      {/* Start Voting Section */}
      <div>
        <h2>Start Voting</h2>
        
        <button 
          onClick={startVoting}
          disabled={isVotingPending}
        >
          {isVotingPending ? "Starting..." : "Start Voting"}
        </button>

        {isVotingSuccess && <div>Voting started successfully!</div>}
        {isVotingError && <div>Error: {votingError?.message}</div>}
      </div>

      <hr />

      {/* Cast Vote Form */}
      <div>
        <h2>Cast Vote</h2>
        
        <div>
          <label>
            <input
              type="checkbox"
              checked={voteForm.supportsCreator}
              onChange={(e) => setVoteForm(prev => ({ ...prev, supportsCreator: e.target.checked }))}
            />
            Support Creator
          </label>
        </div>

        <div>
          <label>Reason: </label>
          <textarea
            value={voteForm.reason}
            onChange={(e) => setVoteForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Explain your vote (5-500 characters)"
            minLength={5}
            maxLength={500}
          />
        </div>

        <button 
          onClick={castVote}
          disabled={isVotePending}
        >
          {isVotePending ? "Casting..." : "Cast Vote"}
        </button>

        {isVoteSuccess && <div>Vote cast successfully!</div>}
        {isVoteError && <div>Error: {voteError?.message}</div>}
      </div>

      <hr />

      {/* Resolve Dispute Section */}
      <div>
        <h2>Resolve Dispute</h2>
        
        <p>This will resolve the dispute after voting has ended and determine the winner.</p>
        
        <button 
          onClick={resolveDispute}
          disabled={isResolvePending}
        >
          {isResolvePending ? "Resolving..." : "Resolve Dispute"}
        </button>

        {isResolveSuccess && <div>Dispute resolved successfully!</div>}
        {isResolveError && <div>Error: {resolveError?.message}</div>}
      </div>

      <hr />

      {/* View Dispute Section */}
      <div>
        <label>Dispute ID: </label>
        <input
          type="number"
          value={disputeId}
          onChange={(e) => setDisputeId(Number(e.target.value))}
          min="1"
        />
      </div>

      <div>
        <h2>Dispute Basic Information</h2>
        
        {isReadLoading && <div>Loading...</div>}
        
        {isReadError && <div>Error: {readError?.message}</div>}
        
        {disputeBasicInfo && (
          <div>
            <p>Creator: {disputeBasicInfo[0]}</p>
            <p>Respondent: {disputeBasicInfo[1]}</p>
            <p>Title: {disputeBasicInfo[2]}</p>
            <p>Description: {disputeBasicInfo[3]}</p>
            <p>Category: {disputeBasicInfo[4]}</p>
            <p>Priority: {getPriorityName(disputeBasicInfo[5])} ({disputeBasicInfo[5]})</p>
            <p>Status: {getStatusName(disputeBasicInfo[6])} ({disputeBasicInfo[6]})</p>
          </div>
        )}
      </div>

      <hr />

      {/* Dispute Timestamps */}
      <div>
        <h2>Dispute Timestamps</h2>
        
        {isTimestampsLoading && <div>Loading timestamps...</div>}
        
        {isTimestampsError && <div>Error: {timestampsError?.message}</div>}
        
        {disputeTimestamps && (
          <div>
            <p>Creation Time: {formatTimestamp(disputeTimestamps[0])}</p>
            <p>End Time: {formatTimestamp(disputeTimestamps[1])}</p>
            <p>Voting End Time: {formatTimestamp(disputeTimestamps[2])}</p>
          </div>
        )}
      </div>

      <hr />

      {/* Dispute Results */}
      <div>
        <h2>Dispute Results</h2>
        
        {isResultsLoading && <div>Loading results...</div>}
        
        {isResultsError && <div>Error: {resultsError?.message}</div>}
        
        {disputeResults && (
          <div>
            <p>Creator Votes: {disputeResults[0]}</p>
            <p>Respondent Votes: {disputeResults[1]}</p>
            <p>Winner: {disputeResults[2] || "Not yet determined"}</p>
          </div>
        )}
      </div>

      <hr />

      {/* Dispute Votes */}
      <div>
        <h2>Dispute Votes</h2>
        
        {isVotesLoading && <div>Loading votes...</div>}
        
        {isVotesError && <div>Error: {votesError?.message}</div>}
        
        {disputeVotes && disputeVotes.length > 0 ? (
          <div>
            {disputeVotes.map((vote, index) => (
              <div key={index} style={{border: '1px solid #ccc', padding: '10px', margin: '5px'}}>
                <p>Voter: {vote.voter}</p>
                <p>Supports Creator: {vote.supportsCreator ? 'Yes' : 'No'}</p>
                <p>Reason: {vote.reason}</p>
                <p>Timestamp: {formatTimestamp(vote.timestamp)}</p>
                <p>Verified: {vote.verified ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No votes yet</p>
        )}
      </div>

      <hr />

      {/* Dispute Evidence */}
      <div>
        <h2>Dispute Evidence</h2>
        
        {isEvidenceLoading && <div>Loading evidence...</div>}
        
        {isEvidenceReadError && <div>Error: {evidenceReadError?.message}</div>}
        
        {disputeEvidence && disputeEvidence.length > 0 ? (
          <div>
            {disputeEvidence.map((evidence, index) => (
              <div key={index} style={{border: '1px solid #ccc', padding: '10px', margin: '5px'}}>
                <p>Description: {evidence.description}</p>
                <p>Document Hash: {evidence.documentHash}</p>
                <p>Submitted By: {evidence.submittedBy}</p>
                <p>Timestamp: {formatTimestamp(evidence.timestamp)}</p>
                <p>Verified: {evidence.verified ? 'Yes' : 'No'}</p>
                <p>Supports Creator: {evidence.supportsCreator ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No evidence yet</p>
        )}
      </div>

      <hr />

      {/* Evidence Submitters */}
      <div>
        <h2>Evidence Submitters</h2>
        
        {isSubmittersLoading && <div>Loading submitters...</div>}
        
        {isSubmittersError && <div>Error: {submittersError?.message}</div>}
        
        {evidenceSubmitters && evidenceSubmitters.length > 0 ? (
          <div>
            {evidenceSubmitters.map((submitter, index) => (
              <p key={index}>{submitter}</p>
            ))}
          </div>
        ) : (
          <p>No evidence submitters yet</p>
        )}
      </div>

      <hr />

      {/* User Disputes */}
      <div>
        <h2>User Disputes</h2>
        
        <div>
          <label>User Address: </label>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
        
        {isUserDisputesLoading && <div>Loading user disputes...</div>}
        
        {isUserDisputesError && <div>Error: {userDisputesError?.message}</div>}
        
        {userDisputes && userDisputes.length > 0 ? (
          <div>
            {userDisputes.map((disputeId, index) => (
              <p key={index}>Dispute ID: {disputeId}</p>
            ))}
          </div>
        ) : (
          <p>No disputes found for this user</p>
        )}
      </div>

      <hr />

      {/* Current Token ID */}
      <div>
        <h2>Current Token ID</h2>
        
        {isTokenIdLoading && <div>Loading token ID...</div>}
        
        {isTokenIdError && <div>Error: {tokenIdError?.message}</div>}
        
        {currentTokenId !== undefined && (
          <p>Current Token ID: {currentTokenId}</p>
        )}
      </div>

      <hr />

      {/* Can Create Dispute */}
      <div>
        <h2>Can Create Dispute</h2>
        
        {isCanCreateLoading && <div>Loading...</div>}
        
        {isCanCreateError && <div>Error: {canCreateError?.message}</div>}
        
        {canCreateDisputeData && (
          <div>
            <p>Can Create: {canCreateDisputeData[0] ? 'Yes' : 'No'}</p>
            <p>Remaining Cooldown: {canCreateDisputeData[1]} seconds</p>
          </div>
        )}
      </div>

      <button onClick={() => getDisputeInfo(disputeId)}>
        Refresh Dispute Info
      </button>
    </div>
  );
}