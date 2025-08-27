import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';

// Create a public client for reading from Base network
const client = createPublicClient({
  chain: base,
  transport: http(),
});

// Contract address and ABI for the dispute function
const contractAddress = '0x944f3c7305598e724aBFBAAEc4ee93a3b2Db7DDa';
const disputeAbi = parseAbiItem('function disputes(uint256) view returns (tuple(address,address,string,string,uint8,uint8,uint256,uint40,uint40,uint40,uint40,uint40,uint8,uint256,uint256,address,uint256,string,bool,uint40))');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const disputeId = params.id;
    
    if (!disputeId || isNaN(Number(disputeId))) {
      return NextResponse.json({ error: 'Invalid dispute ID' }, { status: 400 });
    }

    // Read dispute data from the smart contract
    const disputeData = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: [disputeAbi],
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
