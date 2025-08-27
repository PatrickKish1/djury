/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Icon } from "./DemoComponents";
import { Button } from "./DemoComponents";
import { useAccount, useSignMessage } from "wagmi";
import Image from "next/image";

// Mock user profile data
const mockUserProfile = {
  address: "0x1234...5678",
  name: "Crypto Enthusiast",
  bio: "Passionate about Web3, DeFi, and blockchain technology. Building the future of decentralized applications.",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  socialLinks: {
    twitter: "https://twitter.com/cryptoenthusiast",
    github: "https://github.com/cryptoenthusiast",
    website: "https://cryptoenthusiast.eth"
  },
  stats: {
    disputesCreated: 12,
    disputesParticipated: 45,
    totalUpvotes: 1234,
    totalDownvotes: 89,
    reputation: 95
  },
  recentActivity: [
    {
      type: "created",
      dispute: "Ghana jollof is the best",
      timestamp: "2h ago"
    },
    {
      type: "participated",
      dispute: "Bitcoin vs Ethereum debate",
      timestamp: "1d ago"
    },
    {
      type: "commented",
      dispute: "Web3 adoption challenges",
      timestamp: "3d ago"
    }
  ]
};

export function ProfileComponent() {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");
  const [userProfile, setUserProfile] = useState({
    address: address || "",
    name: "Crypto Enthusiast",
    bio: "Passionate about Web3, DeFi, and blockchain technology. Building the future of decentralized applications.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    socialLinks: {
      twitter: "https://twitter.com/cryptoenthusiast",
      github: "https://github.com/cryptoenthusiast",
      website: "https://cryptoenthusiast.eth"
    },
    stats: {
      disputesCreated: 12,
      disputesParticipated: 45,
      totalUpvotes: 1234,
      totalDownvotes: 89,
      reputation: 95
    },
    recentActivity: [
      {
        type: "created",
        dispute: "Ghana jollof is the best",
        timestamp: "2h ago"
      },
      {
        type: "participated",
        dispute: "Bitcoin vs Ethereum debate",
        timestamp: "1d ago"
      },
      {
        type: "commented",
        dispute: "Web3 adoption challenges",
        timestamp: "3d ago"
      }
    ]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    bio: userProfile.bio,
    twitter: userProfile.socialLinks.twitter,
    github: userProfile.socialLinks.github,
    website: userProfile.socialLinks.website
  });

  // Update userProfile when wallet connects
  useEffect(() => {
    if (address) {
      setUserProfile(prev => ({
        ...prev,
        address: address
      }));
    }
  }, [address]);

  // Helper function to truncate wallet address
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper function to show notifications
  const showNotificationMessage = (message: string, type: "success" | "error" = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleSignInWithEthereum = async () => {
    if (!address || !signMessage) return;

    setIsSigningIn(true);
    
    try {
      // Create the message to sign - this is the standard SIWE format
      const domain = window.location.host;
      const uri = window.location.origin;
      const chainId = 1; // Ethereum mainnet - you can make this dynamic
      const nonce = Math.random().toString(36).substring(2, 15);
      const issuedAt = new Date().toISOString();
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

      const message = `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in with Ethereum to the app.

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}
Resources:
- https://docs.login.xyz/`;

      // Sign the message
      const signature = await signMessage({ message });
      
      // In a real app, you would send this to your backend for verification
      // The backend would verify the signature and create a session
      console.log("SIWE Message signed:", { 
        message, 
        signature, 
        address,
        domain,
        uri,
        chainId,
        nonce,
        issuedAt,
        expirationTime
      });
      
      // Store the signed message data in localStorage for demo purposes
      // In production, this would be handled by your backend
      localStorage.setItem('siwe_session', JSON.stringify({
        address,
        signature,
        message,
        nonce,
        issuedAt,
        expirationTime
      }));
      
      // Update the user profile to show they're signed in
      setUserProfile(prev => ({
        ...prev,
        name: `User ${truncateAddress(address)}`,
        bio: "Successfully signed in with Ethereum! Your identity is now verified."
      }));
      
      // Show success notification instead of alert
      showNotificationMessage("Successfully signed in with Ethereum! Your identity is now verified and stored.", "success");
      
    } catch (error) {
      console.error('Failed to sign message:', error);
      showNotificationMessage('Failed to sign in. Please try again.', "error");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Check if user has already signed in
  const hasSignedIn = localStorage.getItem('siwe_session');

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setUserProfile(prev => ({
      ...prev,
      name: editForm.name,
      bio: editForm.bio,
      socialLinks: {
        twitter: editForm.twitter,
        github: editForm.github,
        website: editForm.website
      }
    }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: userProfile.name,
      bio: userProfile.bio,
      twitter: userProfile.socialLinks.twitter,
      github: userProfile.socialLinks.github,
      website: userProfile.socialLinks.website
    });
    setIsEditing(false);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="user" size="lg" className="text-[var(--app-accent)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[var(--app-foreground)]">Connect Your Wallet</h1>
        <p className="text-[var(--app-foreground-muted)] mb-6 px-4">
          Connect your wallet to view and manage your profile
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notificationType === "success" 
            ? "bg-green-500 text-white" 
            : "bg-red-500 text-white"
        }`}>
          <div className="flex items-center space-x-2">
            <Icon 
              name={notificationType === "success" ? "check" : "alert-circle"} 
              size="sm" 
              className="text-white" 
            />
            <span className="text-sm font-medium break-words">{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <div className="flex items-start space-x-4">
          <Image
            src={userProfile.avatar}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-[var(--app-accent-light)] flex-shrink-0"
            width={80}
            height={80}
          />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold text-[var(--app-foreground)] bg-[var(--app-background)] border border-[var(--app-card-border)] rounded px-2 py-1 w-full"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="text-[var(--app-foreground)] bg-[var(--app-background)] border border-[var(--app-card-border)] rounded px-2 py-1 w-full resize-none"
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2 break-words">
                  {userProfile.name}
                </h1>
                <p className="text-[var(--app-foreground-muted)] mb-3 break-words">
                  {userProfile.bio}
                </p>
              </>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-[var(--app-foreground-muted)]">
              <Icon name="user" size="sm" className="flex-shrink-0" />
              <span className="font-mono text-[var(--app-accent)] break-all">
                {truncateAddress(userProfile.address)}
              </span>
            </div>
          </div>
          <Button
            onClick={isEditing ? handleSaveProfile : handleEditProfile}
            className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white flex-shrink-0"
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>

        {/* Sign In with Ethereum Button */}
        <div className="mt-4 pt-4 border-t border-[var(--app-card-border)]">
          {hasSignedIn ? (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                <Icon name="check" size="sm" />
                <span className="font-medium">Signed In with Ethereum</span>
              </div>
              <p className="text-xs text-[var(--app-foreground-muted)] px-4">
                Your identity is verified and stored locally
              </p>
              <Button
                onClick={() => {
                  localStorage.removeItem('siwe_session');
                  setUserProfile(prev => ({
                    ...prev,
                    name: "Crypto Enthusiast",
                    bio: "Passionate about Web3, DeFi, and blockchain technology. Building the future of decentralized applications."
                  }));
                }}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={handleSignInWithEthereum}
                disabled={isSigningIn}
                className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white w-full"
              >
                {isSigningIn ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing...
                  </div>
                ) : (
                  "Sign In with Ethereum"
                )}
              </Button>
              <p className="text-xs text-[var(--app-foreground-muted)] mt-2 text-center px-4">
                Verify your identity and unlock social features
              </p>
            </>
          )}
        </div>
      </div>

      {/* Wallet Details */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">Wallet Details</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[var(--app-accent-light)] rounded-lg">
            <span className="text-sm font-medium text-[var(--app-foreground)]">Connected Address:</span>
            <span className="font-mono text-sm text-[var(--app-accent)] break-all">
              {userProfile.address}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--app-accent-light)] rounded-lg">
            <span className="text-sm font-medium text-[var(--app-foreground)]">Display Name:</span>
            <span className="text-sm text-[var(--app-foreground)] break-words">
              {truncateAddress(userProfile.address)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--app-accent-light)] rounded-lg">
            <span className="text-sm font-medium text-[var(--app-foreground)]">Network:</span>
            <span className="text-sm text-[var(--app-foreground)]">Base (Coinbase L2)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--app-accent-light)] rounded-lg">
            <span className="text-sm font-medium text-[var(--app-foreground)]">Connection Status:</span>
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--app-accent-light)] rounded-lg">
            <span className="text-sm font-medium text-[var(--app-foreground)]">Wallet Type:</span>
            <span className="text-sm text-[var(--app-foreground)]">Ethereum Compatible</span>
          </div>
        </div>
        
        {/* Additional Wallet Actions */}
        <div className="mt-4 pt-4 border-t border-[var(--app-card-border)]">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(userProfile.address);
                  showNotificationMessage("Address copied to clipboard!", "success");
                }
              }}
              className="bg-[var(--app-accent-light)] hover:bg-[var(--app-accent)] hover:text-white text-[var(--app-accent)] text-sm"
            >
              Copy Address
            </Button>
            <Button
              onClick={() => {
                const url = `https://basescan.org/address/${userProfile.address}`;
                window.open(url, '_blank');
              }}
              className="bg-[var(--app-accent-light)] hover:bg-[var(--app-accent)] hover:text-white text-[var(--app-accent)] text-sm"
            >
              View on BaseScan
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--app-accent)]">{userProfile.stats.disputesCreated}</div>
            <div className="text-sm text-[var(--app-foreground-muted)] break-words">Disputes Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--app-accent)]">{userProfile.stats.disputesParticipated}</div>
            <div className="text-sm text-[var(--app-foreground-muted)] break-words">Participated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{userProfile.stats.totalUpvotes}</div>
            <div className="text-sm text-[var(--app-foreground-muted)] break-words">Upvotes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--app-accent)]">{userProfile.stats.reputation}%</div>
            <div className="text-sm text-[var(--app-foreground-muted)] break-words">Reputation</div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">Social Links</h2>
        <div className="space-y-3">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--app-foreground)] mb-1">Twitter</label>
                <input
                  type="url"
                  value={editForm.twitter}
                  onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--app-foreground)] mb-1">GitHub</label>
                <input
                  type="url"
                  value={editForm.github}
                  onChange={(e) => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--app-foreground)] mb-1">Website</label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {userProfile.socialLinks.twitter && (
                <a
                  href={userProfile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-[var(--app-accent-light)] rounded-lg hover:bg-[var(--app-accent)] hover:text-white transition-colors"
                >
                  <Icon name="message-circle" size="sm" className="flex-shrink-0" />
                  <span className="break-words">Twitter</span>
                </a>
              )}
              {userProfile.socialLinks.github && (
                <a
                  href={userProfile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-[var(--app-accent-light)] rounded-lg hover:bg-[var(--app-accent)] hover:text-white transition-colors"
                >
                  <Icon name="user" size="sm" className="flex-shrink-0" />
                  <span className="break-words">GitHub</span>
                </a>
              )}
              {userProfile.socialLinks.website && (
                <a
                  href={userProfile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-[var(--app-accent-light)] rounded-lg hover:bg-[var(--app-accent)] hover:text-white transition-colors"
                >
                  <Icon name="home" size="sm" className="flex-shrink-0" />
                  <span className="break-words">Website</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {userProfile.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-[var(--app-accent-light)] rounded-lg">
              <div className="w-8 h-8 bg-[var(--app-accent)] rounded-full flex items-center justify-center flex-shrink-0">
                <Icon 
                  name={activity.type === 'created' ? 'plus' : activity.type === 'participated' ? 'user-check' : 'message-circle'} 
                  size="sm" 
                  className="text-white" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--app-foreground)] break-words">
                  <span className="font-medium">
                    {activity.type === 'created' ? 'Created' : activity.type === 'participated' ? 'Participated in' : 'Commented on'}
                  </span>
                  <span className="ml-1">&quot;{activity.dispute}&quot;</span>
                </div>
                <div className="text-xs text-[var(--app-foreground-muted)]">
                  {activity.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIWE Session Details (when signed in) */}
      {hasSignedIn && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
          <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">SIWE Session Details</h2>
          <div className="space-y-3">
            {(() => {
              try {
                const session = JSON.parse(localStorage.getItem('siwe_session') || '{}');
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">Address</label>
                        <p className="text-sm font-mono text-[var(--app-foreground)] break-all">{session.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">Nonce</label>
                        <p className="text-sm font-mono text-[var(--app-foreground)] break-all">{session.nonce}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">Issued At</label>
                        <p className="text-sm text-[var(--app-foreground)] break-words">{new Date(session.issuedAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">Expires At</label>
                        <p className="text-sm text-[var(--app-foreground)] break-words">{new Date(session.expirationTime).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">Signature</label>
                      <p className="text-xs font-mono text-[var(--app-foreground)] break-all bg-[var(--app-background)] p-2 rounded border">
                        {session.signature}
                      </p>
                    </div>
                  </>
                );
              } catch (error) {
                return <p className="text-[var(--app-foreground-muted)]">Error loading session details</p>;
              }
            })()}
          </div>
        </div>
      )}

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex space-x-3">
          <Button
            onClick={handleCancelEdit}
            className="flex-1 bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            className="flex-1 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
