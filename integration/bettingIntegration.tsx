"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import { bettingContractAbi } from "@/contracts/bettingcontractabi";
import { bettingContractAddress } from "@/contracts/contractaddress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

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

// Outcome constants
const OUTCOMES = {
  CREATOR: 0,
  RESPONDENT: 1,
  TIE: 2
} as const;

const OUTCOME_NAMES = {
  [OUTCOMES.CREATOR]: "Creator",
  [OUTCOMES.RESPONDENT]: "Respondent", 
  [OUTCOMES.TIE]: "Tie"
} as const;

export default function BettingIntegration() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Form state
  const [disputeId, setDisputeId] = useState<string>("");
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = useState<number>(OUTCOMES.CREATOR);
  const [nftRakeBps, setNftRakeBps] = useState<string>("");
  const [protocolFeeBpsInput, setProtocolFeeBpsInput] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  
  // Helper function to get network name
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case base.id:
        return "Base Network";
      case 1:
        return "Ethereum Mainnet";
      case 11155111:
        return "Sepolia Testnet";
      case 137:
        return "Polygon";
      case 56:
        return "BNB Smart Chain";
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  // Contract write hooks
  const { writeContract: createPoolContract, isPending: isCreatePoolPending, data: createPoolHash, error: createPoolWriteError } = useWriteContract();
  const { writeContract: betContract, isPending: isBetPending, data: betHash, error: betWriteError } = useWriteContract();
  const { writeContract: claimContract, isPending: isClaimPending, data: claimHash, error: claimWriteError } = useWriteContract();
  const { writeContract: resolveContract, isPending: isResolvePending, data: resolveHash, error: resolveWriteError } = useWriteContract();
  const { writeContract: withdrawNftContract, isPending: isWithdrawNftPending, data: withdrawNftHash, error: withdrawNftWriteError } = useWriteContract();

  // Transaction receipt hooks
  const { isLoading: isCreatePoolLoading, isSuccess: isCreatePoolSuccess, error: createPoolReceiptError } = useWaitForTransactionReceipt({ hash: createPoolHash });
  const { isLoading: isBetLoading, isSuccess: isBetSuccess, error: betReceiptError } = useWaitForTransactionReceipt({ hash: betHash });
  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess, error: claimReceiptError } = useWaitForTransactionReceipt({ hash: claimHash });
  const { isLoading: isResolveLoading, isSuccess: isResolveSuccess, error: resolveReceiptError } = useWaitForTransactionReceipt({ hash: resolveHash });
  const { isLoading: isWithdrawNftLoading, isSuccess: isWithdrawNftSuccess, error: withdrawNftReceiptError } = useWaitForTransactionReceipt({ hash: withdrawNftHash });

  // Contract read hooks
  const { data: poolData, isError: isPoolError, isLoading: isPoolLoading, error: poolError } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'getPool',
    args: disputeId ? [BigInt(disputeId)] : undefined,
    query: { enabled: !!disputeId && disputeId !== "" }
  }) as { data: PoolData | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: payoutPreview, isError: isPayoutError, isLoading: isPayoutLoading, error: payoutError } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'previewPayout',
    args: disputeId && address ? [BigInt(disputeId), address] : undefined,
    query: { enabled: !!disputeId && !!address && disputeId !== "" }
  }) as { data: PayoutPreview | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: userStake, isError: isUserStakeError, isLoading: isUserStakeLoading, error: userStakeError } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'userStake',
    args: disputeId && address ? [BigInt(disputeId), selectedOutcome, address] : undefined,
    query: { enabled: !!disputeId && !!address && disputeId !== "" }
  }) as { data: bigint | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: nftAccruedKWN, isError: isNftAccruedError, isLoading: isNftAccruedLoading, error: nftAccruedError } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'nftAccruedKWN',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId && tokenId !== "" }
  }) as { data: bigint | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: maxBps } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'MAX_BPS',
    args: [],
  }) as { data: number | undefined };

  const { data: defaultNftRakeBps } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'defaultNftRakeBps',
    args: [],
  }) as { data: number | undefined };

  const { data: protocolFeeBps } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'protocolFeeBps',
    args: [],
  }) as { data: number | undefined };

  const { data: tieSlashBps } = useReadContract({
    address: bettingContractAddress as `0x${string}`,
    abi: bettingContractAbi,
    functionName: 'tieSlashBps',
    args: [],
  }) as { data: number | undefined };

  // Success handlers
  useEffect(() => {
    if (isCreatePoolSuccess) {
      toast.success('Betting pool created successfully!');
      setDisputeId("");
      setNftRakeBps("");
      setProtocolFeeBpsInput("");
    }
  }, [isCreatePoolSuccess]);

  useEffect(() => {
    if (isBetSuccess) {
      toast.success('Bet placed successfully!');
      setBetAmount("");
      setSelectedOutcome(OUTCOMES.CREATOR);
    }
  }, [isBetSuccess]);

  useEffect(() => {
    if (isClaimSuccess) {
      toast.success('Winnings claimed successfully!');
    }
  }, [isClaimSuccess]);

  useEffect(() => {
    if (isResolveSuccess) {
      toast.success('Pool resolved successfully!');
    }
  }, [isResolveSuccess]);

  useEffect(() => {
    if (isWithdrawNftSuccess) {
      toast.success('NFT accrued KWN withdrawn successfully!');
      setTokenId("");
    }
  }, [isWithdrawNftSuccess]);

  // Functions
  const createPool = async () => {
    try {
      if (!isConnected || !address) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (chainId !== base.id) {
        toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      }

      if (!disputeId || disputeId === "") {
        toast.error('Please enter a dispute ID');
        return;
      }

      const nftRakeBpsValue = nftRakeBps ? Number(nftRakeBps) : 0;
      const protocolFeeBpsValue = protocolFeeBpsInput ? Number(protocolFeeBpsInput) : 0;

      createPoolContract({
        address: bettingContractAddress as `0x${string}`,
        abi: bettingContractAbi,
        functionName: 'createPool',
        args: [BigInt(disputeId), nftRakeBpsValue, protocolFeeBpsValue],
      });

      toast.success('Creating betting pool...');
    } catch (error) {
      console.error("Error creating pool:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const placeBet = async () => {
    try {
      if (!isConnected || !address) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (chainId !== base.id) {
        toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      }

      if (!disputeId || disputeId === "" || !betAmount || betAmount === "") {
        toast.error('Please fill in all required fields');
        return;
      }

      const amountKWN = BigInt(Math.floor(parseFloat(betAmount) * 10 ** 18)); // Convert to wei

      betContract({
        address: bettingContractAddress as `0x${string}`,
        abi: bettingContractAbi,
        functionName: 'bet',
        args: [BigInt(disputeId), selectedOutcome, amountKWN],
      });

      toast.success('Placing bet...');
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const claimWinnings = async () => {
    try {
      if (!isConnected || !address) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (chainId !== base.id) {
        toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      }

      if (!disputeId || disputeId === "") {
        toast.error('Please enter a dispute ID');
        return;
      }

      claimContract({
        address: bettingContractAddress as `0x${string}`,
        abi: bettingContractAbi,
        functionName: 'claim',
        args: [BigInt(disputeId)],
      });

      toast.success('Claiming winnings...');
    } catch (error) {
      console.error("Error claiming winnings:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resolvePool = async () => {
    try {
      if (!isConnected || !address) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (chainId !== base.id) {
        toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      }

      if (!disputeId || disputeId === "") {
        toast.error('Please enter a dispute ID');
        return;
      }

      resolveContract({
        address: bettingContractAddress as `0x${string}`,
        abi: bettingContractAbi,
        functionName: 'resolve',
        args: [BigInt(disputeId)],
      });

      toast.success('Resolving pool...');
    } catch (error) {
      console.error("Error resolving pool:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const withdrawNftAccrued = async () => {
    try {
      if (!isConnected || !address) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (chainId !== base.id) {
        toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      }

      if (!tokenId || tokenId === "" || !address) {
        toast.error('Please fill in token ID and user address');
        return;
      }

      withdrawNftContract({
        address: bettingContractAddress as `0x${string}`,
        abi: bettingContractAbi,
        functionName: 'withdrawNftAccrued',
        args: [BigInt(tokenId), address],
      });

      toast.success('Withdrawing NFT accrued KWN...');
    } catch (error) {
      console.error("Error withdrawing NFT accrued KWN:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[var(--app-background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">Wallet Required</h1>
          <p className="text-[var(--app-foreground-muted)] mb-4">Please connect your wallet to access the betting system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-background)] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--app-foreground)] mb-2">Dispute Betting System</h1>
          <p className="text-[var(--app-foreground-muted)]">Bet on dispute outcomes and earn rewards</p>
          <div className="mt-4">
            <Badge variant="outline">{getNetworkName(chainId)}</Badge>
          </div>
        </div>
        
        {/* Contract Constants */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Constants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="block text-sm font-medium">Max BPS:</Label>
                <span className="text-lg">{maxBps?.toString() || "Loading..."}</span>
              </div>
              <div>
                <Label className="block text-sm font-medium">Default NFT Rake:</Label>
                <span className="text-lg">{formatBps(defaultNftRakeBps)}</span>
              </div>
              <div>
                <Label className="block text-sm font-medium">Protocol Fee:</Label>
                <span className="text-lg">{formatBps(protocolFeeBps as number | undefined)}</span>
              </div>
              <div>
                <Label className="block text-sm font-medium">Tie Slash:</Label>
                <span className="text-lg">{formatBps(tieSlashBps)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="disputeId" className="block text-sm font-medium mb-2">Dispute ID:</Label>
                <Input
                  id="disputeId"
                  type="number"
                  value={disputeId}
                  onChange={(e) => setDisputeId(e.target.value)}
                  className="w-full"
                  min="1"
                  placeholder="Enter dispute ID"
                />
              </div>
              <div>
                <Label htmlFor="userAddress" className="block text-sm font-medium mb-2">Your Address:</Label>
                <Input
                  id="userAddress"
                  type="text"
                  value={address || ""}
                  className="w-full"
                  placeholder="0x..."
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Pool Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create Betting Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="nftRakeBps" className="block text-sm font-medium mb-2">NFT Rake BPS (optional):</Label>
                <Input
                  id="nftRakeBps"
                  type="number"
                  value={nftRakeBps}
                  onChange={(e) => setNftRakeBps(e.target.value)}
                  className="w-full"
                  placeholder="Default will be used"
                />
              </div>
              <div>
                <Label htmlFor="protocolFeeBps" className="block text-sm font-medium mb-2">Protocol Fee BPS (optional):</Label>
                <Input
                  id="protocolFeeBps"
                  type="number"
                  value={protocolFeeBpsInput}
                  onChange={(e) => setProtocolFeeBpsInput(e.target.value)}
                  className="w-full"
                  placeholder="Default will be used"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={createPool}
                  disabled={isCreatePoolPending || isCreatePoolLoading}
                  className="w-full"
                >
                  {isCreatePoolPending || isCreatePoolLoading ? "Creating..." : "Create Pool"}
                </Button>
              </div>
            </div>
            
            {/* Transaction Status */}
            {(isCreatePoolPending || isCreatePoolLoading) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">Creating betting pool... Waiting for confirmation...</p>
              </div>
            )}

            {isCreatePoolSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">Pool created successfully!</p>
                {createPoolHash && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction: <a href={`https://sepolia.basescan.org/tx/${createPoolHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                      {createPoolHash.slice(0, 10)}...{createPoolHash.slice(-8)}
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Error Handling */}
            {createPoolWriteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 break-words">
                  <strong>Transaction Error:</strong> {createPoolWriteError.message}
                </p>
              </div>
            )}

            {createPoolReceiptError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 break-words">
                  <strong>Transaction Failed:</strong> {createPoolReceiptError.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Place Bet Section */}
        <Card>
          <CardHeader>
            <CardTitle>Place Bet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="betAmount" className="block text-sm font-medium mb-2">Bet Amount (KWN):</Label>
                <Input
                  id="betAmount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full"
                  placeholder="0.1"
                  step="0.001"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="outcome" className="block text-sm font-medium mb-2">Outcome:</Label>
                <Select value={selectedOutcome.toString()} onValueChange={(value) => setSelectedOutcome(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OUTCOMES.CREATOR.toString()}>Creator</SelectItem>
                    <SelectItem value={OUTCOMES.RESPONDENT.toString()}>Respondent</SelectItem>
                    <SelectItem value={OUTCOMES.TIE.toString()}>Tie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={placeBet}
                  disabled={isBetPending || isBetLoading}
                  className="w-full"
                >
                  {isBetPending || isBetLoading ? "Placing..." : "Place Bet"}
                </Button>
              </div>
            </div>
            
            {/* Transaction Status */}
            {(isBetPending || isBetLoading) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">Placing bet... Waiting for confirmation...</p>
              </div>
            )}

            {isBetSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">Bet placed successfully!</p>
                {betHash && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction: <a href={`https://sepolia.basescan.org/tx/${betHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                      {betHash.slice(0, 10)}...{betHash.slice(-8)}
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Error Handling */}
            {betWriteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 break-words">
                  <strong>Transaction Error:</strong> {betWriteError.message}
                </p>
              </div>
            )}

            {betReceiptError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 break-words">
                  <strong>Transaction Failed:</strong> {betReceiptError.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pool Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pool Information</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={claimWinnings}
                disabled={isClaimPending || isClaimLoading}
                className="w-full"
              >
                {isClaimPending || isClaimLoading ? "Claiming..." : "Claim Winnings"}
              </Button>
              <Button
                onClick={resolvePool}
                disabled={isResolvePending || isResolveLoading}
                className="w-full"
              >
                {isResolvePending || isResolveLoading ? "Resolving..." : "Resolve Pool"}
              </Button>
            </div>
            
            {/* Transaction Status */}
            {(isClaimPending || isClaimLoading) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <p className="text-sm text-blue-800">Claiming winnings... Waiting for confirmation...</p>
              </div>
            )}

            {isClaimSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                <p className="text-sm text-green-800">Winnings claimed successfully!</p>
                {claimHash && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction: <a href={`https://sepolia.basescan.org/tx/${claimHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                      {claimHash.slice(0, 10)}...{claimHash.slice(-8)}
                    </a>
                  </p>
                )}
              </div>
            )}

            {(isResolvePending || isResolveLoading) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <p className="text-sm text-blue-800">Resolving pool... Waiting for confirmation...</p>
              </div>
            )}

            {isResolveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                <p className="text-sm text-green-800">Pool resolved successfully!</p>
                {resolveHash && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction: <a href={`https://sepolia.basescan.org/tx/${resolveHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                      {resolveHash.slice(0, 10)}...{resolveHash.slice(-8)}
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Error Handling */}
            {(claimWriteError || claimReceiptError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                <p className="text-sm text-red-800 break-words">
                  <strong>Claim Error:</strong> {claimWriteError?.message || claimReceiptError?.message}
                </p>
              </div>
            )}

            {(resolveWriteError || resolveReceiptError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                <p className="text-sm text-red-800 break-words">
                  <strong>Resolve Error:</strong> {resolveWriteError?.message || resolveReceiptError?.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NFT Withdrawal */}
        <Card>
          <CardHeader>
            <CardTitle>NFT Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="tokenId" className="block text-sm font-medium mb-2">Token ID:</Label>
                <Input
                  id="tokenId"
                  type="number"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  className="w-full"
                  placeholder="123"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={withdrawNftAccrued}
                  disabled={isWithdrawNftPending || isWithdrawNftLoading}
                  className="w-full"
                >
                  {isWithdrawNftPending || isWithdrawNftLoading ? "Withdrawing..." : "Withdraw NFT Accrued"}
                </Button>
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

            {/* Transaction Status */}
            {(isWithdrawNftPending || isWithdrawNftLoading) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <p className="text-sm text-blue-800">Withdrawing NFT accrued KWN... Waiting for confirmation...</p>
              </div>
            )}

            {isWithdrawNftSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                <p className="text-sm text-green-800">NFT accrued KWN withdrawn successfully!</p>
                {withdrawNftHash && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction: <a href={`https://sepolia.basescan.org/tx/${withdrawNftHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                      {withdrawNftHash.slice(0, 10)}...{withdrawNftHash.slice(-8)}
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Error Handling */}
            {(withdrawNftWriteError || withdrawNftReceiptError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                <p className="text-sm text-red-800 break-words">
                  <strong>Withdraw Error:</strong> {withdrawNftWriteError?.message || withdrawNftReceiptError?.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}