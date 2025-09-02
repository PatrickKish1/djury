"use client";

import { useState } from "react";
import { Icon } from "./DemoComponents";
import { Badge } from "./ui/badge";
import { FaBookmark } from "react-icons/fa6";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { disputeContract } from '../lib/contracts';
import { toast } from 'sonner';

interface DisputeCardProps {
  dispute: {
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
  };
  onClick: () => void;
}

export function DisputeCard({ dispute, onClick }: DisputeCardProps) {
  const { address, isConnected } = useAccount();
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(dispute.bookmarked);

  // Contract hooks for voting
  const { writeContract: voteContract, isPending: isVotePending, data: voteHash } = useWriteContract();
  const { isLoading: isVoteLoading, isSuccess: isVoteSuccess } = useWaitForTransactionReceipt({
    hash: voteHash,
  });

  // Handle upvote (supports creator)
  const handleUpvote = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (downvoted) {
      setDownvoted(false);
    }
    setUpvoted(!upvoted);

    try {
      voteContract({
        ...disputeContract,
        functionName: 'castVote',
        args: [
          BigInt(dispute.id),
          true, // supportsCreator = true for upvote
          "Upvoted this dispute" // reason
        ],
      });
      toast.success('Vote submitted...');
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to submit vote');
    }
  };

  // Handle downvote (does not support creator)
  const handleDownvote = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (upvoted) {
      setUpvoted(false);
    }
    setDownvoted(!downvoted);

    try {
      voteContract({
        ...disputeContract,
        functionName: 'castVote',
        args: [
          BigInt(dispute.id),
          false, // supportsCreator = false for downvote
          "Downvoted this dispute" // reason
        ],
      });
      toast.success('Vote submitted...');
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to submit vote');
    }
  };

  // Handle bookmark toggle
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 cursor-pointer hover:shadow-2xl transition-all duration-200 hover:border-gray-300 hover:scale-100" onClick={onClick}>
      {/* Dispute Type Badge */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant={dispute.type === 'general' ? 'general' : 'opponent'}>
          {dispute.type === 'general' ? 'General Dispute' : 'Opponent Dispute'}
        </Badge>
        <span className="text-sm text-gray-500">{dispute.timestamp}</span>
      </div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
            {dispute.topic}
          </h3>
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Creator</span>
              <Badge variant={dispute.status as "active" | "completed" | "draft"}>
                {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{dispute.creator}</p>
            <p className="text-sm text-gray-600 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>General community dispute - open to all</p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark();
          }}
          className={`p-2 rounded-lg transition-colors ${
            bookmarked ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-400"
          }`}
        >
          {bookmarked ? (
            <FaBookmark size={16} />
          ) : (
            <Icon name="bookmark" size="sm" />
          )}
        </button>
      </div>

      {/* Disputers' Points of View */}
      {dispute.disputer1 && (
        <div className="space-y-3 mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-red-600">Against</span>
              <Badge variant="accepted">Accepted</Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{dispute.disputer1.address}</p>
            <p className="text-sm text-gray-600 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{dispute.disputer1.pointOfView}</p>
          </div>
          {dispute.disputer2 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600">For</span>
                <Badge variant="accepted">Accepted</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{dispute.disputer2.address}</p>
              <p className="text-sm text-gray-600 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{dispute.disputer2.pointOfView}</p>
            </div>
          )}
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
              disabled={isVotePending || isVoteLoading}
              className={`p-2 rounded-lg transition-colors ${
                upvoted ? "bg-green-100 text-green-600" : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Icon name="chevron-up" size="sm" />
            </button>
            <span className="text-sm font-medium text-gray-900">
              {upvoted ? dispute.upvotes + 1 : dispute.upvotes}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDownvote();
              }}
              disabled={isVotePending || isVoteLoading}
              className={`p-2 rounded-lg transition-colors ${
                downvoted ? "bg-red-100 text-red-600" : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Icon name="chevron-down" size="sm" />
            </button>
            <span className="text-sm font-medium text-gray-900">
              {downvoted ? dispute.downvotes + 1 : dispute.downvotes}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Icon name="repeat" size="sm" />
            <span>{dispute.reposts}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Icon name="message-circle" size="sm" />
            <span>{dispute.comments}</span>
          </div>
        </div>

        {/* Transaction Status */}
        {(isVotePending || isVoteLoading) && (
          <div className="text-xs text-blue-600">
            <Icon name="refresh-cw" size="sm" className="animate-spin mr-1" />
            Voting...
          </div>
        )}
        {isVoteSuccess && (
          <div className="text-xs text-green-600">
            ✓ Vote recorded
          </div>
        )}
      </div>
    </div>
  );
}
