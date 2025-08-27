/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
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
    
    const args = [{
      respondent: formData.respondent as `0x${string}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      requiresEscrow: formData.requiresEscrow,
      escrowAmount: formData.requiresEscrow ? BigInt(formData.escrowAmount || '0') : BigInt(0),
      customPeriod: BigInt(formData.customPeriod || '0'),
      evidenceDescriptions: [],
      evidenceHashes: [],
      evidenceSupportsCreator: []
    }];
    
    const value = formData.requiresEscrow ? BigInt(formData.escrowAmount || '0') : BigInt(0);
    
    writeContract({
      ...disputeContract,
      functionName: 'createDispute',
      args,
      value,
    });
    toast.success('Creating dispute...');
  };

  if (isSuccess) {
    toast.success('Dispute created successfully!');
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg">
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

  if (isSuccess) {
    toast.success('Evidence submitted successfully!');
  }

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

  if (isSuccess) {
    toast.success('Vote cast successfully!');
  }

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
