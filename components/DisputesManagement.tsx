/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Icon } from "./DemoComponents";
import { Button } from "./DemoComponents";
import { DisputeCard } from "./DisputeCard";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import Image from "next/image";
import { ConnectWallet, WalletDropdownDisconnect, WalletDropdown } from "@coinbase/onchainkit/wallet";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Avatar, Address, Name, EthBalance, Identity } from "@coinbase/onchainkit/identity";
import { toast } from 'sonner';
import { disputeContract } from '../lib/contracts';
import { ContractActions } from './ContractActions';
import BettingIntegration from '../integration/bettingIntegration';
import { createPublicClient, http } from 'viem';
import { fetchDisputesByCreator, createDispute, buildInviteUrl, type Dispute as JsonDispute } from '../lib/disputes';

// Create a public client for reading from Base network
const client = createPublicClient({
  chain: base,
  transport: http(),
});

interface Dispute {
  id: number;
  topic: string;
  type: 'general' | 'opponent';
  creator: string;
  status: 'draft' | 'active' | 'completed';
  inviteUrl?: string;
  disputer1?: {
    address: string;
    pointOfView: string;
    status: 'pending' | 'accepted' | 'declined';
  };
  disputer2?: {
    address: string;
    pointOfView: string;
    status: 'pending' | 'accepted' | 'declined';
  };
  opponents?: {
    address: string;
    pointOfView: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
  timestamp: string;
  upvotes: number;
  downvotes: number;
  reposts: number;
  comments: number;
  bookmarked: boolean;
}

export function DisputesManagement() {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const [activeView, setActiveView] = useState<"create" | "my-disputes" | "contract-actions" | "betting">("create");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [disputeType, setDisputeType] = useState<'general' | 'opponent'>('general');
  const [formData, setFormData] = useState({
    topic: "",
    type: 'general' as 'general' | 'opponent',
    opponentAddresses: [""],
    opponentEmails: [""],
    priority: "0" as "0" | "1" | "2",
    escrowAmount: "0.01"
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

  // Contract hooks for real dispute creation
  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();
  const { isLoading, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Contract read hooks for fetching real dispute data
  const { data: disputeCounter } = useReadContract({
    ...disputeContract,
    functionName: 'disputeCounter',
  });

  const { data: userDisputesFromContract } = useReadContract({
    ...disputeContract,
    functionName: 'getUserDisputes',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Reset form when transaction is successful
  useEffect(() => {
    if (isSuccess) {
      toast.success('Dispute created successfully!');
      setFormData({
        topic: "",
        type: 'general',
        opponentAddresses: [""],
        opponentEmails: [""],
        priority: "0",
        escrowAmount: "0.01"
      });
      setShowCreateForm(false);
      // Switch to my-disputes tab to show the newly created dispute
      setActiveView("my-disputes");
    }
  }, [isSuccess]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      toast.error('Failed to create dispute. Please try again.');
    }
    if (receiptError) {
      toast.error('Transaction failed. Please try again.');
    }
  }, [writeError, receiptError]);

  // State for real dispute data
  const [realUserDisputes, setRealUserDisputes] = useState<Dispute[]>([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(false);

  // Fetch real dispute data when user disputes change
  useEffect(() => {
    const loadRealDisputes = async () => {
      if (!address) {
        setRealUserDisputes([]);
        return;
      }
      setIsLoadingDisputes(true);
      try {
        const items = await fetchDisputesByCreator(address as `0x${string}`);
        const mapped: Dispute[] = items.map((d: JsonDispute) => ({
          id: d.id,
          topic: d.title,
          type: d.type,
          creator: d.creator,
          status: 'active',
          inviteUrl: buildInviteUrl(d.id, address as `0x${string}`),
          disputer1: {
            address: d.creator,
            pointOfView: d.description,
            status: 'accepted',
          },
          disputer2: d.type === 'opponent'
            ? {
                address: d.opponentAddresses[0] ?? '',
                pointOfView: "",
                status: 'pending',
              }
            : undefined,
          timestamp: new Date(d.createdAt).toLocaleString(),
          upvotes: d.upvotes,
          downvotes: d.downvotes,
          reposts: 0,
          comments: 0,
          bookmarked: false,
        }));
        setRealUserDisputes(mapped);
      } catch (error) {
        console.error('Error loading real disputes:', error);
        setRealUserDisputes([]);
      } finally {
        setIsLoadingDisputes(false);
      }
    };

    loadRealDisputes();
  }, [address]);

  // Show loading state while connecting
  if (isConnecting) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)] mx-auto mb-4"></div>
        <p className="text-[var(--app-foreground-muted)]">Connecting wallet...</p>
      </div>
    );
  }

  // Mock user's created disputes
  const userDisputes: Dispute[] = [
    {
      id: 101,
      topic: "Ghana jollof is the best",
      type: 'opponent',
      creator: "0x1234...5678",
      status: 'active',
      inviteUrl: "https://djury.app/disputes/101/invite/abc123",
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious.",
        status: 'accepted'
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious.",
        status: 'accepted'
      },
      timestamp: "1h ago",
      upvotes: 15,
      downvotes: 3,
      reposts: 8,
      comments: 12,
      bookmarked: false
    },
    {
      id: 102,
      topic: "MoMo charges are reasonable",
      type: 'general',
      creator: "0x1234...5678",
      status: 'active',
      timestamp: "3h ago",
      upvotes: 8,
      downvotes: 12,
      reposts: 5,
      comments: 18,
      bookmarked: true
    }
  ];

  // Function to fetch dispute details from contract
  const fetchDisputeDetails = async (disputeId: number): Promise<Dispute | null> => {
    try {
      const disputeData = await client.readContract({
        address: disputeContract.address as `0x${string}`,
        abi: disputeContract.abi,
        functionName: 'disputes',
        args: [BigInt(disputeId)],
      });

      if (!disputeData) return null;

      // Parse the dispute data into our Dispute format
      const [
        disputeCreatorAddress,
        respondentAddress,
        title,
        description,
        category,
        priority,
        escrowAmount,
        creationTime,
        activationTime,
        endTime,
        votingEndTime,
        resolutionDeadline,
        status,
        creatorVotes,
        respondentVotes,
        winner,
        winnerNftTokenId,
        resolutionSummary,
        requiresEscrow,
        votingStartTime
      ] = disputeData as any[];

      return {
        id: disputeId,
        topic: title,
        type: requiresEscrow ? 'opponent' : 'general',
        creator: disputeCreatorAddress,
        status: status === 0 ? 'draft' : status === 1 ? 'active' : 'completed',
        inviteUrl: requiresEscrow ? `https://djury.app/disputes/${disputeId}/invite/${Math.random().toString(36).substr(2, 9)}` : undefined,
        disputer1: {
          address: disputeCreatorAddress,
          pointOfView: description,
          status: 'accepted'
        },
        disputer2: requiresEscrow ? {
          address: respondentAddress,
          pointOfView: "Opponent's point of view",
          status: 'pending'
        } : undefined,
        timestamp: new Date(Number(creationTime) * 1000).toLocaleString(),
        upvotes: Number(creatorVotes),
        downvotes: Number(respondentVotes),
        reposts: 0,
        comments: 0,
        bookmarked: false
      };
    } catch (error) {
      console.error('Error fetching dispute details:', error);
      return null;
    }
  };

  // Use only JSON-backed disputes (no mock fallback)
  const displayDisputes = realUserDisputes;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOpponent = () => {
    setFormData(prev => ({
      ...prev,
      opponentAddresses: [...prev.opponentAddresses, ""],
      opponentEmails: [...prev.opponentEmails, ""]
    }));
  };

  const removeOpponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      opponentAddresses: prev.opponentAddresses.filter((_, i) => i !== index),
      opponentEmails: prev.opponentEmails.filter((_, i) => i !== index)
    }));
  };

  const updateOpponent = (index: number, field: 'address' | 'email', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field === 'address' ? 'opponentAddresses' : 'opponentEmails']: prev[field === 'address' ? 'opponentAddresses' : 'opponentEmails'].map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const generateInviteUrl = (disputeId: number) => {
    return `https://djury.app/disputes/${disputeId}/invite/${Math.random().toString(36).substr(2, 9)}`;
  };

  const copyInviteLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please copy manually.');
    }
  };

  const handleDisputeClick = (disputeId: number) => {
    // Navigate to dispute detail page
    window.location.href = `/disputes/${disputeId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Please connect your wallet to create a dispute.");
      return;
    }
    if (!formData.topic.trim()) {
      toast.error("Please enter a dispute topic.");
      return;
    }
    if (disputeType === 'opponent') {
      const validAddresses = formData.opponentAddresses.filter(addr => addr.trim() !== "");
      if (validAddresses.length === 0) {
        toast.error("Please add at least one opponent address for opponent disputes.");
        return;
      }
    }

    try {
      const payload = {
        creator: address as `0x${string}`,
        title: formData.topic,
        description: formData.topic,
        type: disputeType,
        opponentAddresses: disputeType === 'opponent' ? formData.opponentAddresses as `0x${string}`[] : [],
        priority: parseInt(formData.priority, 10) as 0 | 1 | 2,
        escrowAmount: disputeType === 'opponent' ? (Math.floor(parseFloat(formData.escrowAmount) * 1e18)).toString() : '0',
      };

      const created = await createDispute(payload);
      toast.success('Dispute created successfully!');

      const inviteUrl = buildInviteUrl(created.id, address as `0x${string}`);
      await copyInviteLink(inviteUrl);

      setActiveView("my-disputes");
      setFormData({
        topic: "",
        type: 'general',
        opponentAddresses: [""],
        opponentEmails: [""],
        priority: "0",
        escrowAmount: "0.01"
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast.error('Failed to create dispute. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--app-foreground)]">Disputes Management</h2>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-1 bg-[var(--app-gray)] rounded-lg p-1">
        <button
          onClick={() => setActiveView("create")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeView === "create"
              ? "bg-[var(--app-accent)] text-[var(--app-background)]"
              : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
          }`}
        >
          Create Dispute
        </button>
        <button
          onClick={() => setActiveView("my-disputes")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeView === "my-disputes"
              ? "bg-[var(--app-accent)] text-[var(--app-background)]"
              : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
          }`}
        >
          My Disputes
        </button>
        {/* <button
          onClick={() => setActiveView("contract-actions")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeView === "contract-actions"
              ? "bg-[var(--app-accent)] text-[var(--app-background)]"
              : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
          }`}
        >
          Contract Actions
        </button>
        <button
          onClick={() => setActiveView("betting")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeView === "betting"
              ? "bg-[var(--app-accent)] text-[var(--app-background)]"
              : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
          }`}
        >
          Betting
        </button> */}
      </div>

      {/* Content */}
      {activeView === "create" && (
        <div className="space-y-4">
          {showCreateForm ? (
            <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
              <h3 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">Create New Dispute</h3>
              
              {!isConnected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="user" size="lg" className="text-[var(--app-accent)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">Wallet Required</h3>
                  <p className="text-[var(--app-foreground-muted)] mb-6">
                    You need to connect your wallet to create disputes and participate in the platform.
                  </p>
                  <Wallet className="z-10">
              <ConnectWallet>
                <Name className="text-inherit" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 overflow-hidden break-words">
                  {/* Wallet Info */}
                  <div className="p-3 bg-[var(--app-accent-light)] rounded-lg">
                    <p className="text-sm text-[var(--app-foreground)]">
                      Creating dispute as: <span className="font-mono text-[var(--app-accent)]">{address}</span>
                    </p>
                  </div>
                  
                  {/* Dispute Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--app-foreground)] mb-3">
                      Dispute Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDisputeType('general')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          disputeType === 'general'
                            ? 'border-[var(--app-accent)] bg-[var(--app-accent-light)]'
                            : 'border-[var(--app-card-border)] hover:border-[var(--app-accent)]'
                        }`}
                      >
                        <div className="text-center">
                          <Icon name="users" size="lg" className="mx-auto mb-2 text-[var(--app-accent)]" />
                          <h4 className="font-medium text-[var(--app-foreground)]">General Dispute</h4>
                          <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                            Open to entire community
                          </p>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setDisputeType('opponent')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          disputeType === 'opponent'
                            ? 'border-[var(--app-accent)] bg-[var(--app-accent-light)]'
                            : 'border-[var(--app-card-border)] hover:border-[var(--app-accent)]'
                        }`}
                      >
                        <div className="text-center">
                          <Icon name="user-check" size="lg" className="mx-auto mb-2 text-[var(--app-accent)]" />
                          <h4 className="font-medium text-[var(--app-foreground)]">Opponent Dispute</h4>
                          <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                            Invite specific opponents
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Dispute Topic */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                      Dispute Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.topic}
                      onChange={(e) => handleInputChange("topic", e.target.value)}
                      placeholder="Enter the main dispute topic..."
                      className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                    />
                  </div>

                  {/* Priority Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                      Priority Level *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange("priority", e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                    >
                      <option value="0">Low</option>
                      <option value="1">Medium</option>
                      <option value="2">High</option>
                    </select>
                  </div>

                  {/* Opponent Management (only for opponent disputes) */}
                  {disputeType === 'opponent' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-[var(--app-foreground)]">Invite Opponents</h4>
                        <Button
                          type="button"
                          onClick={addOpponent}
                          className="bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]"
                        >
                          <Icon name="plus" size="sm" className="mr-2" />
                          Add Opponent
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.opponentAddresses.map((address, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border border-[var(--app-card-border)] rounded-lg">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-[var(--app-foreground)] mb-1">
                                Opponent {index + 1} Wallet Address *
                              </label>
                              <input
                                type="text"
                                required
                                value={address}
                                onChange={(e) => updateOpponent(index, 'address', e.target.value)}
                                placeholder="0x..."
                                className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                              />
                            </div>
                            
                            {formData.opponentAddresses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOpponent(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Icon name="x" size="sm" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Escrow Amount for Opponent Disputes */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                          Escrow Amount (ETH) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.escrowAmount}
                          onChange={(e) => handleInputChange("escrowAmount", e.target.value)}
                          placeholder="0.01"
                          className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                          required
                        />
                        <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                          This amount will be held in escrow until the dispute is resolved.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <Image
                            src="https://cdn.dribbble.com/userupload/24417588/file/original-6259636298271570fcce05da638a5d1b.jpg?format=webp&resize=400x300&vertical=center" 
                            alt="info" 
                            width={316} 
                            height={316} 
                            className="inline mr-2"
                          />
                          Share this link with your opponents to invite them to the dispute.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isPending || isLoading || !address}
                      className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white py-3"
                    >
                      {isLoading ? 'Creating Dispute...' : 'Create ' + (disputeType === 'opponent' ? 'Opponent' : 'General') + ' Dispute'}
                    </Button>
                  </div>

                  {/* Transaction Status */}
                  {isPending && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">Transaction submitted! Waiting for confirmation...</p>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">Dispute created successfully on blockchain!</p>
                      {hash && (
                        <p className="text-xs text-green-600 mt-1">
                          Transaction: <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">
                            {hash.slice(0, 10)}...{hash.slice(-8)}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </form>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="plus" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">Ready to Create a Dispute?</h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                Start a new debate by creating either a general community dispute or an opponent-specific dispute.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}

      {activeView === "my-disputes" && (
        <div className="space-y-4">
          {isLoadingDisputes ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)] mx-auto mb-4"></div>
              <p className="text-[var(--app-foreground-muted)]">Loading disputes from blockchain...</p>
            </div>
          ) : displayDisputes.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">
                My Created Disputes ({displayDisputes.length})
                {realUserDisputes.length > 0 && (
                  <span className="text-sm text-green-600 ml-2">✓ Live from blockchain</span>
                )}
                {realUserDisputes.length === 0 && userDisputes.length > 0 && (
                  <span className="text-sm text-orange-600 ml-2">⚠️ Mock data (contract not responding)</span>
                )}
              </h3>
              <div className="space-y-4">
                {displayDisputes.map((dispute) => (
                  <div key={dispute.id} className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-4">
                    <DisputeCard 
                      dispute={dispute} 
                      onClick={() => handleDisputeClick(dispute.id)}
                    />
                    
                    {/* Invite Link for Opponent Disputes */}
                    {dispute.type === 'opponent' && dispute.inviteUrl && (
                      <div className="mt-4 p-3 bg-[var(--app-accent-light)] rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--app-foreground)] mb-1">Invite Link</p>
                            <p className="text-xs text-[var(--app-foreground-muted)]">
                              Share this link with your opponents to invite them to the dispute
                            </p>
                          </div>
                          <Button
                            onClick={() => copyInviteLink(dispute.inviteUrl!)}
                            className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white text-sm px-4 text-nowrap scale-90 py-1"
                          >
                            Copy Link
                          </Button>
                        </div>
                        <div className="mt-2 p-2 bg-[var(--app-background)] rounded border border-[var(--app-card-border)]">
                          <p className="text-xs font-mono text-[var(--app-foreground)] break-all">
                            {dispute.inviteUrl}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="alert-circle" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">No Disputes Created Yet</h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                You haven&apos;t created any disputes yet. Start by creating your first dispute!
              </p>
              <Button
                onClick={() => setActiveView("create")}
                className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
              >
                Create Your First Dispute
              </Button>
            </div>
          )}
        </div>
      )}

      {activeView === "contract-actions" && (
        <ContractActions />
      )}

      {activeView === "betting" && (
        <BettingIntegration />
      )}
    </div>
  );
}
