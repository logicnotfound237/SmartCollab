# 🚀 SmartCollab - Windows Startup Guide

## ✅ Your Servers are Running!

Both backend and frontend servers are now live:

### 🌐 **Access Your Application**
- **Frontend (Main App):** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### 🔑 **Demo Login Credentials**
- **Email:** `demo@smartcollab.com`
- **Password:** `password`

## 🎯 **Next Steps**

1. **Open your web browser**
2. **Go to:** http://localhost:5173
3. **Explore the landing page** - Beautiful Zoom-inspired design
4. **Click "Sign In"** or use the demo credentials
5. **Explore all features:**
   - Dashboard overview
   - Task management
   - Team chat with translation
   - Performance analytics
   - Settings and preferences

## 🔄 **If You Need to Restart (Windows Commands)**

### Option 1: Use the batch file
```cmd
start.bat
```

### Option 2: Manual restart (separate terminals)

**Terminal 1 - Backend:**
```cmd
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npm run dev
```

### Option 3: Using PowerShell (separate commands)
```powershell
# Terminal 1
cd backend; node server.js

# Terminal 2  
cd frontend; npm run dev
```

## 🛠️ **Windows-Specific Notes**

- PowerShell doesn't support `&&` operator, so use `;` or separate commands
- Both servers need to run simultaneously
- Keep both terminal windows open while using the app
- Use `Ctrl+C` to stop servers when done

## 🎨 **Features to Showcase**

### **Landing Page** (http://localhost:5173)
- Professional Zoom-inspired design
- Feature showcase with animations
- Mobile responsive design

### **Dashboard** (after login)
- Teams-inspired sidebar navigation
- Real-time stats and metrics
- Quick action buttons

### **Chat System**
- Multi-language translation
- Interactive whiteboard
- Emoji reactions

### **Task & Project Management**
- Create and assign tasks
- Track project progress
- Team collaboration tools

### **Performance Analytics**
- Productivity insights
- Weekly activity charts
- Goal tracking

## 🚨 **Troubleshooting**

### **Port Already in Use:**
```cmd
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### **Dependencies Issues:**
```cmd
# Reinstall backend dependencies
cd backend
rmdir /s node_modules
del package-lock.json
npm install

# Reinstall frontend dependencies
cd frontend
rmdir /s node_modules
del package-lock.json
npm install
```

## 🎉 **You're All Set!**

Your SmartCollab platform is ready for demonstration. The application showcases:

- ✅ Modern React frontend with TailwindCSS
- ✅ Node.js/Express backend with JWT authentication
- ✅ AI-powered translation features
- ✅ Real-time chat and collaboration tools
- ✅ Comprehensive task and project management
- ✅ Performance analytics and insights
- ✅ Responsive design for all devices
- ✅ Professional UI inspired by Zoom and Teams

**Enjoy exploring your AI-powered collaboration platform!** 🚀

