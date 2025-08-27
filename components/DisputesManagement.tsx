/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Icon } from "./DemoComponents";
import { Button } from "./DemoComponents";
import { DisputeCard } from "./DisputeCard";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import Image from "next/image";
import { ConnectWallet, WalletDropdownDisconnect, WalletDropdown } from "@coinbase/onchainkit/wallet";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Avatar, Address, Name, EthBalance, Identity } from "@coinbase/onchainkit/identity";
import { toast } from 'sonner';
import { disputeContract } from '../lib/contracts';
import { ContractActions } from './ContractActions';

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
  const [activeView, setActiveView] = useState<"create" | "my-disputes" | "contract-actions">("create");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [disputeType, setDisputeType] = useState<'general' | 'opponent'>('general');
  const [formData, setFormData] = useState({
    topic: "",
    type: 'general' as 'general' | 'opponent',
    opponentAddresses: [""],
    opponentEmails: [""]
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

  // Reset form when transaction is successful
  useEffect(() => {
    if (isSuccess) {
      setFormData({
        topic: "",
        type: 'general',
        opponentAddresses: [""],
        opponentEmails: [""]
      });
      setShowCreateForm(false);
    }
  }, [isSuccess]);

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

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to create a dispute.");
      return;
    }

    // Check if user is on Base network
    if (chainId !== base.id) {
      toast.warning(`You're currently on ${getNetworkName(chainId)}. For best experience, consider switching to Base network.`);
      // Don't block the user, just warn them
    }

    if (!formData.topic.trim()) {
      toast.error("Please enter a dispute topic.");
      return;
    }

    // Validate opponent addresses if opponent type
    if (disputeType === 'opponent') {
      const validAddresses = formData.opponentAddresses.filter(addr => addr.trim() !== "");
      if (validAddresses.length === 0) {
        toast.error("Please add at least one opponent address for opponent disputes.");
        return;
      }
    }

    try {
      // Create dispute on the smart contract
      const args = [{
        respondent: disputeType === 'opponent' ? formData.opponentAddresses[0] as `0x${string}` : address as `0x${string}`,
        title: formData.topic,
        description: formData.topic, // Using topic as description for now
        category: 0, // General category
        priority: 1, // Medium priority
        requiresEscrow: false,
        escrowAmount: BigInt(0),
        customPeriod: BigInt(0),
        evidenceDescriptions: [],
        evidenceHashes: [],
        evidenceSupportsCreator: []
      }];

      console.log('Creating dispute with args:', args);
      console.log('Contract address:', disputeContract.address);

      writeContract({
        ...disputeContract,
        functionName: 'createDispute',
        args,
        value: BigInt(0), // No escrow for now
      });

      toast.success('Creating dispute on blockchain...');
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        <button
          onClick={() => setActiveView("contract-actions")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeView === "contract-actions"
              ? "bg-[var(--app-accent)] text-[var(--app-background)]"
              : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
          }`}
        >
          Contract Actions
        </button>
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

                  {/* Error Handling */}
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

                  {/* Debug Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</div>
                    <div>Network: {getNetworkName(chainId)} {chainId === base.id ? '✅' : '⚠️'}</div>
                    <div>Contract: {disputeContract.address}</div>
                  </div>
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
          {userDisputes.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">
                My Created Disputes ({userDisputes.length})
              </h3>
              <div className="space-y-4">
                {userDisputes.map((dispute) => (
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
                            className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white text-sm px-3 py-1"
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
    </div>
  );
}
