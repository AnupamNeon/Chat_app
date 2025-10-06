# Chatty - Real-time Chat Application 💬

A modern, real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring instant messaging, online status, image sharing, and dark mode.

![Chatty Demo](https://img.shields.io/badge/Chatty-Real--time%20Chat-blue?style=for-the-badge)

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Authentication**: JWT-based login/signup with cookie storage
- **User Profiles**: Customizable profile pictures and user information
- **Online Status**: Real-time online/offline status indicators

### 💬 Messaging
- **Real-time Messages**: Instant message delivery using Socket.IO
- **Image Sharing**: Upload and send images with automatic compression
- **Message Status**: Sent, delivered, and read status indicators
- **Typing Indicators**: See when other users are typing
- **Message Search**: Search through conversation history
- **Unread Counts**: Track unread messages per conversation

### 🎨 User Interface
- **Dark/Light Mode**: Toggle between themes with persistent settings
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Loading States**: Skeleton loaders for better user experience

### 🔒 Security & Performance
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive client and server-side validation
- **Image Optimization**: Automatic compression and size validation
- **Error Handling**: Graceful error boundaries and user-friendly messages

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage and CDN
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnupamNeon/Chat_app.git
   cd ChatApp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

1. **Backend Environment Variables** (`backend/.env`)
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatty
   JWT_SECRET=your-super-secret-jwt-key-here
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

2. **Frontend Environment Variables** (`frontend/.env`)
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
chatty/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Cloudinary configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── socket/          # Socket.IO configuration
│   │   └── utils/           # Utility functions
│   └── app.js              # Express app entry point
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── store/           # Zustand state management
    │   ├── lib/             # Utility libraries
    │   └── App.jsx          # Main App component
    └── index.css           # Global styles
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-profile` - Update user profile
- `GET /api/auth/check` - Check authentication status

### Messages
- `GET /api/messages/:id` - Get messages with a user
- `POST /api/messages/send/:id` - Send a message
- `PATCH /api/messages/:messageId/read` - Mark message as read
- `GET /api/messages/search` - Search messages

### Users
- `GET /api/users/sidebar` - Get users for sidebar
- `GET /api/users/:userId` - Get user profile
- `PATCH /api/users/status` - Update user status

## 🔧 Available Scripts

### Backend Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🗄 Database Models

### User Model
```javascript
{
  email: String (unique),
  fullName: String,
  password: String (hashed),
  profilePic: String,
  isOnline: Boolean,
  lastSeen: Date
}
```

### Conversation Model
```javascript
{
  participants: [User IDs],
  messages: [{
    senderId: User ID,
    receiverId: User ID,
    text: String,
    image: String,
    status: String,
    readAt: Date
  }],
  unreadCount: Map,
  lastMessage: Object
}
```

## 🌐 Socket.IO Events

### Client to Server
- `typing-start` - User started typing
- `typing-stop` - User stopped typing

### Server to Client
- `newMessage` - New message received
- `messageRead` - Message was read
- `userStatusChanged` - User online status changed
- `getOnlineUsers` - List of online users
- `user-typing` - Typing indicator

## 🛡 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** using bcrypt
- **Rate Limiting** on authentication and messaging endpoints
- **Input Validation** and sanitization
- **CORS Protection** with whitelisted origins
- **XSS Prevention** through proper escaping

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is set
3. Deploy from the backend directory

### Frontend Deployment (Vercel/Netlify)
1. Set `VITE_API_BASE_URL` to your deployed backend URL
2. Build and deploy the frontend

### Production Environment Variables
```env
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
MONGODB_URI=your-production-mongodb-uri
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - Clear browser cookies and localStorage
   - Check JWT secret in environment variables
   - Verify cookie settings match your environment

2. **Socket Connection Issues**
   - Ensure backend is running on the correct port
   - Check CORS configuration
   - Verify Socket.IO client and server versions match

3. **Image Upload Failures**
   - Verify Cloudinary configuration
   - Check image size limits (max 5MB)
   - Ensure correct file types (JPEG, PNG, GIF, WebP)


## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev)
- UI inspiration from modern chat applications
- Built with the MERN stack

---

**Happy Chatting!** 🎉