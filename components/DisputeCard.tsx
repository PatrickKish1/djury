"use client";

import { useState } from "react";
import { Icon } from "./DemoComponents";

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

interface DisputeCardProps {
  dispute: Dispute;
  onClick: () => void;
}

export function DisputeCard({ dispute, onClick }: DisputeCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(dispute.bookmarked);

  const handleUpvote = () => {
    if (downvoted) {
      setDownvoted(false);
    }
    setUpvoted(!upvoted);
  };

  const handleDownvote = () => {
    if (upvoted) {
      setUpvoted(false);
    }
    setDownvoted(!downvoted);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  // Get disputer previews based on dispute type
  const getDisputerPreviews = () => {
    if (dispute.type === 'opponent' && dispute.disputer1 && dispute.disputer2) {
      return [
        {
          address: dispute.disputer1.address,
          pointOfView: dispute.disputer1.pointOfView,
          status: dispute.disputer1.status,
          type: 'against' as const
        },
        {
          address: dispute.disputer2.address,
          pointOfView: dispute.disputer2.pointOfView,
          status: dispute.disputer2.status,
          type: 'for' as const
        }
      ];
    } else if (dispute.type === 'general') {
      return [
        {
          address: dispute.creator,
          pointOfView: "General community dispute - open to all",
          status: 'active' as const,
          type: 'general' as const
        }
      ];
    }
    return [];
  };

  const disputerPreviews = getDisputerPreviews();

  return (
    <div 
      onClick={onClick}
      className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] post-card-hover"
    >
      {/* Dispute Type Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            dispute.type === 'opponent' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {dispute.type === 'opponent' ? 'Opponent Dispute' : 'General Dispute'}
          </span>
          {dispute.status === 'draft' && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Draft
            </span>
          )}
        </div>
        <div className="text-sm text-[var(--app-foreground-muted)]">
          {dispute.timestamp}
        </div>
      </div>

      {/* Dispute Topic */}
      <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4 leading-tight">
        {dispute.topic}
      </h3>
      
      {/* Disputers Preview */}
      {disputerPreviews.length > 0 && (
        <div className="space-y-3 mb-4">
          {disputerPreviews.map((disputer, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                disputer.type === 'against' 
                  ? 'border-red-500 bg-red-50' 
                  : disputer.type === 'for'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-500 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--app-foreground)]">
                  {disputer.type === 'against' ? 'Against' : disputer.type === 'for' ? 'For' : 'Creator'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  disputer.status === 'accepted' 
                    ? 'bg-green-100 text-green-800' 
                    : disputer.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {disputer.status}
                </span>
              </div>
              <p className="text-sm text-[var(--app-foreground)] font-mono mb-1">
                {disputer.address}
              </p>
              <p className="text-sm text-[var(--app-foreground-muted)] line-clamp-2">
                {disputer.pointOfView}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Action Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleUpvote();
              }}
              className={`p-2 rounded-lg transition-colors ${
                upvoted ? "bg-green-100 text-green-600" : "hover:bg-[var(--app-accent-light)]"
              }`}
            >
              <Icon name="chevron-up" size="sm" />
            </button>
            <span className="text-sm font-medium text-[var(--app-foreground)]">
              {upvoted ? dispute.upvotes + 1 : dispute.upvotes}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDownvote();
              }}
              className={`p-2 rounded-lg transition-colors ${
                downvoted ? "bg-red-100 text-red-600" : "hover:bg-[var(--app-accent-light)]"
              }`}
            >
              <Icon name="chevron-down" size="sm" />
            </button>
            <span className="text-sm font-medium text-[var(--app-foreground)]">
              {downvoted ? dispute.downvotes + 1 : dispute.downvotes}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-[var(--app-foreground-muted)]">
            <Icon name="repeat" size="sm" />
            <span>{dispute.reposts}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-[var(--app-foreground-muted)]">
            <Icon name="message-circle" size="sm" />
            <span>{dispute.comments}</span>
          </div>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark();
          }}
          className={`p-2 rounded-lg transition-colors ${
            bookmarked ? "bg-[var(--app-accent-light)] text-[var(--app-accent)]" : "hover:bg-[var(--app-accent-light)]"
          }`}
        >
          <Icon name="bookmark" size="sm" />
        </button>
      </div>
    </div>
  );
}
