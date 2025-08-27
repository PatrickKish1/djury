"use client";

import { useState, useEffect } from 'react';
import { useContractRead, useAccount } from 'wagmi';
import { disputeContract } from '../lib/contracts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

// Helper functions
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

const getPriorityText = (priority: number): string => {
  switch (priority) {
    case 0: return 'Low';
    case 1: return 'Medium';
    case 2: return 'High';
    default: return 'Unknown';
  }
};

export function DisputeList() {
  const { address } = useAccount();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Read total dispute count
  const { data: disputeCounter } = useContractRead({
    ...disputeContract,
    functionName: 'disputeCounter',
  });

  // Read all disputes
  useEffect(() => {
    const loadDisputes = async () => {
      if (!disputeCounter) return;
      
      setLoading(true);
      const totalDisputes = Number(disputeCounter);
      const disputePromises = [];

      // Read disputes in batches to avoid overwhelming the RPC
      for (let i = 0; i < Math.min(totalDisputes, 20); i++) {
        disputePromises.push(
          fetch(`/api/disputes/${i}`).catch(() => null)
        );
      }

      try {
        const results = await Promise.all(disputePromises);
        const validDisputes = results
          .filter(result => result !== null)
          .map((result, index) => ({ id: index, ...result }))
          .filter(dispute => dispute && typeof dispute === 'object' && 'title' in dispute);

        setDisputes(validDisputes);
      } catch (error) {
        console.error('Error loading disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, [disputeCounter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Disputes</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Disputes</h2>
        {disputeCounter && (
          <Badge variant="outline">
            Total: {disputeCounter.toString()}
          </Badge>
        )}
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No disputes found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create the first dispute to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {dispute.title || 'Untitled Dispute'}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={dispute.status === 3 ? "default" : "secondary"}>
                        {getStatusText(dispute.status || 0)}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryText(dispute.category || 0)}
                      </Badge>
                      <Badge variant="outline">
                        {getPriorityText(dispute.priority || 0)}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    #{dispute.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {dispute.description || 'No description available'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Creator:</span>
                    <p className="text-muted-foreground font-mono text-xs break-all">
                      {dispute.disputeCreatorAddress || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Respondent:</span>
                    <p className="text-muted-foreground font-mono text-xs break-all">
                      {dispute.respondentAddress || 'Unknown'}
                    </p>
                  </div>
                </div>

                {dispute.requiresEscrow && dispute.escrowAmount && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <span className="font-medium text-sm">Escrow Amount:</span>
                    <p className="text-sm text-muted-foreground">
                      {(Number(dispute.escrowAmount) / 1e18).toFixed(6)} ETH
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Created: {dispute.creationTime ? 
                      new Date(Number(dispute.creationTime) * 1000).toLocaleDateString() : 
                      'Unknown'
                    }
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
