// Types for comments
export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  type: 'disputers' | 'users';
}

export interface CommentsData {
  disputers: Comment[];
  users: Comment[];
}

// API functions for comments
export async function fetchComments(disputeId: string): Promise<CommentsData> {
  try {
    const response = await fetch(`/api/comments/${disputeId}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    
    const result = await response.json();
    if (result.success) {
      // Store in localStorage as backup
      localStorage.setItem(`comments_${disputeId}`, JSON.stringify(result.data));
      return result.data;
    }
    throw new Error(result.error || 'Failed to fetch comments');
  } catch (error) {
    console.warn('Failed to fetch comments from server, using localStorage:', error);
    // Fallback to localStorage
    return getCommentsFromStorage(disputeId);
  }
}

export async function addComment(
  disputeId: string, 
  comment: Omit<Comment, 'id' | 'timestamp' | 'upvotes' | 'downvotes'>
): Promise<Comment> {
  try {
    const response = await fetch(`/api/comments/${disputeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });
    
    if (!response.ok) throw new Error('Failed to add comment');
    
    const result = await response.json();
    if (result.success) {
      // Update localStorage
      const existingComments = getCommentsFromStorage(disputeId);
      if (comment.type === 'disputers') {
        existingComments.disputers.push(result.data);
      } else {
        existingComments.users.push(result.data);
      }
      localStorage.setItem(`comments_${disputeId}`, JSON.stringify(existingComments));
      
      return result.data;
    }
    throw new Error(result.error || 'Failed to add comment');
  } catch (error) {
    console.warn('Failed to add comment to server, using localStorage:', error);
    // Fallback to localStorage
    return addCommentToStorage(disputeId, comment);
  }
}

export async function updateCommentVote(
  disputeId: string, 
  commentId: string, 
  action: 'upvote' | 'downvote'
): Promise<Comment> {
  try {
    const response = await fetch(`/api/comments/${disputeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentId, action }),
    });
    
    if (!response.ok) throw new Error('Failed to update comment');
    
    const result = await response.json();
    if (result.success) {
      // Update localStorage
      updateCommentVoteInStorage(disputeId, commentId, action);
      return result.data;
    }
    throw new Error(result.error || 'Failed to update comment');
  } catch (error) {
    console.warn('Failed to update comment on server, using localStorage:', error);
    // Fallback to localStorage
    return updateCommentVoteInStorage(disputeId, commentId, action);
  }
}

// localStorage fallback functions
function getCommentsFromStorage(disputeId: string): CommentsData {
  try {
    const stored = localStorage.getItem(`comments_${disputeId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse comments from localStorage:', error);
  }
  
  // Return default structure
  return {
    disputers: [],
    users: []
  };
}

function addCommentToStorage(
  disputeId: string, 
  comment: Omit<Comment, 'id' | 'timestamp' | 'upvotes' | 'downvotes'>
): Comment {
  const newComment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    author: comment.author,
    content: comment.content,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    type: comment.type
  };
  
  const existingComments = getCommentsFromStorage(disputeId);
  
  if (comment.type === 'disputers') {
    existingComments.disputers.push(newComment);
  } else {
    existingComments.users.push(newComment);
  }
  
  localStorage.setItem(`comments_${disputeId}`, JSON.stringify(existingComments));
  return newComment;
}

function updateCommentVoteInStorage(
  disputeId: string, 
  commentId: string, 
  action: 'upvote' | 'downvote'
): Comment {
  const existingComments = getCommentsFromStorage(disputeId);
  
  // Find comment in both arrays
  let comment: Comment | undefined;
  
  comment = existingComments.disputers.find(c => c.id === commentId);
  if (comment) {
    if (action === 'upvote') {
      comment.upvotes += 1;
    } else {
      comment.downvotes += 1;
    }
  } else {
    comment = existingComments.users.find(c => c.id === commentId);
    if (comment) {
      if (action === 'upvote') {
        comment.upvotes += 1;
      } else {
        comment.downvotes += 1;
      }
    }
  }
  
  if (comment) {
    localStorage.setItem(`comments_${disputeId}`, JSON.stringify(existingComments));
  }
  
  return comment!;
}

// Utility function to format timestamp
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
