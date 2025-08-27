/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "../../../../../components/DemoComponents";
import { Button } from "../../../../../components/DemoComponents";
import { useAccount } from "wagmi";
import { GlobalTabs } from "../../../../../components/GlobalTabs";

// Mock dispute data - in a real app, this would come from an API
const mockDisputes = {
  101: {
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
    opponents: [
      {
        address: "0x9999...0000",
        pointOfView: "",
        status: 'pending'
      }
    ],
    timestamp: "1h ago",
    upvotes: 15,
    downvotes: 3,
    reposts: 8,
    comments: 12,
    bookmarked: false
  }
};

export default function DisputeInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const disputeId = Number(params.id);
  const inviteCode = params.code as string;
  const dispute = mockDisputes[disputeId as keyof typeof mockDisputes];
  
  const [pointOfView, setPointOfView] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if this user is already a disputer
  const isAlreadyDisputer = dispute && (
    dispute.disputer1?.address === address ||
    dispute.disputer2?.address === address ||
    dispute.opponents?.some(opp => opp.address === address)
  );

  // Check if this user has already submitted their POV
  const hasSubmittedPOV = dispute && (
    (dispute.disputer1?.address === address && dispute.disputer1.status === 'accepted') ||
    (dispute.disputer2?.address === address && dispute.disputer2.status === 'accepted') ||
    (dispute.opponents?.some(opp => opp.address === address && opp.status === 'accepted'))
  );

  const handleSubmitPOV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address || !pointOfView.trim()) return;

    setSubmitting(true);
    
    try {
      // Here you would submit to an API to update the dispute
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Submitting POV:", {
        disputeId,
        address,
        pointOfView: pointOfView.trim()
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit POV:', error);
      alert('Failed to submit your point of view. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDispute = () => {
    router.push(`/disputes/${disputeId}`);
  };

  if (!dispute) {
    return (
      <div className="min-h-screen bg-[var(--app-background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">Invalid Invite</h1>
          <p className="text-[var(--app-foreground-muted)] mb-4">This invite link is invalid or has expired.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--app-background)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size="lg" className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">Point of View Submitted!</h1>
          <p className="text-[var(--app-foreground-muted)] mb-6">
            Thank you for participating in this dispute. Your point of view has been recorded.
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleViewDispute}
              className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
            >
              View Dispute
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-background)]">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--app-card-bg)] backdrop-blur-md border-b border-[var(--app-card-border)] z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-[var(--app-accent-light)] rounded-lg transition-colors"
            >
              <Icon name="arrow-left" size="sm" />
            </button>
            <h1 className="text-lg font-semibold text-[var(--app-foreground)]">Dispute Invitation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Invite Header */}
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="user-check" size="lg" className="text-[var(--app-accent)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">{`You're Invited!`}</h1>
            <p className="text-[var(--app-foreground-muted)]">
              {`You've been invited to participate in a dispute. Add your point of view below.`}
            </p>
          </div>

          {/* Dispute Info */}
          <div className="bg-[var(--app-accent-light)] rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">Dispute Topic</h2>
            <p className="text-[var(--app-foreground)] text-lg">{dispute.topic}</p>
            <div className="mt-3 text-sm text-[var(--app-foreground-muted)]">
              Created by: <span className="font-mono">{dispute.creator}</span>
            </div>
          </div>

          {/* Current Disputers */}
          {dispute.disputer1 && dispute.disputer2 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-md font-medium text-[var(--app-foreground)]">Current Disputers</h3>
              
              <div className="border-l-4 border-red-500 pl-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-[var(--app-foreground)]">{dispute.disputer1.address}</span>
                  <span className="text-sm text-[var(--app-foreground-muted)] ml-2">• Against</span>
                </div>
                <p className="text-sm text-[var(--app-foreground-muted)]">
                  {dispute.disputer1.pointOfView}
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-[var(--app-foreground)]">{dispute.disputer2.address}</span>
                  <span className="text-sm text-[var(--app-foreground-muted)] ml-2">• For</span>
                </div>
                <p className="text-sm text-[var(--app-foreground-muted)]">
                  {dispute.disputer2.pointOfView}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Add Point of View */}
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
          <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">Add Your Point of View</h2>
          
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="user" size="lg" className="text-[var(--app-accent)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">Wallet Required</h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                You need to connect your wallet to participate in this dispute.
              </p>
              <Button
                onClick={() => {
                  // This will trigger the wallet connection modal
                  // The user needs to connect their wallet first
                }}
                className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white px-6 py-3"
              >
                Connect Wallet
              </Button>
            </div>
          ) : isAlreadyDisputer && hasSubmittedPOV ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check" size="lg" className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">Already Participated</h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                You have already submitted your point of view for this dispute.
              </p>
              <Button
                onClick={handleViewDispute}
                className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
              >
                View Dispute
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitPOV} className="space-y-4">
              {/* Wallet Info */}
              <div className="p-3 bg-[var(--app-accent-light)] rounded-lg">
                <p className="text-sm text-[var(--app-foreground)]">
                  Participating as: <span className="font-mono text-[var(--app-accent)]">{address}</span>
                </p>
              </div>
              
              {/* Point of View Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                  Your Point of View *
                </label>
                <textarea
                  value={pointOfView}
                  onChange={(e) => setPointOfView(e.target.value)}
                  placeholder="Explain your position on this dispute..."
                  rows={5}
                  className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] resize-none"
                  required
                />
                <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                  Be clear and concise about your position. This will be visible to all participants.
                </p>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!pointOfView.trim() || submitting}
                  className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white py-3"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Point of View"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Icon name="info" size="sm" className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">How This Works</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Submit your point of view on the dispute topic</li>
                <li>• Once submitted, you can view and comment on the dispute</li>
                <li>• Your wallet address will be recorded as a participant</li>
                <li>• You can upvote/downvote other comments and participate in discussions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Global Tabs */}
      <GlobalTabs />
    </div>
  );
}
