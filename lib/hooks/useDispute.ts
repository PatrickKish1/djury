import { useState, useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { disputeContract } from '../contracts';
import { toast } from 'sonner';

export function useDispute(disputeId?: string) {
  const [isLoading, setIsLoading] = useState(false);

  // Read dispute information
  const { data: dispute, isLoading: isReading, error: readError, refetch } = useReadContract({
    ...disputeContract,
    functionName: 'disputes',
    args: disputeId ? [BigInt(disputeId)] : undefined,
    query: {
      enabled: !!disputeId,
    },
  });

  // Read dispute evidence
  const { data: evidence, isLoading: isEvidenceLoading } = useReadContract({
    ...disputeContract,
    functionName: 'getDisputeEvidence',
    args: disputeId ? [BigInt(disputeId)] : undefined,
    query: {
      enabled: !!disputeId,
    },
  });

  // Read dispute votes
  const { data: votes, isLoading: isVotesLoading } = useReadContract({
    ...disputeContract,
    functionName: 'getDisputeVotes',
    args: disputeId ? [BigInt(disputeId)] : undefined,
    query: {
      enabled: !!disputeId,
    },
  });

  // Check if user has voted
  const { data: hasVoted } = useReadContract({
    ...disputeContract,
    functionName: 'hasVoted',
    args: disputeId && disputeId ? [BigInt(disputeId), disputeId as `0x${string}`] : undefined,
    query: {
      enabled: !!disputeId && !!disputeId,
    },
  });

  // Check if user has submitted evidence
  const { data: hasSubmittedEvidence } = useReadContract({
    ...disputeContract,
    functionName: 'hasSubmittedEvidence',
    args: disputeId && disputeId ? [BigInt(disputeId), disputeId as `0x${string}`] : undefined,
    query: {
      enabled: !!disputeId && !!disputeId,
    },
  });

  return {
    dispute,
    evidence,
    votes,
    hasVoted,
    hasSubmittedEvidence,
    isLoading: isReading || isEvidenceLoading || isVotesLoading,
    error: readError,
    refetch,
  };
}

export function useCreateDispute() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    respondent: '',
    category: 0,
    priority: 0,
    requiresEscrow: false,
    escrowAmount: '',
    customPeriod: '',
  });

  // Execute the transaction
  const { writeContract, isPending, data: hash } = useWriteContract();

  // Wait for transaction
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash,
  });

  const createDispute = useCallback(() => {
    const args = [{
      respondent: formData.respondent as `0x${string}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      requiresEscrow: formData.requiresEscrow,
      escrowAmount: formData.requiresEscrow ? BigInt(formData.escrowAmount || '0') : BigInt(0),
      customPeriod: BigInt(formData.customPeriod || '0'),
      evidenceDescriptions: [],
      evidenceHashes: [],
      evidenceSupportsCreator: []
    }];
    
    const value = formData.requiresEscrow ? BigInt(formData.escrowAmount || '0') : BigInt(0);
    
    writeContract({
      ...disputeContract,
      functionName: 'createDispute',
      args,
      value,
    });
    toast.success('Creating dispute...');
  }, [writeContract, formData]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      respondent: '',
      category: 0,
      priority: 0,
      requiresEscrow: false,
      escrowAmount: '',
      customPeriod: '',
    });
  }, []);

  return {
    formData,
    setFormData,
    createDispute,
    resetForm,
    isLoading,
    isSuccess,
    error,
    canCreate: !isPending,
  };
}

export function useSubmitEvidence() {
  const [formData, setFormData] = useState({
    disputeId: '',
    description: '',
    documentHash: '',
    supportsCreator: true,
  });

  // Execute the transaction
  const { writeContract, isPending, data: hash } = useWriteContract();

  // Wait for transaction
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash,
  });

  const submitEvidence = useCallback(() => {
    writeContract({
      ...disputeContract,
      functionName: 'submitEvidence',
      args: [
        BigInt(formData.disputeId || '0'),
        formData.description,
        formData.documentHash,
        formData.supportsCreator
      ],
    });
    toast.success('Submitting evidence...');
  }, [writeContract, formData]);

  const resetForm = useCallback(() => {
    setFormData({
      disputeId: '',
      description: '',
      documentHash: '',
      supportsCreator: true,
    });
  }, []);

  return {
    formData,
    setFormData,
    submitEvidence,
    resetForm,
    isLoading,
    isSuccess,
    error,
    canSubmit: !isPending,
  };
}

export function useCastVote() {
  const [formData, setFormData] = useState({
    disputeId: '',
    supportsCreator: true,
    reason: '',
  });

  // Execute the transaction
  const { writeContract, isPending, data: hash } = useWriteContract();

  // Wait for transaction
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash,
  });

  const castVote = useCallback(() => {
    writeContract({
      ...disputeContract,
      functionName: 'castVote',
      args: [
        BigInt(formData.disputeId || '0'),
        formData.supportsCreator,
        formData.reason
      ],
    });
    toast.success('Casting vote...');
  }, [writeContract, formData]);

  const resetForm = useCallback(() => {
    setFormData({
      disputeId: '',
      supportsCreator: true,
      reason: '',
    });
  }, []);

  return {
    formData,
    setFormData,
    castVote,
    resetForm,
    isLoading,
    isSuccess,
    error,
    canVote: !isPending,
  };
}

export function useDisputeStats() {
  // Read dispute counter
  const { data: disputeCounter } = useReadContract({
    ...disputeContract,
    functionName: 'disputeCounter',
  });

  // Read category counts
  const { data: generalCount } = useReadContract({
    ...disputeContract,
    functionName: 'categoryCount',
    args: [0],
  });

  const { data: financialCount } = useReadContract({
    ...disputeContract,
    functionName: 'categoryCount',
    args: [1],
  });

  const { data: legalCount } = useReadContract({
    ...disputeContract,
    functionName: 'categoryCount',
    args: [2],
  });

  const { data: technicalCount } = useReadContract({
    ...disputeContract,
    functionName: 'categoryCount',
    args: [3],
  });

  const { data: otherCount } = useReadContract({
    ...disputeContract,
    functionName: 'categoryCount',
    args: [4],
  });

  return {
    totalDisputes: disputeCounter,
    categoryCounts: {
      general: generalCount,
      financial: financialCount,
      legal: legalCount,
      technical: technicalCount,
      other: otherCount,
    },
  };
}
