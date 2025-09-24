import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { mirrorJson } from '@/lib/storage';

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

// Helper to check if an address is a disputer (creator or invited opponent)
async function isAuthorizedDisputer(disputeId: string, address: string): Promise<boolean> {
  try {
    const disputesPath = path.join(process.cwd(), 'data', 'disputes', 'disputes.json');
    const raw = await fs.readFile(disputesPath, 'utf-8');
    const store = JSON.parse(raw) as { items: Array<{ id: number; creator: string; opponentAddresses?: string[] }> };
    const numericId = Number(disputeId);
    const dispute = store.items.find((d) => d.id === numericId);
    if (!dispute) return false;
    const authorLc = address.toLowerCase();
    if (dispute.creator?.toLowerCase() === authorLc) return true;
    const opps = dispute.opponentAddresses || [];
    return opps.some((o) => (o || '').toLowerCase() === authorLc);
  } catch {
    return false;
  }
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

    // Enforce permissions: only creator or invited opponents can post as 'disputers'
    if (type === 'disputers') {
      const allowed = await isAuthorizedDisputer(disputeId, author);
      if (!allowed) {
        return NextResponse.json(
          { success: false, error: 'Not allowed to comment in disputers section' },
          { status: 403 }
        );
      }
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
    
    // Write updated comments to file (legacy local dev persistence)
    await writeComments(disputeId, existingComments);

    // Mirror to Supabase and Pinata
    const mirrorPayload = {
      dispute_id: disputeId,
      comment_id: newComment.id,
      author: newComment.author,
      content: newComment.content,
      type: newComment.type,
      timestamp: newComment.timestamp,
      upvotes: newComment.upvotes,
      downvotes: newComment.downvotes,
    };
    const mirror = await mirrorJson({
      table: 'comments',
      data: mirrorPayload,
      targets: { supabase: true, pinata: true },
      pinataOptions: {
        name: `comment-${disputeId}-${newComment.id}.json`,
        keyvalues: { disputeId, commentId: newComment.id, type: newComment.type },
      },
    });
    // Attach mirror result for observability (non-fatal if one target failed)
    const meta = { mirror };
    
    return NextResponse.json({ success: true, data: newComment, meta });
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
