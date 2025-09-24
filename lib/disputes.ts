export type DisputeType = 'general' | 'opponent';

export interface DisputeInput {
  id?: number;
  creator: `0x${string}`;
  title: string;
  description?: string;
  type: DisputeType;
  opponentAddresses?: `0x${string}`[];
  priority?: 0 | 1 | 2;
  escrowAmount?: string;
}

export interface Dispute {
  id: number;
  creator: `0x${string}`;
  title: string;
  description: string;
  type: DisputeType;
  opponentAddresses: `0x${string}`[];
  priority: 0 | 1 | 2;
  escrowAmount: string;
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
  upvotes: number;
  downvotes: number;
}

export async function createDispute(input: DisputeInput): Promise<Dispute> {
  const res = await fetch('/api/disputes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create dispute');
  return json.data as Dispute;
}

export async function fetchDisputes(): Promise<Dispute[]> {
  const res = await fetch('/api/disputes');
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch disputes');
  return json.data as Dispute[];
}

export async function fetchDisputeById(id: number): Promise<Dispute> {
  const res = await fetch(`/api/disputes/${id}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch dispute');
  return json.data as Dispute;
}

export async function fetchDisputesByCreator(address: `0x${string}`): Promise<Dispute[]> {
  const res = await fetch(`/api/disputes/creator/${address}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch creator disputes');
  return json.data as Dispute[];
}

export function buildInviteUrl(disputeId: number, inviter: `0x${string}`): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${origin}/disputes/${disputeId}/invite/${inviter}`;
}
