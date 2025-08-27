"use client";

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { disputeContract } from '../lib/contracts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function ContractActions() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [activeTab, setActiveTab] = useState<'vote' | 'evidence' | 'resolve'>('vote');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contract Actions</h2>
        <Badge variant="outline">{getNetworkName(chainId)}</Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('vote')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'vote' ? 'bg-background text-foreground' : 'text-muted-foreground'
          }`}
        >
          🗳️ Cast Vote
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'evidence' ? 'bg-background text-foreground' : 'text-muted-foreground'
          }`}
        >
          📄 Submit Evidence
        </button>
        <button
          onClick={() => setActiveTab('resolve')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'resolve' ? 'bg-background text-foreground' : 'text-muted-foreground'
          }`}
        >
          ✅ Resolve Dispute
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'vote' && <CastVoteForm />}
      {activeTab === 'evidence' && <SubmitEvidenceForm />}
      {activeTab === 'resolve' && <ResolveDisputeForm />}
    </div>
  );
}

function CastVoteForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [formData, setFormData] = useState({
    disputeId: '',
    supportsCreator: true,
    reason: '',
  });

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

  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();
  const { isLoading, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (chainId !== base.id) {
      toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      // Don't block the user, just warn them
    }

    if (!formData.disputeId || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      writeContract({
        ...disputeContract,
        functionName: 'castVote',
        args: [
          BigInt(formData.disputeId),
          formData.supportsCreator,
          formData.reason
        ],
      });
      
      toast.success('Casting vote...');
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Use useEffect to handle success state changes
  useEffect(() => {
    if (isSuccess) {
      toast.success('Vote cast successfully!');
    }
  }, [isSuccess]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
      </CardHeader>
      <CardContent className="break-words">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="voteDisputeId">Dispute ID</Label>
            <Input
              id="voteDisputeId"
              type="number"
              placeholder="Enter dispute ID"
              value={formData.disputeId}
              onChange={(e) => setFormData(prev => ({ ...prev, disputeId: e.target.value }))}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="voteSupportsCreator"
              checked={formData.supportsCreator}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, supportsCreator: checked }))}
            />
            <Label htmlFor="voteSupportsCreator">Supports Creator</Label>
          </div>

          <div>
            <Label htmlFor="voteReason">Voting Reason</Label>
            <Textarea
              id="voteReason"
              placeholder="Explain your vote decision"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending || isLoading || !address}
            className="w-full"
          >
            {isLoading ? 'Casting Vote...' : 'Cast Vote'}
          </Button>

          {/* Transaction Status */}
          {isPending && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Vote submitted! Waiting for confirmation...</p>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Vote cast successfully!</p>
              {hash && (
                <p className="text-xs text-green-600 mt-1">
                  Transaction: <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </a>
                </p>
              )}
            </div>
          )}

          {writeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 break-words">
                <strong>Error:</strong> {writeError.message}
              </p>
            </div>
          )}

          {receiptError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 break-words">
                <strong>Transaction Failed:</strong> {receiptError.message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitEvidenceForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [formData, setFormData] = useState({
    disputeId: '',
    description: '',
    documentHash: '',
    supportsCreator: true,
  });

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

  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();
  const { isLoading, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (chainId !== base.id) {
      toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      // Don't block the user, just warn them
    }

    if (!formData.disputeId || !formData.description.trim() || !formData.documentHash.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      writeContract({
        ...disputeContract,
        functionName: 'submitEvidence',
        args: [
          BigInt(formData.disputeId),
          formData.description,
          formData.documentHash,
          formData.supportsCreator
        ],
      });
      
      toast.success('Submitting evidence...');
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Use useEffect to handle success state changes
  useEffect(() => {
    if (isSuccess) {
      toast.success('Evidence submitted successfully!');
    }
  }, [isSuccess]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Submit Evidence</CardTitle>
      </CardHeader>
      <CardContent className="break-words">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="evidenceDisputeId">Dispute ID</Label>
            <Input
              id="evidenceDisputeId"
              type="number"
              placeholder="Enter dispute ID"
              value={formData.disputeId}
              onChange={(e) => setFormData(prev => ({ ...prev, disputeId: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="evidenceDescription">Evidence Description</Label>
            <Textarea
              id="evidenceDescription"
              placeholder="Describe the evidence"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="documentHash">Document Hash</Label>
            <Input
              id="documentHash"
              placeholder="IPFS hash or document identifier"
              value={formData.documentHash}
              onChange={(e) => setFormData(prev => ({ ...prev, documentHash: e.target.value }))}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="supportsCreator"
              checked={formData.supportsCreator}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, supportsCreator: checked }))}
            />
            <Label htmlFor="supportsCreator">Supports Creator</Label>
          </div>

          <Button 
            type="submit" 
            disabled={isPending || isLoading || !address}
            className="w-full"
          >
            {isLoading ? 'Submitting Evidence...' : 'Submit Evidence'}
          </Button>

          {/* Transaction Status */}
          {isPending && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Evidence submitted! Waiting for confirmation...</p>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Evidence submitted successfully!</p>
              {hash && (
                <p className="text-xs text-green-600 mt-1">
                  Transaction: <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </a>
                </p>
              )}
            </div>
          )}

          {writeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 break-words">
                <strong>Error:</strong> {writeError.message}
              </p>
            </div>
          )}

          {receiptError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 break-words">
                <strong>Transaction Failed:</strong> {receiptError.message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function ResolveDisputeForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [formData, setFormData] = useState({
    disputeId: '',
    resolutionSummary: '',
    winner: address || '',
  });

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

  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();
  const { isLoading, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (chainId !== base.id) {
      toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      // Don't block the user, just warn them
    }

    if (!formData.disputeId || !formData.resolutionSummary.trim() || !formData.winner) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      writeContract({
        ...disputeContract,
        functionName: 'resolveDispute',
        args: [
          BigInt(formData.disputeId),
          formData.resolutionSummary,
          formData.winner as `0x${string}`
        ],
      });
      
      toast.success('Resolving dispute...');
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Use useEffect to handle success state changes
  useEffect(() => {
    if (isSuccess) {
      toast.success('Dispute resolved successfully!');
    }
  }, [isSuccess]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Resolve Dispute</CardTitle>
      </CardHeader>
      <CardContent className="break-words">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="resolveDisputeId">Dispute ID</Label>
            <Input
              id="resolveDisputeId"
              type="number"
              placeholder="Enter dispute ID"
              value={formData.disputeId}
              onChange={(e) => setFormData(prev => ({ ...prev, disputeId: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="resolutionSummary">Resolution Summary</Label>
            <Textarea
              id="resolutionSummary"
              placeholder="Provide a summary of the resolution"
              value={formData.resolutionSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, resolutionSummary: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="winner">Winner Address</Label>
            <Input
              id="winner"
              placeholder="0x..."
              value={formData.winner}
              onChange={(e) => setFormData(prev => ({ ...prev, winner: e.target.value }))}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending || isLoading || !address}
            className="w-full"
          >
            {isLoading ? 'Resolving Dispute...' : 'Resolve Dispute'}
          </Button>

          {/* Transaction Status */}
          {isPending && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Dispute resolution submitted! Waiting for confirmation...</p>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Dispute resolved successfully!</p>
              {hash && (
                <p className="text-xs text-green-600 mt-1">
                  Transaction: <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </a>
                </p>
              )}
            </div>
          )}

          {writeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 break-words">
                <strong>Error:</strong> {writeError.message}
              </p>
            </div>
          )}

          {receiptError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 break-words">
                <strong>Transaction Failed:</strong> {receiptError.message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
