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
import Image from "next/image";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showSplash, setShowSplash] = useState(true);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  console.log(openUrl);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
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

  // Mock social media posts data
  const posts = [
    {
      id: 1,
      author: "Alice Web3",
      handle: "@alice.web3",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      content: "Just deployed my first smart contract on Base! 🚀 The future of decentralized social media is here.",
      timestamp: "2h ago",
      likes: 24,
      reposts: 8,
      comments: 12,
      bookmarked: false
    },
    {
      id: 2,
      author: "Bob Builder",
      handle: "@bob.builder",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      content: "Building the next generation of social apps with MiniKit. The developer experience is incredible! 💻✨",
      timestamp: "4h ago",
      likes: 18,
      reposts: 5,
      comments: 7,
      bookmarked: true
    },
    {
      id: 3,
      author: "Crypto Cathy",
      handle: "@crypto.cathy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cathy",
      content: "Farcaster frames are revolutionizing how we think about social media. Web3 native from the ground up! 🔥",
      timestamp: "6h ago",
      likes: 31,
      reposts: 15,
      comments: 23,
      bookmarked: false
    }
  ];

  // Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--app-accent)] to-[var(--app-accent-hover)] flex items-center justify-center z-50 splash-fade-in">
        <div className="text-center splash-scale-in">
          <Image
            src="https://png.pngtree.com/png-clipart/20250109/original/pngtree-social-media-marketing-for-business-flat-vector-illustration-png-image_19680874.png"
            alt="Social Media App"
            width={128}
            height={128}
            className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-2xl"
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
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          {activeTab === "search" && (
            <div className="text-center py-8 animate-fade-in">
              <Icon name="search" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h2 className="text-xl font-semibold mb-2">Search</h2>
              <p className="text-[var(--app-foreground-muted)]">Search for posts, users, and topics</p>
            </div>
          )}
          {activeTab === "disputes" && (
            <div className="text-center py-8 animate-fade-in">
              <Icon name="alert-circle" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h2 className="text-xl font-semibold mb-2">Disputes</h2>
              <p className="text-[var(--app-foreground-muted)]">Manage content disputes and moderation</p>
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

// Post Card Component
function PostCard({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);

  return (
    <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-4 post-card-hover">
      <div className="flex space-x-3">
        <Image 
          src={post.avatar} 
          alt={post.author}
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
          unoptimized={true}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-[var(--app-foreground)]">{post.author}</span>
            <span className="text-[var(--app-foreground-muted)] text-sm">{post.handle}</span>
            <span className="text-[var(--app-foreground-muted)] text-sm">•</span>
            <span className="text-[var(--app-foreground-muted)] text-sm">{post.timestamp}</span>
          </div>
          <p className="text-[var(--app-foreground)] mb-3 leading-relaxed">{post.content}</p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setLiked(!liked)}
                className={`flex items-center space-x-2 text-sm transition-colors ${
                  liked ? "text-red-500" : "text-[var(--app-foreground-muted)] hover:text-red-500"
                }`}
              >
                <Icon name="heart" size="sm" />
                <span>{liked ? post.likes + 1 : post.likes}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-sm text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)] transition-colors">
                <Icon name="repeat" size="sm" />
                <span>{post.reposts}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-sm text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)] transition-colors">
                <Icon name="message-circle" size="sm" />
                <span>{post.comments}</span>
              </button>
            </div>
            
            <button 
              onClick={() => setBookmarked(!bookmarked)}
              className={`transition-colors ${
                bookmarked ? "text-[var(--app-accent)]" : "text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)]"
              }`}
            >
              <Icon name="bookmark" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
