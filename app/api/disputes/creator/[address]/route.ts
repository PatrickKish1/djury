/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data', 'disputes');
const filePath = path.join(dataDir, 'disputes.json');

async function readDisputes() {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as { items: any[] };
  } catch {
    return { items: [] as any[] };
  }
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const store = await readDisputes();
    const items = (store.items || [])
      .filter((d) => d.creator?.toLowerCase() === address.toLowerCase())
      .sort((a, b) => b.id - a.id);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error reading disputes by creator:', error);
    return NextResponse.json({ success: false, error: 'Failed to read disputes' }, { status: 500 });
  }
}
