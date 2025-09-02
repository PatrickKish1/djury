/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  WalletModal,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "../components/DemoComponents";
import { Icon } from "../components/DemoComponents";
import { DisputeCard } from "../components/DisputeCard";
import { useRouter } from "next/navigation";
import { DisputesManagement } from "../components/DisputesManagement";
import { SearchComponent } from "../components/SearchComponent";
import { ProfileComponent } from "../components/ProfileComponent";
import { GlobalTabs } from "../components/GlobalTabs";
import Image from "next/image";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";


export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<"home" | "disputes" | "search" | "profile">("home");
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

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

  // Mock disputes data - in a real app, this would come from an API
  const disputes = [
    {
      id: 1,
      topic: "Ghana jollof is the best",
      type: 'opponent' as const,
      creator: "0x1234...5678",
      status: 'active' as const,
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious.",
        status: 'accepted' as const
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "Ghana jollof is the best because it is the most popular and most delicious.",
        status: 'accepted' as const
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
      type: 'general' as const,
      creator: "0x1234...5678",
      status: 'active' as const,
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
      type: 'opponent' as const,
      creator: "0x1234...5678",
      status: 'active' as const,
      disputer1: {
        address: "0x1234...5678",
        pointOfView: "One Piece has terrible pacing and filler episodes that make it unwatchable. The story drags on unnecessarily and the animation quality is inconsistent. Many episodes feel like they're just wasting time with unnecessary dialogue and repetitive scenes. The character designs are also quite strange and off-putting to many viewers.",
        status: 'accepted' as const
      },
      disputer2: {
        address: "0x8765...4321",
        pointOfView: "One Piece is a masterpiece with deep storytelling, complex characters, and meaningful themes. The pacing allows for proper character development and world-building. The filler episodes are actually quite entertaining and add depth to the story. The animation quality has improved significantly over time, and the character designs are unique and memorable.",
        status: 'accepted' as const
      },
      timestamp: "6h ago",
      upvotes: 31,
      downvotes: 15,
      reposts: 23,
      comments: 28,
      bookmarked: false
    },
    {
      id: 4,
      topic: "React is better than Vue for enterprise applications",
      type: 'opponent' as const,
      creator: "0x1111...2222",
      status: 'active' as const,
      disputer1: {
        address: "0x1111...2222",
        pointOfView: "React's ecosystem is more mature, has better TypeScript support, and larger community. It's the industry standard for enterprise applications with proven scalability and performance. The learning curve is worth it for the flexibility and power it provides.",
        status: 'accepted' as const
      },
      disputer2: {
        address: "0x3333...4444",
        pointOfView: "Vue is more intuitive, has better performance, and cleaner syntax. It's easier to learn and maintain for teams, especially those new to frontend development. The documentation is excellent and the framework is more opinionated, leading to better consistency.",
        status: 'accepted' as const
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
      type: 'general' as const,
      creator: "0x5555...6666",
      status: 'active' as const,
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
            priority={true}
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
            {/* <NetworkSwitcher /> */}
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
              <WalletModal isOpen={showModal} onClose={() => {setShowModal(false)}} />
            </Wallet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-20">
          {activeView === "home" && (
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
          {activeView === "disputes" && (
            <div className="space-y-4 animate-fade-in">
              <DisputesManagement />
            </div>
          )}
          {activeView === "search" && (
            <div className="space-y-4 animate-fade-in">
              <SearchComponent onDisputeClick={handleDisputeClick} />
            </div>
          )}
          {activeView === "profile" && (
            <div className="space-y-4 animate-fade-in">
              <ProfileComponent />
            </div>
          )}
        </main>

        {/* Global Tabs */}
        <GlobalTabs 
          onTabChange={(tabId) => {
            if (tabId === "home") setActiveView("home");
            if (tabId === "disputes") setActiveView("disputes");
            if (tabId === "search") setActiveView("search");
            if (tabId === "profile") setActiveView("profile");
          }}
          isMainPage={true}
          currentActiveView={activeView}
        />
      </div>
    </div>
  );
}
