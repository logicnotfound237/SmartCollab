const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Filter = require('bad-words');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: './config.env' });

// Audio processing imports
const AudioWebSocketHandler = require('./services/audio/audioWebSocketHandler.js');
const audioWebSocketHandler = new AudioWebSocketHandler();

// Live audio transcription service
const LiveAudioService = require('./services/liveAudioService.js');
const liveAudioService = new LiveAudioService({
  bufferDuration: 8000, // 8 seconds
  maxConcurrent: 2,
  modelPath: 'whisper/models/ggml-base.en.bin'
});

const app = express();
const translationRoutes = require('./routes/translation');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Initialize audio WebSocket handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle audio-related events
  audioWebSocketHandler.handleConnection(socket, io);
  
  // Existing WebRTC and chat handlers...
  socket.on('join-room', async (roomId, userId) => {
    try {
      socket.join(roomId);
      socket.userId = userId;
      
      // Update user online status
      const user = findUserById(userId);
      if (user) {
        user.isOnline = true;
      }
      
      // Debug log
      const onlineMembers = roomMembers
        .filter(m => m.roomId === roomId)
        .map(member => findUserById(member.userId))
        .filter(user => user.isOnline);
      
      console.log('📊 Room ${roomId} online members after ${userId} joined:', onlineMembers.length);
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId,
        socketId: socket.id,
        timestamp: new Date()
      });
      
      console.log('User ${userId} joined room ${roomId}');
    } catch (error) {
      console.error('Join room error:', error);
    }
  });

  // ... rest of existing handlers
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// ==================== MIDDLEWARE ====================

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== REST OF MIDDLEWARE ====================
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use('/api/translation', translationRoutes);

// Initialize profanity filter
const filter = new Filter();

// ==================== SIMPLE MODEL DEFINITIONS ====================
// Simple in-memory storage for development
let users = [];
let tasks = [];
let rooms = [];
let roomMembers = [];
let chatMessages = [];

// Initialize with demo data
const initializeDemoData = () => {
  users = [
    {
      id: 1,
      email: 'demo@smartcollab.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Demo User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      role: 'Team Lead',
      preferences: { defaultLanguage: 'en', theme: 'light' },
      isOnline: false
    },
    {
      id: 2,
      email: 'alice@test.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Alice Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      role: 'Team Member',
      preferences: { defaultLanguage: 'en', theme: 'light' },
      isOnline: false
    },
    {
      id: 3,
      email: 'bob@test.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Bob Smith',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: 'Project Manager',
      preferences: { defaultLanguage: 'en', theme: 'light' },
      isOnline: false
    }
  ];

  tasks = [
    {
      id: 1,
      title: 'Design user authentication flow',
      status: 'completed',
      priority: 'high',
      assignee: 'Demo User',
      dueDate: '2024-10-05',
      project: 'SmartCollab Mobile App'
    },
    {
      id: 2,
      title: 'Implement chat translation API',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Demo User',
      dueDate: '2024-10-10',
      project: 'AI Translation Engine'
    }
  ];

  // Create a default room
  const defaultRoomId = uuidv4();
  rooms = [
    {
      id: defaultRoomId,
      name: 'General Chat Room',
      createdBy: 1,
      settings: {
        profanityFilter: true,
        allowTranslations: true,
        maxMembers: 50,
        isPublic: true
      },
      createdAt: new Date()
    }
  ];

  // FIX: Only add the demo user initially, not all users
  roomMembers = [
    {
      id: uuidv4(),
      userId: 1, // Only Demo User
      roomId: defaultRoomId,
      role: 'owner',
      preferences: users[0].preferences,
      joinedAt: new Date()
    }
  ];

  console.log('✅ Demo data initialized');
  console.log(`💬 Default room ID: ${defaultRoomId}`);
  console.log(`👥 Initial room members: ${roomMembers.length}`);
};

// Initialize demo data on server start
initializeDemoData();

// ==================== HELPER FUNCTIONS ====================
const findUserById = (id) => users.find(user => user.id === parseInt(id));
const findUserByEmail = (email) => users.find(user => user.email === email);
const findRoomById = (roomId) => rooms.find(room => room.id === roomId);
const findRoomMember = (userId, roomId) => roomMembers.find(member => member.userId === parseInt(userId) && member.roomId === roomId);
const findUserRooms = (userId) => roomMembers.filter(member => member.userId === parseInt(userId)).map(member => {
  const room = findRoomById(member.roomId);
  return { ...room, role: member.role, joinedAt: member.joinedAt };
});

// ==================== AUTHENTICATION ROUTES ====================

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      role: 'Team Member',
      preferences: { defaultLanguage: 'en', theme: 'light' },
      isOnline: false,
      joinDate: new Date()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        name: newUser.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ New user registered: ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        preferences: newUser.preferences
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update online status
    user.isOnline = true;

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ User logged in: ${user.name} (${email})`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        preferences: user.preferences,
        isOnline: true
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Verify Token Route (optional - for checking token validity)
app.post('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        preferences: user.preferences,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Logout Route
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const user = findUserById(req.user.userId);
    if (user) {
      user.isOnline = false;
      console.log(`✅ User logged out: ${user.name}`);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ==================== ROOM MANAGEMENT ROUTES ====================

// Create a new chat room
app.post('/api/rooms/create', authenticateToken, async (req, res) => {
  try {
    const { name, settings } = req.body;
    const user = findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const roomId = uuidv4();
    const newRoom = {
      id: roomId,
      name: name || `Room-${Date.now()}`,
      createdBy: user.id,
      settings: settings || {
        profanityFilter: true,
        allowTranslations: true,
        maxMembers: 50,
        isPublic: true
      },
      createdAt: new Date()
    };

    rooms.push(newRoom);

    // Add creator as room owner
    roomMembers.push({
      id: uuidv4(),
      userId: user.id,
      roomId: roomId,
      role: 'owner',
      preferences: user.preferences || {},
      joinedAt: new Date()
    });

    console.log(`✅ Room created: ${newRoom.name} (${roomId}) by user ${user.name}`);

    res.status(201).json({
      success: true,
      room: {
        id: newRoom.id,
        name: newRoom.name,
        settings: newRoom.settings,
        inviteCode: newRoom.id
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join a chat room
app.post('/api/rooms/join', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const user = findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const room = findRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is already a member
    const existingMember = findRoomMember(user.id, roomId);

    if (existingMember) {
      return res.json({
        success: true,
        room: {
          id: room.id,
          name: room.name,
          settings: room.settings,
          createdBy: room.createdBy
        }
      });
    }

    // Add user as room member
    roomMembers.push({
      id: uuidv4(),
      userId: user.id,
      roomId: room.id,
      role: 'member',
      preferences: user.preferences || {},
      joinedAt: new Date()
    });

    console.log(`✅ User ${user.name} joined room: ${room.name} (${room.id})`);

    res.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        settings: room.settings,
        createdBy: room.createdBy
      }
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room details
app.get('/api/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const room = findRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is room member
    const member = findRoomMember(req.user.userId, roomId);
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // Get member count - FIXED: Only count online members
    const onlineMembers = roomMembers
      .filter(m => m.roomId === roomId)
      .map(member => findUserById(member.userId))
      .filter(user => user.isOnline);

    const memberCount = onlineMembers.length;

    res.json({
      id: room.id,
      name: room.name,
      settings: room.settings,
      createdBy: room.createdBy,
      memberCount: memberCount,
      userRole: member.role
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
});

// Get room messages
app.get('/api/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Verify user is room member
    const member = findRoomMember(req.user.userId, roomId);
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    const messages = chatMessages.filter(msg => msg.roomId === roomId)
                                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get user's rooms
app.get('/api/rooms/my-rooms', authenticateToken, async (req, res) => {
  try {
    const userRooms = findUserRooms(req.user.userId);
    res.json(userRooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get room members - FIXED: Only show online members
app.get('/api/rooms/:roomId/members', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const members = roomMembers
      .filter(member => member.roomId === roomId)
      .map(member => {
        const user = findUserById(member.userId);
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          isOnline: user.isOnline,
          roomRole: member.role,
          joinedAt: member.joinedAt
        };
      })
      .filter(member => member.isOnline) // FIX: Only show online users
      .sort((a, b) => {
        // Sort by role (owner first) then by join date
        const roleOrder = { owner: 0, admin: 1, member: 2 };
        return roleOrder[a.roomRole] - roleOrder[b.roomRole] || new Date(a.joinedAt) - new Date(b.joinedAt);
      });

    console.log(`👥 Room ${roomId} online members: ${members.length}`);
    res.json(members);
  } catch (error) {
    console.error('Get room members error:', error);
    res.status(500).json({ error: 'Failed to fetch room members' });
  }
});
// ==================== OTHER ROUTES ====================
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  const user = findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    joinDate: user.joinDate,
    preferences: user.preferences
  });
});

// Health check with audio service stats
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SmartCollab Backend',
    stats: {
      users: users.length,
      rooms: rooms.length,
      tasks: tasks.length,
      messages: chatMessages.length
    },
    audioService: audioWebSocketHandler.getAudioServiceStats(),
    liveAudioService: liveAudioService.getStats()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});


// ==================== USER ROUTES ====================
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isOnline: user.isOnline
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ==================== TASK ROUTES ====================
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    res.json(tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, priority, dueDate, project } = req.body;
    const user = findUserById(req.user.userId);
    
    const newTask = {
      id: tasks.length + 1,
      title,
      status: 'pending',
      priority: priority || 'medium',
      assignee: user ? user.name : 'Unknown',
      dueDate,
      project: project || 'General',
      createdAt: new Date()
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ==================== DASHBOARD ROUTE ====================
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const userCount = users.length;
    const taskCount = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;

    const dashboardData = {
      stats: {
        totalUsers: userCount,
        totalTasks: taskCount,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
      },
      recentTasks: tasks.slice(-5).reverse(),
      onlineUsers: users.filter(user => user.isOnline)
                       .slice(0, 6)
                       .map(user => ({
                         id: user.id,
                         name: user.name,
                         avatar: user.avatar,
                         role: user.role
                       }))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ==================== CHAT ROUTES ====================
app.post('/api/chat/send', authenticateToken, async (req, res) => {
  try {
    const { message, roomId, targetLanguage } = req.body;
    const user = findUserById(req.user.userId);
    
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Verify user is room member
    const member = findRoomMember(user.id, roomId);
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // Filter profanity based on room settings
    const room = findRoomById(roomId);
    const cleanMessage = room.settings.profanityFilter !== false ? 
      filter.clean(message) : message;

    // Create chat message
    const newMessage = {
      id: chatMessages.length + 1,
      roomId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      message: cleanMessage,
      timestamp: new Date(),
      reactions: {}
    };

    chatMessages.push(newMessage);

    // Emit to all clients in the specific room
    io.to(roomId).emit('new-message', newMessage);

    console.log(`💬 Message sent by ${user.name} in room ${roomId}: ${cleanMessage}`);

    res.json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});



// ==================== MESSAGE REACTION ROUTE ====================
app.post('/api/messages/:messageId/react', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;
    
    if (!reaction) {
      return res.status(400).json({ error: 'Reaction is required' });
    }

    const message = chatMessages.find(msg => msg.id === parseInt(messageId));
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user has access to this message (is in the same room)
    const member = findRoomMember(req.user.userId, message.roomId);
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // Update reactions
    const reactions = message.reactions || {};
    if (!reactions[reaction]) {
      reactions[reaction] = [];
    }
    
    // Add user to reaction if not already there
    if (!reactions[reaction].includes(req.user.userId)) {
      reactions[reaction].push(req.user.userId);
      message.reactions = reactions;
    }

    // Broadcast reaction to room
    io.to(message.roomId).emit('message:reaction', {
      messageId: message.id,
      reaction,
      userId: req.user.userId,
      reactions: message.reactions
    });

    res.json({ success: true, reactions: message.reactions });
  } catch (error) {
    console.error('Message reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});


// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId, userId) => {
    try {
      socket.join(roomId);
      socket.userId = userId;
      
      // Update user online status
      const user = findUserById(userId);
      if (user) {
        user.isOnline = true;
      }
      
      // Debug log
      const onlineMembers = roomMembers
        .filter(m => m.roomId === roomId)
        .map(member => findUserById(member.userId))
        .filter(user => user.isOnline);
      
      console.log(`📊 Room ${roomId} online members after ${userId} joined:`, onlineMembers.length);
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId,
        socketId: socket.id,
        timestamp: new Date()
      });
      
      console.log(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      console.error('Join room error:', error);
    }
  });

  socket.on('leave-room', async (roomId, userId) => {
    try {
      socket.leave(roomId);
      
      // Update user online status
      const user = findUserById(userId);
      if (user) {
        user.isOnline = false;
      }
      
      // Debug log
      const onlineMembers = roomMembers
        .filter(m => m.roomId === roomId)
        .map(member => findUserById(member.userId))
        .filter(user => user.isOnline);
      
      console.log(`📊 Room ${roomId} online members after ${userId} left:`, onlineMembers.length);
      
      socket.to(roomId).emit('user-left', {
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Leave room error:', error);
    }
  });

  // WebRTC Signaling Handlers
  socket.on('webrtc:offer', (data) => {
    const { offer, targetUserId, roomId } = data;
    console.log('Forwarding WebRTC offer to:', targetUserId);
    socket.to(roomId).emit('webrtc:offer', {
      offer,
      from: socket.userId,
      roomId
    });
  });

  socket.on('webrtc:answer', (data) => {
    const { answer, targetUserId, roomId } = data;
    console.log('Forwarding WebRTC answer to:', targetUserId);
    socket.to(roomId).emit('webrtc:answer', {
      answer,
      from: socket.userId,
      roomId
    });
  });

  socket.on('webrtc:ice-candidate', (data) => {
    const { candidate, targetUserId, roomId } = data;
    console.log('Forwarding ICE candidate to:', targetUserId);
    socket.to(roomId).emit('webrtc:ice-candidate', {
      candidate,
      from: socket.userId,
      roomId
    });
  });

  // Call management
  socket.on('call:start', (data) => {
    const { roomId, userId, callType } = data;
    console.log('Call started by:', userId, 'Type:', callType);
    socket.to(roomId).emit('incoming-call', {
      userId,
      callType,
      timestamp: new Date()
    });
  });

  socket.on('call:accept', (data) => {
    const { roomId, userId, callType } = data;
    console.log('Call accepted by:', userId);
    socket.to(roomId).emit('call-accepted', {
      userId,
      callType,
      timestamp: new Date()
    });
  });

  socket.on('call:decline', (data) => {
    const { roomId, userId } = data;
    console.log('Call declined by:', userId);
    socket.to(roomId).emit('call-declined', {
      userId,
      timestamp: new Date()
    });
  });

  socket.on('call:end', (data) => {
    const { roomId, userId } = data;
    console.log('Call ended by:', userId);
    socket.to(roomId).emit('call-ended', {
      userId,
      timestamp: new Date()
    });
  });

  // Message reactions
  socket.on('message:react', async (data) => {
    try {
      const { messageId, reaction, userId, roomId } = data;
      
      const message = chatMessages.find(msg => msg.id === parseInt(messageId));
      if (message && message.roomId === roomId) {
        const reactions = message.reactions || {};
        if (!reactions[reaction]) {
          reactions[reaction] = [];
        }
        
        if (!reactions[reaction].includes(userId)) {
          reactions[reaction].push(userId);
          message.reactions = reactions;
        }
        
        // Broadcast to room
        socket.to(roomId).emit('message:reaction', {
          messageId,
          reaction,
          userId,
          reactions: message.reactions
        });
      }
    } catch (error) {
      console.error('Socket message reaction error:', error);
    }
  });

  // Whiteboard events
  socket.on('whiteboard:start', (data) => {
    socket.to(data.roomId).emit('whiteboard:start', data);
  });

  socket.on('whiteboard:draw', (data) => {
    socket.to(data.roomId).emit('whiteboard:draw', data);
  });

  socket.on('whiteboard:stop', (data) => {
    socket.to(data.roomId).emit('whiteboard:stop', data);
  });

  socket.on('whiteboard:clear', (data) => {
    socket.to(data.roomId).emit('whiteboard:clear', data);
  });

  // ==================== LIVE AUDIO TRANSCRIPTION ====================
  socket.on('audio-stream:start', (data) => {
    const { roomId, userId } = data;
    console.log(`Audio stream started for user ${userId} in room ${roomId}`);
    
    // Notify room that user started audio streaming for transcription
    socket.to(roomId).emit('audio-stream:started', {
      userId,
      roomId,
      timestamp: Date.now()
    });
  });

  socket.on('audio-chunk', (data) => {
    try {
      const { roomId, userId, audioChunk, timestamp } = data;
      
      // Validate data
      if (!roomId || !userId || !audioChunk) {
        console.error('Invalid audio-chunk data received');
        return;
      }

      // Process audio chunk through live audio service
      // The emit callback will broadcast transcript updates to the room
      liveAudioService.handleAudioChunk(
        roomId,
        userId,
        audioChunk,
        timestamp,
        (targetRoomId, transcriptData) => {
          // Broadcast transcript update to all users in the room
          io.to(targetRoomId).emit('transcript-update', transcriptData);
        }
      );
    } catch (error) {
      console.error('Error handling audio-chunk:', error.message);
    }
  });

  socket.on('audio-stream:stop', (data) => {
    const { roomId, userId } = data;
    console.log(`Audio stream stopped for user ${userId} in room ${roomId}`);
    
    // Clean up user buffers
    liveAudioService.handleUserLeft(roomId, userId);
    
    // Notify room
    socket.to(roomId).emit('audio-stream:stopped', {
      userId,
      roomId,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up live audio buffers for this user
    if (socket.userId) {
      const user = findUserById(socket.userId);
      if (user) {
        user.isOnline = false;
        
        // Find all rooms this user was in and clean up audio buffers
        // Note: In a production app, you'd track which rooms the socket joined
        // For now, we'll let the stale buffer cleanup handle it
        console.log(`Cleaned up user ${socket.userId} on disconnect`);
      }
    }
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal...');
  
  try {
    // Shutdown live audio service
    await liveAudioService.shutdown();
    
    // Finalize all active audio rooms from audioWebSocketHandler
    await audioWebSocketHandler.audioService.shutdown();
    
    console.log('All audio processing completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log('🚀 SmartCollab Backend running on port ${PORT}');
  console.log('📧 Demo accounts available:');
  console.log('   demo@smartcollab.com / password');
  console.log('   alice@test.com / password');
  console.log('   bob@test.com / password');
  console.log('\n🌐 Test the server: http://localhost:${PORT}/api/test');
  console.log('📊 Health check: http://localhost:${PORT}/api/health');
  console.log('🔐 Auth routes available: /api/auth/signup, /api/auth/login');
  console.log('🎙️ Audio processing service: READY');
});


module.exports = app;