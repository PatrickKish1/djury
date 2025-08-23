/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "../../../components/DemoComponents";
import { Button } from "../../../components/DemoComponents";

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

// Mock comments data
const mockComments = {
  disputers: [
    {
      id: 1,
      author: "0x9999...0000",
      content: "I agree with the first disputer. One Piece's pacing is indeed problematic.",
      timestamp: "1h ago",
      upvotes: 5,
      downvotes: 2
    },
    {
      id: 2,
      author: "0xaaaa...bbbb",
      content: "The second disputer makes valid points about character development.",
      timestamp: "45m ago",
      upvotes: 3,
      downvotes: 1
    }
  ],
  users: [
    {
      id: 1,
      author: "0xcccc...dddd",
      content: "I think both sides have merit. The pacing could be better but the story is engaging.",
      timestamp: "30m ago",
      upvotes: 8,
      downvotes: 3
    },
    {
      id: 2,
      author: "0xeeee...ffff",
      content: "This is a classic case of different preferences. Some people like slow burns, others don't.",
      timestamp: "15m ago",
      upvotes: 12,
      downvotes: 1
    },
    {
      id: 3,
      author: "0xgggg...hhhh",
      content: "I've never watched One Piece but this debate is making me curious.",
      timestamp: "5m ago",
      upvotes: 6,
      downvotes: 0
    }
  ]
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = Number(params.id);
  const dispute = mockDisputes[disputeId as keyof typeof mockDisputes];
  const [activeTab, setActiveTab] = useState<"disputers" | "users">("disputers");
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(dispute?.bookmarked || false);

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
          <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-4">Comments & Views</h2>
          
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
              {`Disputers' Views`}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "users"
                  ? "bg-[var(--app-accent)] text-[var(--app-background)]"
                  : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
              }`}
            >
              User Comments
            </button>
          </div>
          
          {/* Comments List */}
          <div className="space-y-4">
            {activeTab === "disputers" ? (
              mockComments.disputers.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              mockComments.users.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment Card Component
function CommentCard({ comment }: { comment: any }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

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

  return (
    <div className="border border-[var(--app-card-border)] rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center">
          <Icon name="user" size="sm" className="text-[var(--app-accent)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-[var(--app-foreground)]">{comment.author}</span>
            <span className="text-xs text-[var(--app-foreground-muted)]">{comment.timestamp}</span>
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
              <span>{upvoted ? comment.upvotes + 1 : comment.upvotes}</span>
            </button>
            
            <button 
              onClick={handleDownvote}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                downvoted ? "text-red-500" : "text-[var(--app-foreground-muted)] hover:text-red-500"
              }`}
            >
              <Icon name="chevron-down" size="sm" />
              <span>{downvoted ? comment.downvotes + 1 : comment.downvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
