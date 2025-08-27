# Wagmi Integration for Dispute Resolution Contract

This project provides a complete wagmi integration for your dispute resolution smart contract, enabling users to interact with the blockchain through a modern React interface.

## 🚀 Features

- **Create Disputes**: Full form for creating new disputes with all parameters
- **Submit Evidence**: Upload evidence with descriptions and document hashes
- **Cast Votes**: Participate in dispute voting with reasoning
- **View Disputes**: Search and display dispute information
- **User Management**: View user-specific disputes and interactions
- **Real-time Updates**: Automatic transaction status updates
- **Type Safety**: Full TypeScript support with contract types

## 📁 File Structure

```
├── lib/
│   ├── contracts.ts          # Contract configuration and types
│   └── hooks/
│       └── useDispute.ts     # Custom hooks for dispute operations
├── components/
│   ├── DisputeActions.tsx    # Forms for creating, evidence, voting
│   ├── DisputeInfo.tsx       # Display dispute information
│   ├── DisputeDashboard.tsx  # Main dashboard interface
│   └── ui/                   # UI components (Button, Input, etc.)
├── contracts/
│   ├── contractabi.ts        # Smart contract ABI
│   └── contractaddress.ts    # Contract address
└── app/
    └── providers.tsx         # Wagmi and wallet providers
```

## 🛠️ Setup

### 1. Dependencies

The following packages are already installed:
- `wagmi` - React hooks for Ethereum
- `viem` - TypeScript interface for Ethereum
- `@tanstack/react-query` - Data fetching and caching

### 2. Configuration

The integration is configured to work with the Base network. Update the contract address in `contracts/contractaddress.ts` if needed.

### 3. Environment Variables

Ensure you have the required environment variables for your wallet provider:
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=your_project_name
NEXT_PUBLIC_ICON_URL=your_icon_url
```

## 🎯 Usage

### Basic Integration

```tsx
import { DisputeDashboard } from './components/DisputeDashboard';

function App() {
  return (
    <div>
      <DisputeDashboard />
    </div>
  );
}
```

### Individual Components

```tsx
import { CreateDisputeForm } from './components/DisputeActions';
import { DisputeInfo } from './components/DisputeInfo';

// Create disputes
<CreateDisputeForm />

// View dispute information
<DisputeInfo />
```

### Custom Hooks

```tsx
import { useCreateDispute, useDispute } from './lib/hooks/useDispute';

function MyComponent() {
  const { formData, setFormData, createDispute, isLoading } = useCreateDispute();
  const { dispute, evidence } = useDispute('123');
  
  // Use the hooks...
}
```

## 🔧 Contract Functions

### Read Functions (View)

- `disputes(disputeId)` - Get dispute details
- `getDisputeEvidence(disputeId)` - Get evidence for a dispute
- `getDisputeVotes(disputeId)` - Get votes for a dispute
- `getUserDisputes(userAddress)` - Get disputes for a user
- `disputeCounter()` - Get total dispute count
- `categoryCount(category)` - Get count by category

### Write Functions (Transactions)

- `createDispute(params)` - Create a new dispute
- `submitEvidence(disputeId, description, hash, supportsCreator)` - Submit evidence
- `castVote(disputeId, supportsCreator, reason)` - Cast a vote
- `startVoting(disputeId)` - Start voting period
- `resolveDispute(disputeId)` - Resolve a dispute

## 🎨 UI Components

### Forms
- **CreateDisputeForm**: Complete dispute creation with validation
- **SubmitEvidenceForm**: Evidence submission with file hash support
- **CastVoteForm**: Voting interface with reasoning

### Displays
- **DisputeInfo**: Comprehensive dispute information display
- **UserDisputes**: User-specific dispute listings
- **DisputeEvidence**: Evidence display with metadata

### Dashboard
- **DisputeDashboard**: Tabbed interface for all functionality
- **ContractStats**: Statistics and metrics display

## 🔒 Security Features

- **Input Validation**: All forms include proper validation
- **Transaction Confirmation**: Users must confirm all transactions
- **Error Handling**: Comprehensive error handling and user feedback
- **Wallet Connection**: Secure wallet integration with connection status

## 📱 Responsive Design

The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices
- All screen sizes

## 🚦 Transaction States

All transactions show real-time status:
- **Preparing**: Transaction is being prepared
- **Pending**: Transaction is on the blockchain
- **Success**: Transaction completed successfully
- **Error**: Transaction failed with error details

## 🔄 Auto-refresh

The interface automatically:
- Refreshes data after successful transactions
- Updates dispute status in real-time
- Shows latest evidence and votes
- Maintains user context across interactions

## 🎯 Best Practices

1. **Always check wallet connection** before allowing actions
2. **Validate user inputs** before submitting transactions
3. **Provide clear feedback** for all user actions
4. **Handle errors gracefully** with user-friendly messages
5. **Use loading states** to indicate ongoing operations

## 🐛 Troubleshooting

### Common Issues

1. **Wallet not connecting**
   - Check if wallet extension is installed
   - Ensure you're on the correct network (Base)

2. **Transaction failing**
   - Verify you have sufficient gas fees
   - Check if the dispute exists and is in the correct state
   - Ensure you have permission to perform the action

3. **Data not loading**
   - Check your internet connection
   - Verify the contract address is correct
   - Ensure the contract is deployed and accessible

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and transaction information.

## 🚀 Future Enhancements

- **Real-time notifications** for dispute updates
- **Advanced filtering** and search capabilities
- **Bulk operations** for multiple disputes
- **Analytics dashboard** with dispute statistics
- **Mobile app** version
- **Multi-language support**

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

To contribute to this integration:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This integration is provided as-is for educational and development purposes. Please ensure compliance with your project's licensing requirements.
