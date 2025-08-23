/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "../components/DemoComponents";
import { Icon } from "../components/DemoComponents";
import { DisputeCard } from "../components/DisputeCard";
import { useRouter } from "next/navigation";
import { DisputesManagement } from "../components/DisputesManagement";
import Image from "next/image";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  console.log(openUrl);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    // Check if user has seen splash screen before
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
      // User has seen splash before, skip it
      setShowSplash(false);
    } else {
      // First time user, show splash for 2 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Mark that user has seen splash
        localStorage.setItem('hasSeenSplash', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  // Mock disputes data
  const disputes = [
    {
      id: 1,
      topic: "Ghana jollof is the best",
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious."
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious."
      },
      timestamp: "2h ago",
      upvotes: 24,
      downvotes: 8,
      reposts: 12,
      comments: 18,
      bookmarked: false
    },
    {
      id: 2,
      topic: "MoMo charges is a way of supporting telcos and government",
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "MoMo charges is a way of supporting telcos and government because it is a way of supporting the economy and the government. It is not just charges but a way of supporting the economy and the government."
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "MoMo charges are not reasonable and should be reduced. They should be removed completely."
      },
      timestamp: "2h ago",
      upvotes: 24,
      downvotes: 8,
      reposts: 12,
      comments: 18,
      bookmarked: false
    },
    {
      id: 3,
      topic: "One Piece is a really great anime",
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "One Piece has terrible pacing and filler episodes that make it unwatchable. The story drags on unnecessarily and the animation quality is inconsistent."
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "One Piece is a masterpiece with deep storytelling, complex characters, and meaningful themes. The pacing allows for proper character development."
      },
      timestamp: "2h ago",
      upvotes: 24,
      downvotes: 8,
      reposts: 12,
      comments: 18,
      bookmarked: false
    },
    {
      id: 4,
      topic: "React is better than Vue for enterprise applications",
      disputer1: {
        address: "0x1111...2222",
        pointOfView: "React's ecosystem is more mature, has better TypeScript support, and larger community. It's the industry standard for enterprise."
      },
      disputer2: {
        address: "0x3333...4444",
        pointOfView: "Vue is more intuitive, has better performance, and cleaner syntax. It's easier to learn and maintain for teams."
      },
      timestamp: "4h ago",
      upvotes: 18,
      downvotes: 5,
      reposts: 7,
      comments: 12,
      bookmarked: true
    },
    {
      id: 5,
      topic: "Coffee is superior to tea",
      disputer1: {
        address: "0x5555...6666",
        pointOfView: "Coffee provides better caffeine boost, has richer flavor profiles, and is more versatile for different brewing methods."
      },
      disputer2: {
        address: "0x7777...8888",
        pointOfView: "Tea is healthier, has calming properties, and offers more variety in flavors and health benefits."
      },
      timestamp: "6h ago",
      upvotes: 31,
      downvotes: 15,
      reposts: 23,
      comments: 28,
      bookmarked: false
    }
  ];

  const handleDisputeClick = (disputeId: number) => {
    router.push(`/disputes/${disputeId}`);
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--app-accent)] to-[var(--app-accent-hover)] flex items-center justify-center z-50 splash-fade-in">
        <div className="text-center splash-scale-in">
          <Image
            src="https://png.pngtree.com/png-clipart/20250109/original/pngtree-social-media-marketing-for-business-flat-vector-illustration-png-image_19680874.png"
            alt="Social Media App"
            className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-2xl"
            width={128}
            height={128}
            unoptimized={true}
          />
          <h1 className="text-4xl font-bold text-white mb-2">DJury</h1>
          <p className="text-white/80 text-lg">Decentralized Social Media</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      {/* Header */}
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[var(--app-accent)]">DJury</h1>
          </div>
          <div className="flex items-center space-x-2">
            {saveFrameButton}
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
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-20">
          {activeTab === "home" && (
            <div className="space-y-4 animate-fade-in">
              {disputes.map((dispute) => (
                <DisputeCard 
                  key={dispute.id} 
                  dispute={dispute} 
                  onClick={() => handleDisputeClick(dispute.id)}
                />
              ))}
            </div>
          )}
          {activeTab === "search" && (
            <div className="text-center py-8 animate-fade-in">
              <Icon name="search" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h2 className="text-xl font-semibold mb-2">Search</h2>
              <p className="text-[var(--app-foreground-muted)]">Search for disputes, users, and topics</p>
            </div>
          )}
          {activeTab === "disputes" && (
            <div className="space-y-4 animate-fade-in">
              <DisputesManagement />
            </div>
          )}
          {activeTab === "profile" && (
            <div className="text-center py-8 animate-fade-in">
              <Icon name="user" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h2 className="text-xl font-semibold mb-2">Profile</h2>
              <p className="text-[var(--app-foreground-muted)]">View and edit your profile</p>
            </div>
          )}
        </main>

        {/* Floating Tab Bar */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
          <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--app-card-border)] px-2 py-2">
            <div className="flex space-x-1">
              {[
                { id: "home", label: "Home", icon: "home" as const },
                { id: "search", label: "Search", icon: "search" as const },
                { id: "disputes", label: "Disputes", icon: "alert-circle" as const },
                { id: "profile", label: "Profile", icon: "user" as const }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-[var(--app-accent)] text-[var(--app-background)] tab-active"
                      : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] hover:bg-[var(--app-accent-light)]"
                  }`}
                >
                  <Icon name={tab.icon} size="sm" className="mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
