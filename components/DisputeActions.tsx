/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { disputeContract, type CreateDisputeParams, type EvidenceParams, type VoteParams, type DisputeCategory, type Priority } from '../lib/contracts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

export function CreateDisputeForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    respondent: '',
    category: 0 as DisputeCategory,
    priority: 0 as Priority,
    requiresEscrow: false,
    escrowAmount: '',
    customPeriod: '',
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

  // Execute the transaction
  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();

  // Wait for transaction
  const { isLoading, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if user is on Base network
    if (chainId !== base.id) {
      toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      // Don't block the user, just warn them
    }

    if (!formData.respondent || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate respondent address format
    if (!formData.respondent.startsWith('0x') || formData.respondent.length !== 42) {
      toast.error('Please enter a valid Ethereum address (0x...)');
      return;
    }

    // Validate escrow amount if required
    if (formData.requiresEscrow && (!formData.escrowAmount || parseFloat(formData.escrowAmount) <= 0)) {
      toast.error('Please enter a valid escrow amount');
      return;
    }

    try {
      const args = [{
        respondent: formData.respondent as `0x${string}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        requiresEscrow: formData.requiresEscrow,
        escrowAmount: formData.requiresEscrow ? BigInt(Math.floor(parseFloat(formData.escrowAmount || '0') * 1e18)) : BigInt(0),
        customPeriod: BigInt(formData.customPeriod || '0'),
        evidenceDescriptions: [],
        evidenceHashes: [],
        evidenceSupportsCreator: []
      }];
      
      const value = formData.requiresEscrow ? BigInt(Math.floor(parseFloat(formData.escrowAmount || '0') * 1e18)) : BigInt(0);
      
      console.log('Creating dispute with args:', args);
      console.log('Value:', value.toString());
      console.log('Contract address:', disputeContract.address);
      
      writeContract({
        ...disputeContract,
        functionName: 'createDispute',
        args,
        value,
      });
      
      toast.success('Creating dispute...');
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Show errors if they occur
  if (writeError) {
    console.error('Write error:', writeError);
    // Don't show toast for every error, just log it
  }

  if (receiptError) {
    console.error('Receipt error:', receiptError);
    // Don't show toast for every error, just log it
  }

  // Use useEffect to handle success state changes
  useEffect(() => {
    if (isSuccess) {
      toast.success('Dispute created successfully!');
    }
  }, [isSuccess]);

  return (
    <div className="space-y-6 p-6 border rounded-lg overflow-hidden break-words">
      <h2 className="text-2xl font-bold">Create New Dispute</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Dispute Title</Label>
          <Input
            id="title"
            placeholder="Enter dispute title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the dispute in detail"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="respondent">Respondent Address</Label>
          <Input
            id="respondent"
            placeholder="0x..."
            value={formData.respondent}
            onChange={(e) => setFormData(prev => ({ ...prev, respondent: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, category: parseInt(value) as DisputeCategory }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">General</SelectItem>
                <SelectItem value="1">Financial</SelectItem>
                <SelectItem value="2">Legal</SelectItem>
                <SelectItem value="3">Technical</SelectItem>
                <SelectItem value="4">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) as Priority }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Low</SelectItem>
                <SelectItem value="1">Medium</SelectItem>
                <SelectItem value="2">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="escrow"
            checked={formData.requiresEscrow}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresEscrow: checked }))}
          />
          <Label htmlFor="escrow">Requires Escrow</Label>
        </div>

        {formData.requiresEscrow && (
          <div>
            <Label htmlFor="escrowAmount">Escrow Amount (ETH)</Label>
            <Input
              id="escrowAmount"
              type="number"
              step="0.001"
              placeholder="0.01"
              value={formData.escrowAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, escrowAmount: e.target.value }))}
            />
          </div>
        )}

        <div>
          <Label htmlFor="customPeriod">Custom Period (seconds, optional)</Label>
          <Input
            id="customPeriod"
            type="number"
            placeholder="86400 (1 day)"
            value={formData.customPeriod}
            onChange={(e) => setFormData(prev => ({ ...prev, customPeriod: e.target.value }))}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isPending || isLoading || !address}
          className="w-full"
        >
          {isLoading ? 'Creating Dispute...' : 'Create Dispute'}
        </Button>

        {/* Debug info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</div>
          <div>Network: {getNetworkName(chainId)} {chainId === base.id ? '✅' : '⚠️'}</div>
          <div>Contract: {disputeContract.address}</div>
        </div>

        {/* Error Display with proper wrapping */}
        {writeError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 break-words">
              <strong>Transaction Error:</strong> {writeError.message}
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
    </div>
  );
}

export function SubmitEvidenceForm() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    disputeId: '',
    description: '',
    documentHash: '',
    supportsCreator: true,
  });

  // Execute the transaction
  const { writeContract, isPending, data: hash } = useWriteContract();

  // Wait for transaction
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    writeContract({
      ...disputeContract,
      functionName: 'submitEvidence',
      args: [
        BigInt(formData.disputeId || '0'),
        formData.description,
        formData.documentHash,
        formData.supportsCreator
      ],
    });
    toast.success('Submitting evidence...');
  };

  // Use useEffect to handle success state changes
  useEffect(() => {
    if (isSuccess) {
      toast.success('Evidence submitted successfully!');
    }
  }, [isSuccess]);

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">Submit Evidence</h2>
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
      </form>
    </div>
  );
}

export function CastVoteForm() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    disputeId: '',
    supportsCreator: true,
    reason: '',
  });

  // Execute the transaction
  const { writeContract, isPending, data: hash } = useWriteContract();

  // Wait for transaction
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    writeContract({
      ...disputeContract,
      functionName: 'castVote',
      args: [
        BigInt(formData.disputeId || '0'),
        formData.supportsCreator,
        formData.reason
      ],
    });
    toast.success('Casting vote...');
  };

  // Use useEffect to handle success state changes
  useEffect(() => {
    if (isSuccess) {
      toast.success('Vote cast successfully!');
    }
  }, [isSuccess]);

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">Cast Vote</h2>
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
      </form>
    </div>
  );
}
