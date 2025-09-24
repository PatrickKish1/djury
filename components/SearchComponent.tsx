/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Icon } from "./DemoComponents";
// import { Button } from "./DemoComponents";
import { DisputeCard } from "./DisputeCard";

// Mock trending disputes data
const trendingDisputes = [
  {
    id: 101,
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
    timestamp: "1h ago",
    upvotes: 156,
    downvotes: 23,
    reposts: 89,
    comments: 234,
    bookmarked: false
  },
  {
    id: 102,
    topic: "React vs Vue: Which is better for 2024?",
    type: 'general' as const,
    creator: "0x1111...2222",
    status: 'active' as const,
    timestamp: "3h ago",
    upvotes: 89,
    downvotes: 12,
    reposts: 45,
    comments: 167,
    bookmarked: false
  },
  {
    id: 103,
    topic: "Bitcoin vs Ethereum: Store of Value Debate",
    type: 'opponent' as const,
    creator: "0x3333...4444",
    status: 'active' as const,
    disputer1: {
      address: "0x3333...4444",
      pointOfView: "Bitcoin is the ultimate store of value due to its scarcity and security.",
      status: 'accepted' as const
    },
    disputer2: {
      address: "0x5555...6666",
      pointOfView: "Ethereum's utility and smart contracts make it a better long-term investment.",
      status: 'accepted' as const
    },
    timestamp: "5h ago",
    upvotes: 234,
    downvotes: 67,
    reposts: 123,
    comments: 456,
    bookmarked: false
  }
];

// Mock hot topics
const hotTopics = [
  { name: "Web3", count: 1234, trend: "up" },
  { name: "DeFi", count: 987, trend: "up" },
  { name: "NFTs", count: 756, trend: "down" },
  { name: "Layer 2", count: 543, trend: "up" },
  { name: "DAO Governance", count: 432, trend: "up" },
  { name: "Zero Knowledge", count: 321, trend: "up" },
  { name: "MEV", count: 234, trend: "down" },
  { name: "Cross-chain", count: 189, trend: "up" }
];

interface SearchComponentProps {
  onDisputeClick: (disputeId: number) => void;
}

export function SearchComponent({ onDisputeClick }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Search live data from API
      const res = await fetch('/api/disputes', { cache: 'no-store' });
      const json = await res.json();
      
      if (res.ok && json?.success && Array.isArray(json.data)) {
        const results = json.data.filter((dispute: any) => 
          (dispute.title || dispute.topic || '').toLowerCase().includes(query.toLowerCase()) ||
          (dispute.creator || '').toLowerCase().includes(query.toLowerCase()) ||
          (dispute.description || '').toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
      } else {
        // Fallback to mock data
        const results = trendingDisputes.filter(dispute => 
          dispute.topic.toLowerCase().includes(query.toLowerCase()) ||
          dispute.creator.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data
      const results = trendingDisputes.filter(dispute => 
        dispute.topic.toLowerCase().includes(query.toLowerCase()) ||
        dispute.creator.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
    
    setIsSearching(false);
  };

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic);
    handleSearch(topic);
  };

  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Icon 
            name="search" 
            size="sm" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--app-foreground-muted)]" 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disputes, users, or topics..."
            className="w-full pl-10 pr-4 py-3 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--app-accent)]"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">
            Search Results for &quot;{searchQuery}&quot;
          </h2>
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((dispute) => (
                <DisputeCard 
                  key={dispute.id} 
                  dispute={{
                    ...dispute,
                    topic: dispute.title || dispute.topic || 'Untitled Dispute',
                    timestamp: dispute.createdAt ? new Date(dispute.createdAt).toLocaleString() : dispute.timestamp || 'Unknown time'
                  }} 
                  onClick={() => onDisputeClick(dispute.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="search" size="lg" className="mx-auto mb-4 text-[var(--app-foreground-muted)]" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--app-foreground)]">No Results Found</h3>
              <p className="text-[var(--app-foreground-muted)]">Try searching with different keywords</p>
            </div>
          )}
        </div>
      )}

      {/* Trending Disputes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">🔥 Trending Disputes</h2>
        <div className="space-y-4">
          {trendingDisputes.map((dispute) => (
            <DisputeCard 
              key={dispute.id} 
              dispute={dispute} 
              onClick={() => onDisputeClick(dispute.id)}
            />
          ))}
        </div>
      </div>

      {/* Hot Topics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">📈 Hot Topics</h2>
        <div className="grid grid-cols-2 gap-3">
          {hotTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleTopicClick(topic.name)}
              className="p-4 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg hover:border-[var(--app-accent)] transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[var(--app-foreground)]">{topic.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  topic.trend === 'up' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {topic.trend === 'up' ? '↗' : '↘'}
                </span>
              </div>
              <div className="text-sm text-[var(--app-foreground-muted)]">
                {topic.count.toLocaleString()} mentions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">🔍 Recent Searches</h2>
        <div className="flex flex-wrap gap-2">
          {["Web3", "DeFi", "Bitcoin", "Ethereum", "NFTs"].map((term, index) => (
            <button
              key={index}
              onClick={() => handleTopicClick(term)}
              className="px-3 py-2 bg-[var(--app-accent-light)] text-[var(--app-accent)] rounded-full text-sm hover:bg-[var(--app-accent)] hover:text-white transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
