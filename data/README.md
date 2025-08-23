# Live Comments System

This directory contains the live comments system for the DJury dispute platform.

## How It Works

### 1. **JSON File Storage**
- Each dispute has its own JSON file: `{disputeId}.json`
- Files are stored in `data/comments/` directory
- Structure: `{ disputers: Comment[], users: Comment[] }`

### 2. **Real-time Updates**
- Comments are stored on the server in JSON files
- Users can add comments that persist across devices
- Upvotes/downvotes are updated in real-time
- All users see the same comment data

### 3. **API Endpoints**
- `GET /api/comments/[disputeId]` - Fetch comments
- `POST /api/comments/[disputeId]` - Add new comment
- `PUT /api/comments/[disputeId]` - Update comment votes

### 4. **Fallback System**
- If server is unavailable, falls back to localStorage
- Ensures app works even offline
- Syncs with server when connection is restored

## File Structure

```
data/
├── comments/
│   ├── 1.json          # Comments for dispute ID 1
│   ├── 2.json          # Comments for dispute ID 2
│   ├── 101.json        # Comments for user-created dispute 101
│   └── ...
└── README.md
```

## Comment Format

```json
{
  "id": "unique-timestamp-id",
  "author": "0xWallet...Address",
  "content": "Comment text here",
  "timestamp": "2024-01-01T10:30:00.000Z",
  "upvotes": 5,
  "downvotes": 2,
  "type": "disputers" | "users"
}
```

## Benefits

✅ **Cross-device sync** - Comments visible on all devices  
✅ **Real-time updates** - Instant comment posting and voting  
✅ **Persistent storage** - Comments survive app restarts  
✅ **Offline support** - Works without internet connection  
✅ **Scalable** - Easy to migrate to database later  

## Future Enhancements

- **WebSocket support** for real-time notifications
- **Database migration** for better performance
- **User authentication** with wallet signatures
- **Comment moderation** and spam protection
