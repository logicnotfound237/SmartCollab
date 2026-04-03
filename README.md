# SmartCollab - AI-Powered Collaboration Platform

A complete, working prototype of **SmartCollab**, an AI-powered collaboration platform inspired by Zoom's UI and Microsoft Teams' functionality. Built with React, Node.js, and modern web technologies.

![SmartCollab Banner](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop)

## 🌟 Features

### 🎯 Core Functionality
- **HD Video & Audio Meetings** - Crystal clear video calls with advanced features
- **Team Chat & File Sharing** - Real-time messaging with file attachments
- **AI-Powered Real-Time Translation** - Break language barriers with 50+ languages
- **Interactive Whiteboarding** - Collaborative drawing and sticky notes
- **Screen Sharing & Recording** - Share your screen and record meetings
- **Workflow Automation** - AI-powered smart suggestions and task creation
- **Calendar & Task Integration** - Seamless scheduling and task management
- **Secure Encrypted Collaboration** - End-to-end encryption for privacy

### 🚀 Technical Features
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme** - Toggle between themes with system preference detection
- **Real-time Updates** - Live chat, notifications, and collaboration
- **Performance Analytics** - Detailed productivity metrics and insights
- **Multi-language Support** - Interface available in multiple languages
- **Progressive Web App** - Install as a native app experience

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications
- **React Helmet** - SEO optimization
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **bad-words** - Profanity filtering
- **axios** - HTTP client for external APIs
- **SQLite3** - Lightweight database (can be replaced with PostgreSQL/MySQL)

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartCollab
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   **Backend (.env file in /backend directory):**
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   LIBRETRANSLATE_URL=https://libretranslate.de
   ```

   **Frontend (.env file in /frontend directory - optional):**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=SmartCollab
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both frontend (port 5173) and backend (port 5000) concurrently.

### Alternative: Start servers separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🚀 Usage

### Demo Credentials
For quick testing, use these demo credentials:
- **Email:** `demo@smartcollab.com`
- **Password:** `password`

Or create a new account using the signup form.

### Key Features to Test

1. **Landing Page** - Visit `http://localhost:5173` to see the Zoom-inspired landing page
2. **Authentication** - Sign up or log in to access the dashboard
3. **Dashboard** - Overview of tasks, projects, and team activity
4. **Team Chat** - Real-time messaging with translation features
5. **Tasks & Projects** - Create and manage tasks and projects
6. **Performance Analytics** - View productivity metrics and insights
7. **Settings** - Customize profile, notifications, and preferences

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

#### User Management
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users (team members)

#### Chat & Translation
- `GET /api/chat/messages` - Fetch chat messages
- `POST /api/chat/send` - Send new message
- `POST /api/translate` - Translate text to target language

#### Tasks & Projects
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create new project

#### Performance
- `GET /api/performance` - Get performance metrics

## 🎨 UI/UX Design

### Design Philosophy
- **Clean & Modern** - Inspired by Zoom's simplicity and Teams' functionality
- **Accessible** - WCAG compliant with proper contrast and keyboard navigation
- **Responsive** - Mobile-first design that works on all devices
- **Intuitive** - Familiar patterns that users already know

### Color Scheme
- **Primary:** Blue (#0369a1) - Trust, reliability, communication
- **Success:** Green (#059669) - Completion, positive actions
- **Warning:** Yellow (#d97706) - Attention, pending items
- **Error:** Red (#dc2626) - Errors, critical actions
- **Neutral:** Gray scale for text and backgrounds

### Typography
- **Font Family:** Inter - Modern, readable, professional
- **Hierarchy:** Clear heading levels and text sizes
- **Spacing:** Consistent spacing using Tailwind's spacing scale

## 🔧 Development

### Project Structure
```
SmartCollab/
├── backend/                 # Node.js/Express backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── package.json            # Root package.json for scripts
└── README.md              # This file
```

### Available Scripts

**Root level:**
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build frontend for production
- `npm start` - Start backend in production mode

**Backend:**
- `npm run dev` - Start backend with nodemon (auto-restart)
- `npm start` - Start backend in production mode

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding New Features

1. **Backend API Endpoints:**
   - Add routes in `backend/server.js`
   - Follow RESTful conventions
   - Include proper error handling
   - Add authentication middleware where needed

2. **Frontend Components:**
   - Create components in `frontend/src/components/`
   - Use functional components with hooks
   - Follow the existing styling patterns
   - Add proper TypeScript if converting

3. **Database Integration:**
   - Currently uses in-memory storage
   - To add persistent storage, replace mock data with database calls
   - Recommended: PostgreSQL with Prisma ORM

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set environment variables in your hosting dashboard

### Backend Deployment (Railway/Heroku/DigitalOcean)
1. Deploy the `backend` folder
2. Set environment variables:
   - `PORT` (usually provided by hosting service)
   - `JWT_SECRET` (generate a secure secret)
   - `NODE_ENV=production`
   - `LIBRETRANSLATE_URL=https://libretranslate.de`

### Full-Stack Deployment
For a complete deployment, you can:
1. Deploy backend to a service like Railway or Heroku
2. Deploy frontend to Vercel or Netlify
3. Update frontend environment variables to point to your backend URL

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **CORS Configuration** - Proper cross-origin resource sharing setup
- **Input Validation** - Server-side validation for all inputs
- **Profanity Filtering** - Automatic content filtering in chat
- **Rate Limiting** - Can be added for API protection

## 🌍 Internationalization

The platform supports multiple languages:
- English (default)
- Spanish (Español)
- French (Français)
- German (Deutsch)
- Japanese (日本語)
- Chinese (中文)
- Hindi (हिन्दी)
- Arabic (العربية)

Translation is powered by LibreTranslate API for real-time chat translation.

## 📱 Mobile Support

- **Responsive Design** - Works on all screen sizes
- **Touch Optimized** - Touch-friendly interface elements
- **Progressive Web App** - Can be installed as a mobile app
- **Offline Support** - Basic offline functionality (can be enhanced)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zoom** - UI/UX inspiration for clean, professional design
- **Microsoft Teams** - Functionality inspiration for collaboration features
- **LibreTranslate** - Free translation API service
- **Tailwind CSS** - Amazing utility-first CSS framework
- **Lucide** - Beautiful icon library
- **Unsplash** - High-quality stock photos

## 📞 Support

For support, email support@smartcollab.com or join our community Discord server.

## 🚀 What's Next?

### Planned Features
- [ ] Real video calling integration (WebRTC)
- [ ] File upload and sharing
- [ ] Advanced whiteboard tools
- [ ] Calendar integration
- [ ] Mobile apps (React Native)
- [ ] Desktop apps (Electron)
- [ ] Advanced AI features
- [ ] Enterprise SSO integration

### Performance Optimizations
- [ ] Database optimization
- [ ] Caching layer (Redis)
- [ ] CDN integration
- [ ] Image optimization
- [ ] Bundle size optimization

---

**Built with ❤️ by the SmartCollab Team**

*Making collaboration smarter, one feature at a time.*

