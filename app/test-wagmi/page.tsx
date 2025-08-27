import { DisputeDashboard } from '../../components/DisputeDashboard';

export default function TestWagmiPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Wagmi Integration Test</h1>
      <DisputeDashboard />
    </div>
  );
}
