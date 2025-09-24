/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { retry } from '@/lib/utils';

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
  return JSON.parse(raw);
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
            const items = rows.sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0));
            return NextResponse.json({ success: true, data: items });
          }
        }
      } catch {
        // fall back
      }
    }

    const store = await readDisputes();
    const items = [...store.items].sort((a, b) => b.id - a.id);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error reading disputes:', error);
    return NextResponse.json({ success: false, error: 'Failed to read disputes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      creator,
      title,
      description,
      type,
      opponentAddresses = [],
      priority = 0,
      escrowAmount = '0',
    } = body as {
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

    const store = await readDisputes();
    const id = store.nextId++;

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

    store.items.push(dispute);
    await writeDisputes(store);

    return NextResponse.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json({ success: false, error: 'Failed to create dispute' }, { status: 500 });
  }
}
