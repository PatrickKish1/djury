"use client";

import { useState } from 'react';
import { useContractRead, useAccount } from 'wagmi';
import { disputeContract } from '../lib/contracts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

// Helper function to get status text
const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Draft';
    case 1: return 'Active';
    case 2: return 'Voting';
    case 3: return 'Resolved';
    case 4: return 'Cancelled';
    case 5: return 'Expired';
    default: return 'Unknown';
  }
};

// Helper function to get category text
const getCategoryText = (category: number): string => {
  switch (category) {
    case 0: return 'General';
    case 1: return 'Financial';
    case 2: return 'Legal';
    case 3: return 'Technical';
    case 4: return 'Other';
    default: return 'Unknown';
  }
};

// Helper function to get priority text
const getPriorityText = (priority: number): string => {
  switch (priority) {
    case 0: return 'Low';
    case 1: return 'Medium';
    case 2: return 'High';
    default: return 'Unknown';
  }
};

export function DisputeInfo() {
  const { address } = useAccount();
  const [disputeId, setDisputeId] = useState('');
  const [searchId, setSearchId] = useState('');

  // Read dispute information
  const { data: dispute, isLoading, error, refetch } = useContractRead({
    ...disputeContract,
    functionName: 'disputes',
    args: searchId ? [BigInt(searchId)] : undefined,
    query: {
      enabled: !!searchId,
    },
  });

  // Read dispute counter
  const { data: disputeCounter } = useContractRead({
    ...disputeContract,
    functionName: 'disputeCounter',
  });

  const handleSearch = () => {
    if (disputeId) {
      setSearchId(disputeId);
    }
  };

  const handleReset = () => {
    setDisputeId('');
    setSearchId('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dispute Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="disputeId">Dispute ID</Label>
              <Input
                id="disputeId"
                type="number"
                placeholder="Enter dispute ID"
                value={disputeId}
                onChange={(e) => setDisputeId(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={handleSearch} disabled={!disputeId}>
                Search
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>

                     {disputeCounter !== undefined && disputeCounter !== null && (
             <div className="text-sm text-muted-foreground">
               Total disputes: {disputeCounter.toString()}
             </div>
           )}

          {error && (
            <div className="text-red-500 text-sm">
              Error: {error.message}
            </div>
          )}

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

                     {dispute && typeof dispute === 'object' && 'title' in dispute ? (
             <div className="space-y-4 p-4 border rounded-lg">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-semibold">{(dispute as any).title}</h3>
                 <div className="flex space-x-2">
                   <Badge variant={(dispute as any).status === 3 ? "default" : "secondary"}>
                     {getStatusText((dispute as any).status)}
                   </Badge>
                   <Badge variant="outline">
                     {getCategoryText((dispute as any).category)}
                   </Badge>
                   <Badge variant="outline">
                     {getPriorityText((dispute as any).priority)}
                   </Badge>
                 </div>
               </div>

               <div className="space-y-2">
                 <p className="text-muted-foreground">{(dispute as any).description}</p>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="font-medium">Creator:</span>
                     <p className="text-muted-foreground font-mono text-xs break-all">
                       {(dispute as any).disputeCreatorAddress}
                     </p>
                   </div>
                   <div>
                     <span className="font-medium">Respondent:</span>
                     <p className="text-muted-foreground font-mono text-xs break-all">
                       {(dispute as any).respondentAddress}
                     </p>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="font-medium">Creation Time:</span>
                     <p className="text-muted-foreground">
                       {new Date(Number((dispute as any).creationTime) * 1000).toLocaleString()}
                     </p>
                   </div>
                   <div>
                     <span className="font-medium">End Time:</span>
                     <p className="text-muted-foreground">
                       {new Date(Number((dispute as any).endTime) * 1000).toLocaleString()}
                     </p>
                   </div>
                 </div>

                 {(dispute as any).requiresEscrow && (
                   <div>
                     <span className="font-medium">Escrow Amount:</span>
                     <p className="text-muted-foreground">
                       {(dispute as any).escrowAmount.toString()} wei
                     </p>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="font-medium">Creator Votes:</span>
                     <p className="text-muted-foreground">
                       {(dispute as any).creatorVotes.toString()}
                     </p>
                   </div>
                   <div>
                     <span className="font-medium">Respondent Votes:</span>
                     <p className="text-muted-foreground">
                       {(dispute as any).respondentVotes.toString()}
                     </p>
                   </div>
                 </div>

                 {(dispute as any).winner !== '0x0000000000000000000000000000000000000000' && (
                   <div>
                     <span className="font-medium">Winner:</span>
                     <p className="text-muted-foreground font-mono text-xs break-all">
                       {(dispute as any).winner}
                     </p>
                   </div>
                 )}

                 {(dispute as any).resolutionSummary && (
                   <div>
                     <span className="font-medium">Resolution Summary:</span>
                     <p className="text-muted-foreground">
                       {(dispute as any).resolutionSummary}
                     </p>
                   </div>
                 )}
               </div>
             </div>
           ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function UserDisputes() {
  const { address } = useAccount();
  const [userAddress, setUserAddress] = useState('');

  // Read user disputes
  const { data: userDisputes, isLoading, refetch } = useContractRead({
    ...disputeContract,
    functionName: 'getUserDisputes',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const handleSearch = () => {
    if (userAddress) {
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Disputes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="userAddress">User Address</Label>
              <Input
                id="userAddress"
                placeholder="Enter user address"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={!userAddress}>
                Search
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

                     {userDisputes && Array.isArray(userDisputes) && userDisputes.length > 0 ? (
             <div className="space-y-2">
               <h4 className="font-medium">Dispute IDs:</h4>
               <div className="grid grid-cols-3 gap-2">
                 {userDisputes.map((disputeId: any, index: number) => (
                   <Badge key={index} variant="outline" className="text-center">
                     {disputeId.toString()}
                   </Badge>
                 ))}
               </div>
             </div>
           ) : userDisputes && Array.isArray(userDisputes) && userDisputes.length === 0 ? (
             <p className="text-muted-foreground">No disputes found for this user.</p>
           ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function DisputeEvidence({ disputeId }: { disputeId: string }) {
  // Read dispute evidence
  const { data: evidence, isLoading } = useContractRead({
    ...disputeContract,
    functionName: 'getDisputeEvidence',
    args: disputeId ? [BigInt(disputeId)] : undefined,
    query: {
      enabled: !!disputeId,
    },
  });

  if (!disputeId) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dispute Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

                     {evidence && Array.isArray(evidence) && evidence.length > 0 ? (
             <div className="space-y-4">
               {evidence.map((item: any, index: number) => (
                 <div key={index} className="p-4 border rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <Badge variant={item.supportsCreator ? "default" : "secondary"}>
                       {item.supportsCreator ? "Supports Creator" : "Supports Respondent"}
                     </Badge>
                     <span className="text-sm text-muted-foreground">
                       {new Date(Number(item.timestamp) * 1000).toLocaleString()}
                     </span>
                   </div>
                   <p className="mb-2">{item.description}</p>
                   <p className="text-sm text-muted-foreground font-mono">
                     Document: {item.documentHash}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     Submitted by: {item.submittedBy}
                   </p>
                   {item.verified && (
                     <Badge variant="outline" className="mt-2">
                       Verified
                     </Badge>
                   )}
                 </div>
               ))}
             </div>
           ) : evidence && Array.isArray(evidence) && evidence.length === 0 ? (
             <p className="text-muted-foreground">No evidence submitted for this dispute.</p>
           ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
