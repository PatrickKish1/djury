"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CreateDisputeForm, SubmitEvidenceForm, CastVoteForm } from './DisputeActions';
import { DisputeInfo, UserDisputes, DisputeEvidence } from './DisputeInfo';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function DisputeDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('create');

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center mb-4">
              Please connect your wallet to access the dispute resolution system.
            </p>
            <div className="text-center">
              <Badge variant="outline">Wallet not connected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with user info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Dispute Resolution Dashboard
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Connected</Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="create">Create Dispute</TabsTrigger>
          <TabsTrigger value="evidence">Submit Evidence</TabsTrigger>
          <TabsTrigger value="vote">Cast Vote</TabsTrigger>
          <TabsTrigger value="view">View Disputes</TabsTrigger>
          <TabsTrigger value="user">User Disputes</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <CreateDisputeForm />
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <SubmitEvidenceForm />
        </TabsContent>

        <TabsContent value="vote" className="space-y-4">
          <CastVoteForm />
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <DisputeInfo />
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <UserDisputes />
        </TabsContent>
      </Tabs>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('create')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-lg">🚨</span>
              <span>Create New Dispute</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('evidence')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-lg">📄</span>
              <span>Submit Evidence</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('vote')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-lg">🗳️</span>
              <span>Cast Your Vote</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contract stats */}
      <ContractStats />
    </div>
  );
}

function ContractStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">📊</div>
            <div className="text-sm text-muted-foreground">Total Disputes</div>
            <div className="text-lg font-semibold">-</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">⏳</div>
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-lg font-semibold">-</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">✅</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
            <div className="text-lg font-semibold">-</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">🎯</div>
            <div className="text-sm text-muted-foreground">Voting</div>
            <div className="text-lg font-semibold">-</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced dispute viewer with evidence
export function DisputeViewer({ disputeId }: { disputeId: string }) {
  if (!disputeId) return null;

  return (
    <div className="space-y-6">
      <DisputeInfo />
      <DisputeEvidence disputeId={disputeId} />
    </div>
  );
}
