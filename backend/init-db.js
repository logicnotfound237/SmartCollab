const sequelize = require('./models/index');

// Import all models
const User = require('./models/User');
const Task = require('./models/Task');
const ChatMessage = require('./models/ChatMessage');
const Room = require('./models/Room');
const RoomMember = require('./models/RoomMember');

// Initialize models with sequelize instance
User.init({
  id: { type: sequelize.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: sequelize.Sequelize.STRING, unique: true, allowNull: false },
  password: { type: sequelize.Sequelize.STRING, allowNull: false },
  name: { type: sequelize.Sequelize.STRING, allowNull: false },
  avatar: { type: sequelize.Sequelize.STRING },
  role: { type: sequelize.Sequelize.STRING, defaultValue: 'Team Member' },
  joinDate: { type: sequelize.Sequelize.DATE, defaultValue: sequelize.Sequelize.NOW },
  preferences: {
    type: sequelize.Sequelize.JSON,
    defaultValue: {
      defaultLanguage: 'en',
      theme: 'light',
      notifications: true
    }
  },
  isOnline: {
    type: sequelize.Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'User'
});

Task.init({
  id: { type: sequelize.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: sequelize.Sequelize.STRING, allowNull: false },
  status: { type: sequelize.Sequelize.STRING, defaultValue: 'pending' },
  priority: { type: sequelize.Sequelize.STRING, defaultValue: 'medium' },
  assignee: { type: sequelize.Sequelize.STRING },
  dueDate: { type: sequelize.Sequelize.DATE },
  project: { type: sequelize.Sequelize.STRING, defaultValue: 'General' }
}, {
  sequelize,
  modelName: 'Task'
});

ChatMessage.init({
  id: { type: sequelize.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  roomId: { type: sequelize.Sequelize.UUID, allowNull: false },
  senderId: { type: sequelize.Sequelize.INTEGER },
  senderName: { type: sequelize.Sequelize.STRING },
  message: { type: sequelize.Sequelize.TEXT, allowNull: false },
  translated: { type: sequelize.Sequelize.BOOLEAN, defaultValue: false },
  translation: { type: sequelize.Sequelize.TEXT },
  detectedLanguage: { type: sequelize.Sequelize.STRING, defaultValue: 'en' },
  targetLanguage: { type: sequelize.Sequelize.STRING, defaultValue: 'en' },
  originalMessage: { type: sequelize.Sequelize.TEXT },
  timestamp: { type: sequelize.Sequelize.DATE, defaultValue: sequelize.Sequelize.NOW },
  reactions: {
    type: sequelize.Sequelize.JSON,
    defaultValue: {}
  }
}, {
  sequelize,
  modelName: 'ChatMessage'
});

Room.init({
  id: { 
    type: sequelize.Sequelize.UUID, 
    defaultValue: sequelize.Sequelize.UUIDV4, 
    primaryKey: true 
  },
  name: { 
    type: sequelize.Sequelize.STRING, 
    allowNull: false 
  },
  createdBy: { 
    type: sequelize.Sequelize.INTEGER, 
    allowNull: false 
  },
  settings: {
    type: sequelize.Sequelize.JSON,
    defaultValue: {
      profanityFilter: true,
      defaultLanguage: 'en',
      allowScreenShare: true,
      allowWhiteboard: true
    }
  },
  isActive: {
    type: sequelize.Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Room'
});

RoomMember.init({
  id: { 
    type: sequelize.Sequelize.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  userId: { 
    type: sequelize.Sequelize.INTEGER, 
    allowNull: false 
  },
  roomId: { 
    type: sequelize.Sequelize.UUID, 
    allowNull: false 
  },
  preferences: {
    type: sequelize.Sequelize.JSON,
    defaultValue: {
      language: 'en',
      notifications: true
    }
  },
  role: {
    type: sequelize.Sequelize.ENUM('owner', 'participant'),
    defaultValue: 'participant'
  },
  joinedAt: {
    type: sequelize.Sequelize.DATE,
    defaultValue: sequelize.Sequelize.NOW
  }
}, {
  sequelize,
  modelName: 'RoomMember'
});

// Set up associations
User.hasMany(ChatMessage, { foreignKey: 'senderId' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId' });

User.hasMany(RoomMember, { foreignKey: 'userId' });
RoomMember.belongsTo(User, { foreignKey: 'userId' });

Room.hasMany(RoomMember, { foreignKey: 'roomId' });
RoomMember.belongsTo(Room, { foreignKey: 'roomId' });

Room.hasMany(ChatMessage, { foreignKey: 'roomId' });
ChatMessage.belongsTo(Room, { foreignKey: 'roomId' });

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');
    
    // Seed demo data
    await seedDemoData();
    console.log('✅ Demo data seeded');
    
    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

async function seedDemoData() {
  // Seed users
  const userCount = await User.count();
  if (userCount === 0) {
    await User.bulkCreate([
      {
        email: 'demo@smartcollab.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'Demo User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'Team Lead',
        preferences: { defaultLanguage: 'en', theme: 'light' }
      },
      {
        email: 'john@smartcollab.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'John Smith',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'Developer',
        preferences: { defaultLanguage: 'hi', theme: 'light' }
      },
      {
        email: 'maria@smartcollab.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'Maria Garcia',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        role: 'Designer',
        preferences: { defaultLanguage: 'es', theme: 'light' }
      }
    ]);
    console.log('✅ Seeded 3 demo users');
  }

  // Seed tasks
  const taskCount = await Task.count();
  if (taskCount === 0) {
    await Task.bulkCreate([
      {
        title: 'Design user authentication flow',
        status: 'completed',
        priority: 'high',
        assignee: 'Demo User',
        dueDate: '2024-10-05',
        project: 'SmartCollab Mobile App'
      },
      {
        title: 'Implement chat translation API',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Demo User',
        dueDate: '2024-10-10',
        project: 'AI Translation Engine'
      }
    ]);
    console.log('✅ Seeded demo tasks');
  }
}

syncDatabase();