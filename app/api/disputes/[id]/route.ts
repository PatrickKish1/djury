/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { contractAbi } from '@/contracts/contractabi';

// Create a public client for reading from Base network
const client = createPublicClient({
  chain: base,
  transport: http(),
});

// Contract address
const contractAddress = '0x944f3c7305598e724aBFBAAEc4ee93a3b2Db7DDa';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const disputeId = id;
    
    if (!disputeId || isNaN(Number(disputeId))) {
      return NextResponse.json({ error: 'Invalid dispute ID' }, { status: 400 });
    }

    // Read dispute data from the smart contract
    const disputeData = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: 'disputes',
      args: [BigInt(disputeId)],
    });

    if (!disputeData) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Parse the dispute data into a readable format
    const [
      disputeCreatorAddress,
      respondentAddress,
      title,
      description,
      category,
      priority,
      escrowAmount,
      creationTime,
      activationTime,
      endTime,
      votingEndTime,
      resolutionDeadline,
      status,
      creatorVotes,
      respondentVotes,
      winner,
      winnerNftTokenId,
      resolutionSummary,
      requiresEscrow,
      votingStartTime
    ] = disputeData as any[];

    const dispute = {
      disputeCreatorAddress,
      respondentAddress,
      title,
      description,
      category: Number(category),
      priority: Number(priority),
      escrowAmount: escrowAmount.toString(),
      creationTime: creationTime.toString(),
      activationTime: activationTime.toString(),
      endTime: endTime.toString(),
      votingEndTime: votingEndTime.toString(),
      resolutionDeadline: resolutionDeadline.toString(),
      status: Number(status),
      creatorVotes: creatorVotes.toString(),
      respondentVotes: respondentVotes.toString(),
      winner,
      winnerNftTokenId: winnerNftTokenId.toString(),
      resolutionSummary,
      requiresEscrow,
      votingStartTime: votingStartTime.toString(),
    };

    return NextResponse.json(dispute);
  } catch (error) {
    console.error('Error reading dispute:', error);
    return NextResponse.json(
      { error: 'Failed to read dispute from contract' },
      { status: 500 }
    );
  }
}
