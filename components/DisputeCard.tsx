"use client";

import { useState } from "react";
import { Icon } from "./DemoComponents";

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

interface DisputeCardProps {
  dispute: Dispute;
  onClick: () => void;
}

export function DisputeCard({ dispute, onClick }: DisputeCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(dispute.bookmarked);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downvoted) {
      setDownvoted(false);
    }
    setUpvoted(!upvoted);
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvoted) {
      setUpvoted(false);
    }
    setDownvoted(!downvoted);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Repost functionality would go here
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Comment functionality would go here
  };

  return (
    <div 
      className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-4 post-card-hover cursor-pointer"
      onClick={onClick}
    >
      {/* Dispute Topic */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-[var(--app-foreground)] leading-tight">
          {dispute.topic}
        </h3>
      </div>

      {/* Disputers Preview */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-sm text-[var(--app-foreground-muted)] mb-1">
              <span className="font-medium text-[var(--app-foreground)]">{dispute.disputer1.address}</span>
              <span className="ml-2 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">Against</span>
            </p>
            <p className="text-sm text-[var(--app-foreground-muted)] line-clamp-2">
              {dispute.disputer1.pointOfView}
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-sm text-[var(--app-foreground-muted)] mb-1">
              <span className="font-medium text-[var(--app-foreground)]">{dispute.disputer2.address}</span>
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">For</span>
            </p>
            <p className="text-sm text-[var(--app-foreground-muted)] line-clamp-2">
              {dispute.disputer2.pointOfView}
            </p>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-[var(--app-foreground-muted)] mb-3">
        {dispute.timestamp}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Upvote Button */}
          <button 
            onClick={handleUpvote}
            className={`flex items-center space-x-2 text-sm transition-colors ${
              upvoted ? "text-green-500" : "text-[var(--app-foreground-muted)] hover:text-green-500"
            }`}
          >
            <Icon name="chevron-up" size="sm" />
            <span>{upvoted ? dispute.upvotes + 1 : dispute.upvotes}</span>
          </button>
          
          {/* Downvote Button */}
          <button 
            onClick={handleDownvote}
            className={`flex items-center space-x-2 text-sm transition-colors ${
              downvoted ? "text-red-500" : "text-[var(--app-foreground-muted)] hover:text-red-500"
            }`}
          >
            <Icon name="chevron-down" size="sm" />
            <span>{downvoted ? dispute.downvotes + 1 : dispute.downvotes}</span>
          </button>
          
          {/* Repost Button */}
          <button 
            onClick={handleRepost}
            className="flex items-center space-x-2 text-sm text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)] transition-colors"
          >
            <Icon name="repeat" size="sm" />
            <span>{dispute.reposts}</span>
          </button>
          
          {/* Comment Button */}
          <button 
            onClick={handleComment}
            className="flex items-center space-x-2 text-sm text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)] transition-colors"
          >
            <Icon name="message-circle" size="sm" />
            <span>{dispute.comments}</span>
          </button>
        </div>
        
        {/* Bookmark Button */}
        <button 
          onClick={handleBookmark}
          className={`transition-colors ${
            bookmarked ? "text-[var(--app-accent)]" : "text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)]"
          }`}
        >
          <Icon name="bookmark" size="sm" />
        </button>
      </div>
    </div>
  );
}
