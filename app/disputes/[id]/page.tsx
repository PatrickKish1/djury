"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "../../../components/DemoComponents";
import { Button } from "../../../components/DemoComponents";
import { fetchComments, addComment, updateCommentVote, type Comment, type CommentsData, formatTimestamp } from "../../../lib/comments";
import { useAccount } from "wagmi";
import { GlobalTabs } from "../../../components/GlobalTabs";

// Mock dispute data - in a real app, this would come from an API
const mockDisputes = {
  1: {
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
  2: {
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
  3: {
    id: 3,
    topic: "One Piece is a really great anime",
    disputer1: {
      address: "0x1234...5678",
      pointOfView: "One Piece has terrible pacing and filler episodes that make it unwatchable. The story drags on unnecessarily and the animation quality is inconsistent. Many episodes feel like they're just wasting time with unnecessary dialogue and repetitive scenes. The character designs are also quite strange and off-putting to many viewers."
    },
    disputer2: {
      address: "0x8765...4321",
      pointOfView: "One Piece is a masterpiece with deep storytelling, complex characters, and meaningful themes. The pacing allows for proper character development and world-building. The filler episodes are actually quite entertaining and add depth to the story. The animation quality has improved significantly over time, and the character designs are unique and memorable."
    },
    timestamp: "6h ago",
    upvotes: 31,
    downvotes: 15,
    reposts: 23,
    comments: 28,
    bookmarked: false
  },
  4: {
    id: 4,
    topic: "React is better than Vue for enterprise applications",
    disputer1: {
      address: "0x1111...2222",
      pointOfView: "React's ecosystem is more mature, has better TypeScript support, and larger community. It's the industry standard for enterprise applications with proven scalability and performance. The learning curve is worth it for the flexibility and power it provides."
    },
    disputer2: {
      address: "0x3333...4444",
      pointOfView: "Vue is more intuitive, has better performance, and cleaner syntax. It's easier to learn and maintain for teams, especially those new to frontend development. The documentation is excellent and the framework is more opinionated, leading to better consistency."
    },
    timestamp: "4h ago",
    upvotes: 18,
    downvotes: 5,
    reposts: 7,
    comments: 12,
    bookmarked: true
  },
  5: {
    id: 5,
    topic: "Coffee is superior to tea",
    disputer1: {
      address: "0x5555...6666",
      pointOfView: "Coffee provides better caffeine boost, has richer flavor profiles, and is more versatile for different brewing methods. The ritual of making coffee is more engaging and the variety of beans and roasts offers endless exploration."
    },
    disputer2: {
      address: "0x7777...8888",
      pointOfView: "Tea is healthier, has calming properties, and offers more variety in flavors and health benefits. It's more sustainable and has a longer cultural history. The different types of tea provide unique experiences for different moods and occasions."
    },
    timestamp: "6h ago",
    upvotes: 31,
    downvotes: 15,
    reposts: 23,
    comments: 28,
    bookmarked: false
  },
  // User-created disputes
  101: {
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
  102: {
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
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const disputeId = Number(params.id);
  const dispute = mockDisputes[disputeId as keyof typeof mockDisputes];
  const [activeTab, setActiveTab] = useState<"disputers" | "users">("disputers");
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(dispute?.bookmarked || false);
  
  // Comments state
  const [comments, setComments] = useState<CommentsData>({ disputers: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState({
    content: "",
    type: activeTab as 'disputers' | 'users'
  });

  // Load comments on component mount
  useEffect(() => {
    if (dispute) {
      loadComments();
    }
  }, [dispute]);

  // Update comment type when tab changes
  useEffect(() => {
    setNewComment(prev => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await fetchComments(disputeId.toString());
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.content.trim() || !isConnected || !address) return;

    try {
      const addedComment = await addComment(disputeId.toString(), {
        author: address,
        content: newComment.content.trim(),
        type: newComment.type
      });

      // Update local state
      setComments(prev => ({
        ...prev,
        [newComment.type]: [...prev[newComment.type], addedComment]
      }));

      // Reset form
      setNewComment({ content: "", type: newComment.type });
      setShowAddComment(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleCommentVote = async (commentId: string, action: 'upvote' | 'downvote') => {
    try {
      const updatedComment = await updateCommentVote(disputeId.toString(), commentId, action);
      
      // Update local state
      setComments(prev => ({
        disputers: prev.disputers.map(c => c.id === commentId ? updatedComment : c),
        users: prev.users.map(c => c.id === commentId ? updatedComment : c)
      }));
    } catch (error) {
      console.error('Failed to update comment vote:', error);
    }
  };

  if (!dispute) {
    return (
      <div className="min-h-screen bg-[var(--app-background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">Dispute Not Found</h1>
          <p className="text-[var(--app-foreground-muted)] mb-4">{`The dispute you're looking for doesn't exist.`}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-[var(--app-background)]">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--app-card-bg)] backdrop-blur-md border-b border-[var(--app-card-border)] z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[var(--app-accent-light)] rounded-lg transition-colors"
            >
              <Icon name="arrow-left" size="sm" />
            </button>
            <h1 className="text-lg font-semibold text-[var(--app-foreground)]">Dispute Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Dispute Topic */}
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6 mb-6">
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-4 leading-tight">
            {dispute.topic}
          </h1>
          
          {/* Action Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleUpvote}
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
                  onClick={handleDownvote}
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
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                bookmarked ? "bg-[var(--app-accent-light)] text-[var(--app-accent)]" : "hover:bg-[var(--app-accent-light)]"
              }`}
            >
              <Icon name="bookmark" size="sm" />
            </button>
          </div>
          
          <div className="text-sm text-[var(--app-foreground-muted)]">
            {dispute.timestamp}
          </div>
        </div>

        {/* Disputers' Points of View */}
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">{`Disputers' Points of View`}</h2>
          
          <div className="space-y-4">
            {/* Disputer 1 */}
            <div className="border-l-4 border-red-500 pl-4">
              <div className="mb-2">
                <span className="text-sm font-medium text-[var(--app-foreground)]">{dispute.disputer1.address}</span>
                <span className="text-sm text-[var(--app-foreground-muted)] ml-2">• Disputer 1</span>
              </div>
              <p className="text-[var(--app-foreground)] leading-relaxed">
                {dispute.disputer1.pointOfView}
              </p>
            </div>
            
            {/* Disputer 2 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="mb-2">
                <span className="text-sm font-medium text-[var(--app-foreground)]">{dispute.disputer2.address}</span>
                <span className="text-sm text-[var(--app-foreground-muted)] ml-2">• Disputer 2</span>
              </div>
              <p className="text-[var(--app-foreground)] leading-relaxed">
                {dispute.disputer2.pointOfView}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--app-foreground)]">Comments & Views</h2>
            <div className="flex items-center space-x-2">
              <Button
                onClick={loadComments}
                disabled={loading}
                className="bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]"
              >
                <Icon name="refresh-cw" size="sm" className="mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowAddComment(!showAddComment)}
                className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
              >
                {showAddComment ? "Cancel" : "Add Comment"}
              </Button>
            </div>
          </div>
          
          {/* Add Comment Form */}
          {showAddComment && (
            <div className="mb-6 p-4 border border-[var(--app-card-border)] rounded-lg">
              {!isConnected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="user" size="lg" className="text-[var(--app-accent)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[var(--app-foreground)]">Wallet Required</h3>
                  <p className="text-[var(--app-foreground-muted)] mb-6">
                    You need to connect your wallet to add comments and participate in discussions.
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
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="mb-3 p-3 bg-[var(--app-accent-light)] rounded-lg">
                    <p className="text-sm text-[var(--app-foreground)]">
                      Commenting as: <span className="font-mono text-[var(--app-accent)]">{address}</span>
                    </p>
                  </div>
                  <textarea
                    value={newComment.content}
                    onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={`Add your comment to the ${activeTab === 'disputers' ? 'disputers' : 'users'} discussion...`}
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] resize-none"
                    required
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
                      disabled={!newComment.content.trim()}
                    >
                      Post Comment
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-[var(--app-gray)] rounded-lg p-1">
            <button
              onClick={() => setActiveTab("disputers")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "disputers"
                  ? "bg-[var(--app-accent)] text-[var(--app-background)]"
                  : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
              }`}
            >
              {`Disputers' Views`} ({comments.disputers.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "users"
                  ? "bg-[var(--app-accent)] text-[var(--app-background)]"
                  : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
              }`}
            >
              User Comments ({comments.users.length})
            </button>
          </div>
          
          {/* Comments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)] mx-auto"></div>
                <p className="text-[var(--app-foreground-muted)] mt-2">Loading comments...</p>
              </div>
            ) : activeTab === "disputers" ? (
              comments.disputers.length > 0 ? (
                comments.disputers.map((comment) => (
                  <CommentCard 
                    key={comment.id} 
                    comment={comment} 
                    onVote={handleCommentVote}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-[var(--app-foreground-muted)]">
                  No comments yet. Be the first to add your thoughts!
                </div>
              )
            ) : (
              comments.users.length > 0 ? (
                comments.users.map((comment) => (
                  <CommentCard 
                    key={comment.id} 
                    comment={comment} 
                    onVote={handleCommentVote}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-[var(--app-foreground-muted)]">
                  No comments yet. Be the first to add your thoughts!
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Global Tabs */}
      <GlobalTabs />
    </div>
  );
}

// Comment Card Component
function CommentCard({ 
  comment, 
  onVote 
}: { 
  comment: Comment; 
  onVote: (commentId: string, action: 'upvote' | 'downvote') => void;
}) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  const handleUpvote = () => {
    if (downvoted) {
      setDownvoted(false);
    }
    setUpvoted(!upvoted);
    onVote(comment.id, 'upvote');
  };

  const handleDownvote = () => {
    if (upvoted) {
      setUpvoted(false);
    }
    setDownvoted(!downvoted);
    onVote(comment.id, 'downvote');
  };

  return (
    <div className="border border-[var(--app-card-border)] rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center">
          <Icon name="user" size="sm" className="text-[var(--app-accent)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-mono font-medium text-[var(--app-foreground)]">{comment.author}</span>
            <span className="text-xs text-[var(--app-foreground-muted)]">{formatTimestamp(comment.timestamp)}</span>
          </div>
          <p className="text-[var(--app-foreground)] mb-3 leading-relaxed">{comment.content}</p>
          
          {/* Comment Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleUpvote}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                upvoted ? "text-green-500" : "text-[var(--app-foreground-muted)] hover:text-green-500"
              }`}
            >
              <Icon name="chevron-up" size="sm" />
              <span>{comment.upvotes}</span>
            </button>
            
            <button 
              onClick={handleDownvote}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                downvoted ? "text-red-500" : "text-[var(--app-foreground-muted)] hover:text-red-500"
              }`}
            >
              <Icon name="chevron-down" size="sm" />
              <span>{comment.downvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
