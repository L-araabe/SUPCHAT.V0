# supchat-backend
This is the Node.js backend for SUPChat.

### New endpoint

- `GET /api/v1/chat/private/:userId` – returns an existing private chat between
  the current user and `userId` or creates one if none exists.
