const sequelize = require('./models');
const User = require('./models/User');
const Task = require('./models/Task');
const ChatMessage = require('./models/ChatMessage');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');
    
    // Seed demo data
    await seedDemoData();
    console.log('✅ Demo data seeded');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

async function seedDemoData() {
  // Your existing seeding code from server.js
  const userCount = await User.count();
  if (userCount === 0) {
    await User.bulkCreate([
      {
        email: 'demo@smartcollab.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Demo User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'Team Lead',
        joinDate: '2024-01-15'
      },
      {
        email: 'john@smartcollab.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'John Smith',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'Developer',
        joinDate: '2024-02-01'
      }
    ]);
  }

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
      },
      {
        title: 'Setup CI/CD pipeline',
        status: 'pending',
        priority: 'low',
        assignee: 'John Smith',
        dueDate: '2024-10-15',
        project: 'SmartCollab Mobile App'
      }
    ]);
  }
}

syncDatabase();