/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { mirrorJson } from '@/lib/storage';
import { retry } from '@/lib/utils';

// Function to ensure Supabase table exists
async function ensureSupabaseTable() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase not configured');
  }

  try {
    // Check if table exists by trying to query it
    const checkUrl = `${SUPABASE_URL}/rest/v1/disputes?select=id&limit=1`;
    const checkRes = await fetch(checkUrl, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });
    
    if (checkRes.ok) {
      // Table exists, we're good
      return;
    }
    
    if (checkRes.status === 404) {
      // Table doesn't exist, provide clear instructions
      console.error('❌ Supabase table "disputes" does not exist!');
      console.error('📋 Please create the table manually:');
      console.error('1. Go to your Supabase Dashboard');
      console.error('2. Go to SQL Editor');
      console.error('3. Run the SQL script from supabase-setup.sql');
      console.error('4. Or copy this SQL:');
      console.error(`
CREATE TABLE IF NOT EXISTS public.disputes (
  id BIGINT PRIMARY KEY,
  creator TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  opponent_addresses TEXT[],
  priority INTEGER DEFAULT 0,
  escrow_amount TEXT DEFAULT '0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);`);
      throw new Error('Supabase table "disputes" does not exist. Please create it manually using the provided SQL script.');
    }
  } catch (error) {
    console.error('Error checking Supabase table:', error);
    throw error;
  }
}


type DisputeType = 'general' | 'opponent';

interface Dispute {
  id: number;
  creator: string;
  title: string;
  description: string;
  type: DisputeType;
  opponentAddresses: string[];
  priority: 0 | 1 | 2;
  escrowAmount: string;
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
  upvotes: number;
  downvotes: number;
}

interface DisputesFile {
  nextId: number;
  items: Dispute[];
}

const dataDir = path.join(process.cwd(), 'data', 'disputes');
const filePath = path.join(dataDir, 'disputes.json');

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  try {
    await fs.access(filePath);
  } catch {
    const initial: DisputesFile = { nextId: 1, items: [] };
    await fs.writeFile(filePath, JSON.stringify(initial, null, 2));
  }
}

async function readDisputes(): Promise<DisputesFile> {
  await ensureDataFile();
  const raw = await fs.readFile(filePath, 'utf-8');
  
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('JSON parse error, attempting to fix corrupted file:', error);
    // Try to fix common JSON corruption issues
    const fixed = raw
      .replace(/,\s*}/g, '}')  // Remove trailing commas before }
      .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
      .replace(/}\s*}/g, '}')  // Remove duplicate closing braces
      .replace(/]\s*]/g, ']')  // Remove duplicate closing brackets
      .replace(/}\s*]/g, '}')  // Fix mismatched braces/brackets
      .replace(/]\s*}/g, ']'); // Fix mismatched brackets/braces
    
    try {
      const parsed = JSON.parse(fixed);
      console.log('Successfully fixed corrupted JSON file');
      // Write the fixed version back
      await fs.writeFile(filePath, JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (fixError) {
      console.error('Could not fix JSON file, creating new one:', fixError);
      // Create a fresh file
      const freshData: DisputesFile = { nextId: 1, items: [] };
      await fs.writeFile(filePath, JSON.stringify(freshData, null, 2));
      return freshData;
    }
  }
}

async function writeDisputes(data: DisputesFile): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    // Try Supabase first
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/disputes?select=*`;
        const res = await retry(() => fetch(url, {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
          },
          cache: 'no-store',
        }));
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            // Filter out deleted disputes and convert snake_case to camelCase
            const activeItems = rows
              .filter((item: any) => item.status !== 'deleted')
              .map((item: any) => ({
                id: item.id,
                creator: item.creator,
                title: item.title,
                description: item.description,
                type: item.type,
                opponentAddresses: item.opponent_addresses || [],
                priority: item.priority,
                escrowAmount: item.escrow_amount,
                createdAt: item.created_at,
                status: item.status,
                upvotes: item.upvotes,
                downvotes: item.downvotes,
              }));
            const items = activeItems.sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0));
            return NextResponse.json({ success: true, data: items });
          }
        }
      } catch (error) {
        console.error('Supabase fetch failed, falling back to local storage:', error);
        // Fallback to local storage
        const store = await readDisputes();
        const items = [...store.items].sort((a, b) => b.id - a.id);
        return NextResponse.json({ success: true, data: items });
      }
    } else {
      console.warn('Supabase not configured, using local storage');
      // Fallback to local storage
      const store = await readDisputes();
      const items = [...store.items].sort((a, b) => b.id - a.id);
      return NextResponse.json({ success: true, data: items });
    }
  } catch (error) {
    console.error('Error reading disputes:', error);
    return NextResponse.json({ success: false, error: 'Failed to read disputes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id: clientId,
      creator,
      title,
      description,
      type,
      opponentAddresses = [],
      priority = 0,
      escrowAmount = '0',
    } = body as {
      id?: number;
      creator: string;
      title: string;
      description?: string;
      type: DisputeType;
      opponentAddresses?: string[];
      priority?: 0 | 1 | 2;
      escrowAmount?: string;
    };

    if (!creator || !title || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Generate ID if not provided
    const id = clientId || Math.floor(Math.random() * 1000000) + 1;

    const dispute: Dispute = {
      id,
      creator,
      title,
      description: description ?? title,
      type,
      opponentAddresses,
      priority,
      escrowAmount,
      createdAt: new Date().toISOString(),
      status: 'active',
      upvotes: 0,
      downvotes: 0,
    };

    // Convert to Supabase format (camelCase to snake_case)
    const supabaseDispute = {
      id: dispute.id,
      creator: dispute.creator,
      title: dispute.title,
      description: dispute.description,
      type: dispute.type,
      opponent_addresses: dispute.opponentAddresses,
      priority: dispute.priority,
      escrow_amount: dispute.escrowAmount,
      created_at: dispute.createdAt,
      status: dispute.status,
      upvotes: dispute.upvotes,
      downvotes: dispute.downvotes,
    };

    // Store in Supabase + Pinata (primary storage)
    try {
      // First, ensure the table exists
      await ensureSupabaseTable();
      
      const result = await mirrorJson({
        table: 'disputes',
        data: supabaseDispute as any,
        targets: { supabase: true, pinata: true },
        pinataOptions: {
          name: `dispute-${dispute.id}.json`,
          keyvalues: { disputeId: String(dispute.id), creator },
        },
      });
      
      if (!result.supabase?.success) {
        console.warn('Supabase storage failed, storing locally as fallback:', result.supabase?.error);
        // Fallback to local storage if Supabase fails
        const store = await readDisputes();
        store.items.push(dispute);
        await writeDisputes(store);
        console.log('Dispute stored locally as fallback');
      } else {
        console.log('Dispute stored successfully in Supabase + IPFS:', result);
      }
    } catch (e) {
      console.error('Failed to store dispute in Supabase/Pinata, using local fallback:', e);
      // Fallback to local storage
      try {
        const store = await readDisputes();
        store.items.push(dispute);
        await writeDisputes(store);
        console.log('Dispute stored locally as fallback');
      } catch (localError) {
        console.error('Local storage also failed:', localError);
        throw new Error(`Failed to store dispute: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json({ success: false, error: 'Failed to create dispute' }, { status: 500 });
  }
}

// DELETE: Soft delete dispute (mark as deleted)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { disputeId, creator } = body as { disputeId: number; creator: string };

    if (!disputeId || !creator) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Update Supabase to mark as deleted
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/disputes?id=eq.${disputeId}&creator=eq.${creator}`;
        await fetch(url, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'deleted' }),
        });
      } catch (e) {
        console.warn('Failed to update Supabase:', e);
      }
    }

    // Also update local file
    const store = await readDisputes();
    const dispute = store.items.find(d => d.id === disputeId && d.creator === creator);
    if (dispute) {
      dispute.status = 'deleted';
      await writeDisputes(store);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dispute:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete dispute' }, { status: 500 });
  }
}
