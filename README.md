# DJury - Decentralized Social Media Platform

A decentralized social media platform built with Next.js, Wagmi, and OnchainKit that enables users to create, participate in, and resolve disputes through blockchain technology.

## 🚀 Features

### Core Functionality
- **Dispute Creation**: Create general or opponent-based disputes with escrow support
- **Network Switching**: Switch between Base, Ethereum, and Polygon networks
- **Wallet Integration**: Connect with Coinbase Wallet and other Web3 wallets
- **Real-time Data**: JSON-backed storage system for disputes and comments
- **Invite System**: Share dispute links with specific wallet addresses
- **Comment System**: Participate in dispute discussions with voting

### Dispute Types
- **General Disputes**: Open discussions on any topic
- **Opponent Disputes**: Structured debates between specific parties with escrow

### Blockchain Integration
- Smart contract integration for dispute resolution
- Multi-network support (Base, Ethereum, Polygon)
- Escrow functionality for opponent disputes
- Voting and evidence submission

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, CSS Variables
- **Blockchain**: Wagmi, Viem, OnchainKit
- **Wallet**: Coinbase Wallet integration
- **Storage**: JSON file-based storage system
- **UI Components**: Custom components with shadcn/ui
- **Notifications**: Sonner toast notifications

## 📁 Project Structure

```
pulley/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── comments/             # Comment management
│   │   ├── disputes/             # Dispute management
│   │   ├── notify/               # Notification system
│   │   └── webhook/              # Webhook handlers
│   ├── disputes/                 # Dispute pages
│   │   └── [id]/                 # Individual dispute pages
│   ├── profile/                  # User profile
│   ├── search/                   # Search functionality
│   └── test-wagmi/               # Wagmi testing
├── components/                   # React components
│   ├── ui/                       # UI components (shadcn/ui)
│   ├── ContractActions.tsx       # Smart contract interactions
│   ├── DisputeCard.tsx           # Dispute display component
│   ├── DisputeDashboard.tsx      # Main dispute interface
│   ├── DisputesManagement.tsx    # Dispute creation/management
│   ├── NetworkSwitcher.tsx       # Network switching component
│   └── ...                       # Other components
├── contracts/                    # Smart contract files
│   ├── contractabi.ts            # Contract ABI
│   ├── contractaddress.ts        # Contract addresses
│   └── bettingcontractabi.ts     # Betting contract ABI
├── data/                         # JSON data storage
│   └── comments/                 # Comment data files
├── integration/                  # Integration modules
│   ├── bettingIntegration.tsx    # Betting functionality
│   └── integration.tsx           # Main integration
├── lib/                          # Utility libraries
│   ├── contracts.ts              # Contract configuration
│   ├── disputes.ts               # Dispute API functions
│   ├── comments.ts               # Comment management
│   └── hooks/                    # Custom React hooks
└── public/                       # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- A Web3 wallet (Coinbase Wallet recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pulley
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   # Add other environment variables as needed
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Network Configuration
The app supports multiple networks:
- **Base** (default)
- **Ethereum Mainnet**
- **Polygon**

Network switching is handled automatically through the `NetworkSwitcher` component.

### Contract Configuration
Update contract addresses in `contracts/contractaddress.ts`:
```typescript
export const contractAddress = "0x944f3c7305598e724aBFBAAEc4ee93a3b2Db7DDa";
export const bettingContractAddress = "0x944f3c7305598e724aBFBAAEc4ee93a3b2Db7DDa";
```

## 📊 Data Storage

### JSON-Based Storage
The platform uses a JSON file-based storage system for:
- **Disputes**: Stored in `data/disputes/disputes.json`
- **Comments**: Stored in `data/comments/[disputeId].json`

### API Endpoints
- `GET /api/disputes` - List all disputes
- `POST /api/disputes` - Create a new dispute
- `GET /api/disputes/[id]` - Get specific dispute
- `GET /api/disputes/creator/[address]` - Get disputes by creator
- `GET /api/comments/[disputeId]` - Get comments for dispute
- `POST /api/comments/[disputeId]` - Add comment to dispute

## 🎯 Usage

### Creating a Dispute
1. Connect your wallet
2. Navigate to "Create Dispute"
3. Choose dispute type (General or Opponent)
4. Fill in dispute details
5. Submit and share the invite link

### Participating in Disputes
1. Click on any dispute card
2. View dispute details and evidence
3. Add comments and vote
4. For opponent disputes, submit evidence

### Network Switching
Use the network switcher in the header to switch between supported networks.

## 🔗 Smart Contract Integration

The platform integrates with smart contracts for:
- Dispute creation and management
- Escrow functionality
- Voting and resolution
- Evidence submission

### Contract Functions
- `createDispute()` - Create new disputes
- `castVote()` - Vote on disputes
- `submitEvidence()` - Submit evidence
- `getDisputeBasicInfo()` - Retrieve dispute data

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Theme**: CSS variable-based theming
- **Toast Notifications**: Real-time feedback
- **Loading States**: Smooth user experience
- **Error Handling**: Graceful error management

## 🧪 Testing

### Wagmi Testing
Test Web3 functionality in the test page:
```
/test-wagmi
```

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Roadmap

- [ ] Enhanced betting integration
- [ ] NFT rewards system
- [ ] Advanced dispute resolution
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced analytics

---

**Built with ❤️ for the decentralized future**