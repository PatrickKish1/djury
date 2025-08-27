"use client";

import { useState } from "react";
import { useChainId, useReadContract, useWriteContract } from "wagmi";
import { bettingContractAbi } from "@/contracts/bettingcontractabi";
import { bettingContractAddress } from "@/contracts/contractaddress";

// Types for betting contract data
type PoolData = {
  exists: boolean;
  resolved: boolean;
  voided: boolean;
  nftRakeBps: number;
  protocolFeeBpsOverride: number;
  winningOutcome: number;
  totalStaked: bigint;
  stakedCreator: bigint;
  stakedRespondent: bigint;
  payoutPool: bigint;
  winnerSideTotal: bigint;
  winnerNftTokenId: bigint;
};

type PayoutPreview = {
  payout: bigint;
  ready: boolean;
};

type UserStake = {
  amount: bigint;
  outcome: number;
};

// Outcome constants
const OUTCOMES = {
  CREATOR: 0,
  RESPONDENT: 1,
  TIE: 2
};

const OUTCOME_NAMES = {
  [OUTCOMES.CREATOR]: "Creator",
  [OUTCOMES.RESPONDENT]: "Respondent", 
  [OUTCOMES.TIE]: "Tie"
};

export default function BettingIntegration() {
  const [disputeId, setDisputeId] = useState<number>(1);
  const [userAddress, setUserAddress] = useState<string>("");
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = useState<number>(OUTCOMES.CREATOR);
  const [nftRakeBps, setNftRakeBps] = useState<string>("");
  const [protocolFeeBps, setProtocolFeeBps] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  
  const chainId = useChainId();
  
  console.log("Current chain ID:", chainId);

  // Contract write hooks
  const { writeContract: createPoolContract, isPending: isCreatePoolPending, isSuccess: isCreatePoolSuccess, isError: isCreatePoolError, error: createPoolError } = useWriteContract();
  const { writeContract: betContract, isPending: isBetPending, isSuccess: isBetSuccess, isError: isBetError, error: betError } = useWriteContract();
  const { writeContract: claimContract, isPending: isClaimPending, isSuccess: isClaimSuccess, isError: isClaimError, error: claimError } = useWriteContract();
  const { writeContract: resolveContract, isPending: isResolvePending, isSuccess: isResolveSuccess, isError: isResolveError, error: resolveError } = useWriteContract();
  const { writeContract: withdrawNftContract, isPending: isWithdrawNftPending, isSuccess: isWithdrawNftSuccess, isError: isWithdrawNftError, error: withdrawNftError } = useWriteContract();

  // Contract read hooks
  const { data: poolData, isError: isPoolError, isLoading: isPoolLoading, error: poolError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'getPool',
    args: [disputeId],
  }) as { data: PoolData | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: payoutPreview, isError: isPayoutError, isLoading: isPayoutLoading, error: payoutError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'previewPayout',
    args: [disputeId, userAddress],
  }) as { data: PayoutPreview | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: userStake, isError: isUserStakeError, isLoading: isUserStakeLoading, error: userStakeError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'userStake',
    args: [disputeId, selectedOutcome, userAddress],
  }) as { data: bigint | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: nftAccruedKWN, isError: isNftAccruedError, isLoading: isNftAccruedLoading, error: nftAccruedError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'nftAccruedKWN',
    args: [tokenId],
  }) as { data: bigint | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: maxBps, isError: isMaxBpsError, isLoading: isMaxBpsLoading, error: maxBpsError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'MAX_BPS',
    args: [],
  }) as { data: number | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: defaultNftRakeBps, isError: isDefaultNftRakeError, isLoading: isDefaultNftRakeLoading, error: defaultNftRakeError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'defaultNftRakeBps',
    args: [],
  }) as { data: number | undefined; isError: boolean; isLoading: boolean; error: defaultNftRakeError };

  const { data: protocolFeeBps, isError: isProtocolFeeError, isLoading: isProtocolFeeLoading, error: protocolFeeError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'protocolFeeBps',
    args: [],
  }) as { data: number | undefined; isError: boolean; isLoading: boolean; error: protocolFeeError };

  const { data: tieSlashBps, isError: isTieSlashError, isLoading: isTieSlashLoading, error: tieSlashError } = useReadContract({
    address: bettingContractAddress,
    abi: bettingContractAbi,
    functionName: 'tieSlashBps',
    args: [],
  }) as { data: number | undefined; isError: boolean; isLoading: boolean; error: tieSlashError };

  // Functions
  const createPool = async () => {
    try {
      if (!disputeId) {
        alert("Please enter a dispute ID");
        return;
      }

      const nftRakeBpsValue = nftRakeBps ? Number(nftRakeBps) : 0;
      const protocolFeeBpsValue = protocolFeeBps ? Number(protocolFeeBps) : 0;

      createPoolContract({
        address: bettingContractAddress,
        abi: bettingContractAbi,
        functionName: 'createPool',
        args: [disputeId, nftRakeBpsValue, protocolFeeBpsValue],
      });

    } catch (error) {
      console.error("Error creating pool:", error);
    }
  };

  const placeBet = async () => {
    try {
      if (!disputeId || !betAmount || !userAddress) {
        alert("Please fill in all required fields");
        return;
      }

      const amountKWN = BigInt(betAmount) * BigInt(10 ** 18); // Convert to wei

      betContract({
        address: bettingContractAddress,
        abi: bettingContractAbi,
        functionName: 'bet',
        args: [disputeId, selectedOutcome, amountKWN],
      });

    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  const claimWinnings = async () => {
    try {
      if (!disputeId) {
        alert("Please enter a dispute ID");
        return;
      }

      claimContract({
        address: bettingContractAddress,
        abi: bettingContractAbi,
        functionName: 'claim',
        args: [disputeId],
      });

    } catch (error) {
      console.error("Error claiming winnings:", error);
    }
  };

  const resolvePool = async () => {
    try {
      if (!disputeId) {
        alert("Please enter a dispute ID");
        return;
      }

      resolveContract({
        address: bettingContractAddress,
        abi: bettingContractAbi,
        functionName: 'resolve',
        args: [disputeId],
      });

    } catch (error) {
      console.error("Error resolving pool:", error);
    }
  };

  const withdrawNftAccrued = async () => {
    try {
      if (!tokenId || !userAddress) {
        alert("Please fill in token ID and user address");
        return;
      }

      withdrawNftContract({
        address: bettingContractAddress,
        abi: bettingContractAbi,
        functionName: 'withdrawNftAccrued',
        args: [BigInt(tokenId), userAddress],
      });

    } catch (error) {
      console.error("Error withdrawing NFT accrued KWN:", error);
    }
  };

  // Helper functions
  const formatBigInt = (value: bigint | undefined): string => {
    if (!value) return "0";
    return (Number(value) / 10 ** 18).toFixed(6);
  };

  const formatBps = (value: number | undefined): string => {
    if (value === undefined) return "N/A";
    return `${(value / 100).toFixed(2)}%`;
  };

  const getOutcomeName = (outcome: number): string => {
    return OUTCOME_NAMES[outcome as keyof typeof OUTCOME_NAMES] || `Unknown (${outcome})`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Betting Integration</h1>
      
      {/* Contract Constants */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Contract Constants</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Max BPS:</label>
            <span className="text-lg">{maxBps || "Loading..."}</span>
          </div>
          <div>
            <label className="block text-sm font-medium">Default NFT Rake:</label>
            <span className="text-lg">{formatBps(defaultNftRakeBps)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium">Protocol Fee:</label>
            <span className="text-lg">{formatBps(protocolFeeBps)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium">Tie Slash:</label>
            <span className="text-lg">{formatBps(tieSlashBps)}</span>
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dispute ID:</label>
            <input
              type="number"
              value={disputeId}
              onChange={(e) => setDisputeId(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">User Address:</label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0x..."
            />
          </div>
        </div>
      </div>

      {/* Create Pool Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Betting Pool</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">NFT Rake BPS (optional):</label>
            <input
              type="number"
              value={nftRakeBps}
              onChange={(e) => setNftRakeBps(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Default will be used"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Protocol Fee BPS (optional):</label>
            <input
              type="number"
              value={protocolFeeBps}
              onChange={(e) => setProtocolFeeBps(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Default will be used"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={createPool}
              disabled={isCreatePoolPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isCreatePoolPending ? "Creating..." : "Create Pool"}
            </button>
          </div>
        </div>
        {isCreatePoolSuccess && <div className="text-green-600 font-medium">Pool created successfully!</div>}
        {isCreatePoolError && <div className="text-red-600 font-medium">Error: {createPoolError?.message}</div>}
      </div>

      {/* Place Bet Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Place Bet</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bet Amount (KWN):</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0.1"
              step="0.001"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Outcome:</label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={OUTCOMES.CREATOR}>Creator</option>
              <option value={OUTCOMES.RESPONDENT}>Respondent</option>
              <option value={OUTCOMES.TIE}>Tie</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={placeBet}
              disabled={isBetPending}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isBetPending ? "Placing..." : "Place Bet"}
            </button>
          </div>
        </div>
        {isBetSuccess && <div className="text-green-600 font-medium">Bet placed successfully!</div>}
        {isBetError && <div className="text-red-600 font-medium">Error: {betError?.message}</div>}
      </div>

      {/* Pool Information */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Pool Information</h2>
        {isPoolLoading && <div className="text-center py-4">Loading pool data...</div>}
        {isPoolError && <div className="text-red-600 font-medium">Error: {poolError?.message}</div>}
        
        {poolData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Pool Status</h3>
              <p>Exists: {poolData.exists ? "Yes" : "No"}</p>
              <p>Resolved: {poolData.resolved ? "Yes" : "No"}</p>
              <p>Voided: {poolData.voided ? "Yes" : "No"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Staking</h3>
              <p>Total Staked: {formatBigInt(poolData.totalStaked)} KWN</p>
              <p>Creator Staked: {formatBigInt(poolData.stakedCreator)} KWN</p>
              <p>Respondent Staked: {formatBigInt(poolData.stakedRespondent)} KWN</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Payouts</h3>
              <p>Payout Pool: {formatBigInt(poolData.payoutPool)} KWN</p>
              <p>Winner Side Total: {formatBigInt(poolData.winnerSideTotal)} KWN</p>
              <p>Winning Outcome: {getOutcomeName(poolData.winningOutcome)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Fees</h3>
              <p>NFT Rake: {formatBps(poolData.nftRakeBps)}</p>
              <p>Protocol Fee: {formatBps(poolData.protocolFeeBpsOverride)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">NFT</h3>
              <p>Winner NFT Token ID: {poolData.winnerNftTokenId.toString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* User Information */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">User Stake</h3>
            {isUserStakeLoading && <div>Loading...</div>}
            {isUserStakeError && <div className="text-red-600">Error: {userStakeError?.message}</div>}
            {userStake !== undefined && (
              <p>Stake: {formatBigInt(userStake)} KWN on {getOutcomeName(selectedOutcome)}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium mb-2">Payout Preview</h3>
            {isPayoutLoading && <div>Loading...</div>}
            {isPayoutError && <div className="text-red-600">Error: {payoutError?.message}</div>}
            {payoutPreview && (
              <div>
                <p>Payout: {formatBigInt(payoutPreview.payout)} KWN</p>
                <p>Ready: {payoutPreview.ready ? "Yes" : "No"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={claimWinnings}
            disabled={isClaimPending}
            className="bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {isClaimPending ? "Claiming..." : "Claim Winnings"}
          </button>
          <button
            onClick={resolvePool}
            disabled={isResolvePending}
            className="bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            {isResolvePending ? "Resolving..." : "Resolve Pool"}
          </button>
        </div>
        {isClaimSuccess && <div className="text-green-600 font-medium mt-2">Winnings claimed successfully!</div>}
        {isClaimError && <div className="text-red-600 font-medium mt-2">Error: {claimError?.message}</div>}
        {isResolveSuccess && <div className="text-green-600 font-medium mt-2">Pool resolved successfully!</div>}
        {isResolveError && <div className="text-red-600 font-medium mt-2">Error: {resolveError?.message}</div>}
      </div>

      {/* NFT Withdrawal */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">NFT Withdrawal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Token ID:</label>
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="123"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={withdrawNftAccrued}
              disabled={isWithdrawNftPending}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
            >
              {isWithdrawNftPending ? "Withdrawing..." : "Withdraw NFT Accrued"}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">NFT Accrued KWN</h3>
          {isNftAccruedLoading && <div>Loading...</div>}
          {isNftAccruedError && <div className="text-red-600">Error: {nftAccruedError?.message}</div>}
          {nftAccruedKWN !== undefined && (
            <p>Accrued: {formatBigInt(nftAccruedKWN)} KWN</p>
          )}
        </div>

        {isWithdrawNftSuccess && <div className="text-green-600 font-medium mt-2">NFT accrued KWN withdrawn successfully!</div>}
        {isWithdrawNftError && <div className="text-red-600 font-medium mt-2">Error: {withdrawNftError?.message}</div>}
      </div>
    </div>
  );
}