"use client";

import { useState } from "react";
import { Icon } from "./DemoComponents";
import { Button } from "./DemoComponents";
import { DisputeCard } from "./DisputeCard";
import { useAccount } from "wagmi";

interface Dispute {
  id: number;
  topic: string;
  disputer1: {
    address: string;
    pointOfView: string;
  };
  disputer2: {
    address: string;
    pointOfView: string;
  };
  timestamp: string;
  upvotes: number;
  downvotes: number;
  reposts: number;
  comments: number;
  bookmarked: boolean;
}

export function DisputesManagement() {
  const { address, isConnected } = useAccount();
  const [activeView, setActiveView] = useState<"create" | "my-disputes">("create");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    disputer1Address: "",
    disputer1PointOfView: "",
    disputer2Address: "",
    disputer2PointOfView: ""
  });

  // Mock user's created disputes
  const userDisputes: Dispute[] = [
    {
      id: 101,
      topic: "Ghana jollof is the best",
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious."
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious."
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
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "MoMo charges are reasonable and help support the telco infrastructure."
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "MoMo charges are too high and should be reduced significantly."
      },
      timestamp: "3h ago",
      upvotes: 8,
      downvotes: 12,
      reposts: 5,
      comments: 18,
      bookmarked: true
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      alert("Please connect your wallet to create a dispute.");
      return;
    }
    
    // Here you would typically submit to an API
    console.log("Creating new dispute:", formData);
    
    // Reset form and hide it
    setFormData({
      topic: "",
      disputer1Address: "",
      disputer1PointOfView: "",
      disputer2Address: "",
      disputer2PointOfView: ""
    });
    setShowCreateForm(false);
    
    // Show success message or redirect
    alert("Dispute created successfully!");
  };

  const handleDisputeClick = (disputeId: number) => {
    // Navigate to dispute detail page
    window.location.href = `/disputes/${disputeId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--app-foreground)]">Disputes Management</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
        >
          {showCreateForm ? "Cancel" : "Create New Dispute"}
        </Button>
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
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Wallet Info */}
                  <div className="p-3 bg-[var(--app-accent-light)] rounded-lg">
                    <p className="text-sm text-[var(--app-foreground)]">
                      Creating dispute as: <span className="font-mono text-[var(--app-accent)]">{address}</span>
                    </p>
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

                  {/* Disputer 1 */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-[var(--app-foreground)]">First Disputer (Against)</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                        Wallet Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.disputer1Address}
                        onChange={(e) => handleInputChange("disputer1Address", e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                        Point of View *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.disputer1PointOfView}
                        onChange={(e) => handleInputChange("disputer1PointOfView", e.target.value)}
                        placeholder="Explain why this disputer is against the topic..."
                        className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] resize-none"
                      />
                    </div>
                  </div>

                  {/* Disputer 2 */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-[var(--app-foreground)]">Second Disputer (For)</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                        Wallet Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.disputer2Address}
                        onChange={(e) => handleInputChange("disputer2Address", e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                        Point of View *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.disputer2PointOfView}
                        onChange={(e) => handleInputChange("disputer2PointOfView", e.target.value)}
                        placeholder="Explain why this disputer is for the topic..."
                        className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white py-3"
                    >
                      Create Dispute
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="plus" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">Ready to Create a Dispute?</h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                Start a new debate by creating a dispute between two parties with opposing views.
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
                  <DisputeCard 
                    key={dispute.id} 
                    dispute={dispute} 
                    onClick={() => handleDisputeClick(dispute.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="alert-circle" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">No Disputes Created Yet</h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                {`You haven't created any disputes yet. Start by creating your first dispute!`}
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
    </div>
  );
}
