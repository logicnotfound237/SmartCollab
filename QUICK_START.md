# 🚀 SmartCollab - Quick Start Guide

## ✅ Servers are Running!

Your SmartCollab application is now live and ready to use:

### 🌐 Access URLs
- **Frontend (Main App):** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Health Check:** http://localhost:5000/api/health

### 🔑 Demo Login Credentials
- **Email:** `demo@smartcollab.com`
- **Password:** `password`

### 📱 How to Use

1. **Visit the Landing Page**
   - Go to http://localhost:5173
   - Explore the beautiful Zoom-inspired homepage
   - Click "Get Started Free" or "Sign In"

2. **Login with Demo Account**
   - Use the credentials above
   - Or click "Use demo credentials" button on login page

3. **Explore the Dashboard**
   - Overview of tasks, projects, and team activity
   - Try the quick actions (Start Meeting, New Task, Team Chat)

4. **Test Key Features**
   - **Tasks:** Create and manage tasks with priorities
   - **Projects:** View project progress and team assignments
   - **Chat:** Real-time messaging with translation features
   - **Performance:** View productivity analytics and insights
   - **Settings:** Customize profile and preferences

### 🎨 Features to Showcase

#### Landing Page
- Professional Zoom-inspired design
- Feature showcase with animations
- Testimonials and company logos
- Responsive mobile design

#### Dashboard
- Teams-inspired sidebar navigation
- Real-time stats and metrics
- Quick action buttons
- Team member overview

#### Chat System
- Multi-language translation (8+ languages)
- Interactive whiteboard for collaboration
- Emoji reactions and profanity filtering
- Real-time messaging simulation

#### Task Management
- Kanban-style task organization
- Priority levels and due dates
- Project assignment and tracking
- Progress visualization

#### Performance Analytics
- Weekly activity charts
- Productivity insights
- Goal tracking and achievements
- Team comparison metrics

### 🛠️ If You Need to Restart

#### Option 1: Use the automated scripts
```bash
# Windows
./start.bat

# Linux/Mac
chmod +x start.sh && ./start.sh
```

#### Option 2: Manual restart
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option 3: Use the root script
```bash
npm run dev
```

### 🔧 Troubleshooting

#### If servers don't start:
1. Make sure you're in the correct directory
2. Check if ports 5000 and 5173 are available
3. Run `npm run install:all` to ensure dependencies are installed

#### If you see CORS errors:
- Make sure both frontend (5173) and backend (5000) are running
- The CORS is configured to allow localhost:5173

#### If translation doesn't work:
- The app uses LibreTranslate API (free service)
- Some features may be limited by API rate limits
- All other features work offline with mock data

### 🎯 Competition Demo Tips

1. **Start with Landing Page** - Show the professional design
2. **Demo Authentication** - Quick login with demo credentials
3. **Showcase Dashboard** - Overview of all features
4. **Highlight Chat Translation** - The AI-powered language feature
5. **Show Task Management** - Create and manage tasks
6. **Display Analytics** - Performance insights and charts
7. **Mobile Responsiveness** - Resize browser to show mobile design

### 📞 Need Help?

- Check the main README.md for detailed documentation
- Review DEPLOYMENT.md for production setup
- All features are working with realistic mock data
- The app is fully responsive and production-ready

---

**🎉 Enjoy exploring SmartCollab!**

*Your AI-powered collaboration platform is ready to impress!*

