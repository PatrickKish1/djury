import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Types for comments
interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  type: 'disputers' | 'users';
}

interface CommentsData {
  disputers: Comment[];
  users: Comment[];
}

// Helper function to get comments file path
function getCommentsFilePath(disputeId: string): string {
  const dataDir = path.join(process.cwd(), 'data', 'comments');
  return path.join(dataDir, `${disputeId}.json`);
}

// Helper function to ensure data directory exists
async function ensureDataDirectory(): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'comments');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Helper function to read comments from file
async function readComments(disputeId: string): Promise<CommentsData> {
  try {
    const filePath = getCommentsFilePath(disputeId);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch {
    // Return default structure if file doesn't exist
    return {
      disputers: [],
      users: []
    };
  }
}

// Helper function to write comments to file
async function writeComments(disputeId: string, data: CommentsData): Promise<void> {
  await ensureDataDirectory();
  const filePath = getCommentsFilePath(disputeId);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// GET: Retrieve comments for a dispute
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const { disputeId } = await params;
    const comments = await readComments(disputeId);
    
    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error reading comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read comments' },
      { status: 500 }
    );
  }
}

// POST: Add a new comment to a dispute
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const { disputeId } = await params;
    const body = await request.json();
    
    const { author, content, type } = body;
    
    // Validate required fields
    if (!author || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!['disputers', 'users'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment type' },
        { status: 400 }
      );
    }
    
    // Read existing comments
    const existingComments = await readComments(disputeId);
    
    // Create new comment
    const newComment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author,
      content,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      type: type as 'disputers' | 'users'
    };
    
    // Add comment to appropriate array
    if (type === 'disputers') {
      existingComments.disputers.push(newComment);
    } else {
      existingComments.users.push(newComment);
    }
    
    // Write updated comments to file
    await writeComments(disputeId, existingComments);
    
    return NextResponse.json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// PUT: Update comment (upvote/downvote)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const { disputeId } = await params;
    const body = await request.json();
    
    const { commentId, action } = body;
    
    if (!commentId || !action || !['upvote', 'downvote'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }
    
    // Read existing comments
    const existingComments = await readComments(disputeId);
    
    // Find comment in both arrays
    let comment: Comment | undefined;
    let commentArray: Comment[] | undefined;
    
    comment = existingComments.disputers.find(c => c.id === commentId);
    if (comment) {
      commentArray = existingComments.disputers;
    } else {
      comment = existingComments.users.find(c => c.id === commentId);
      if (comment) {
        commentArray = existingComments.users;
      }
    }
    
    if (!comment || !commentArray) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Update vote count
    if (action === 'upvote') {
      comment.upvotes += 1;
    } else {
      comment.downvotes += 1;
    }
    
    // Write updated comments to file
    await writeComments(disputeId, existingComments);
    
    return NextResponse.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
