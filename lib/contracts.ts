import { contractAbi } from '../contracts/contractabi';
import { contractAddress } from '../contracts/contractaddress';

// Contract configuration
export const disputeContract = {
  address: contractAddress as `0x${string}`,
  abi: contractAbi,
} as const;

// Contract address export
export { contractAddress };

// Type definitions for better TypeScript support
export type DisputeCategory = 0 | 1 | 2 | 3 | 4; // Based on your ABI
export type Priority = 0 | 1 | 2; // Low, Medium, High
export type DisputeStatus = 0 | 1 | 2 | 3 | 4 | 5; // Based on your ABI

// Helper types for contract calls
export interface CreateDisputeParams {
  respondent: `0x${string}`;
  title: string;
  description: string;
  category: DisputeCategory;
  priority: Priority;
  requiresEscrow: boolean;
  escrowAmount: bigint;
  customPeriod: bigint;
  evidenceDescriptions: string[];
  evidenceHashes: string[];
  evidenceSupportsCreator: boolean[];
}

export interface EvidenceParams {
  disputeId: bigint;
  description: string;
  documentHash: string;
  supportsCreator: boolean;
}

export interface VoteParams {
  disputeId: bigint;
  supportsCreator: boolean;
  reason: string;
}
