# SmartCollab Deployment Guide

This guide covers different deployment options for the SmartCollab platform.

## 🚀 Quick Start (Local Development)

### Option 1: Automated Setup
```bash
# Windows
./start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup
```bash
# Install all dependencies
npm run install:all

# Start both servers
npm run dev
```

### Option 3: Separate Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🌐 Production Deployment

### Backend Deployment

#### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Select the `backend` folder as the root
3. Set environment variables:
   ```
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=production
   LIBRETRANSLATE_URL=https://libretranslate.de
   ```
4. Deploy automatically on push

#### Heroku
1. Create a new Heroku app
2. Set buildpacks to Node.js
3. Configure environment variables in Heroku dashboard
4. Deploy using Git or GitHub integration

#### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Select backend folder
3. Configure environment variables
4. Deploy with auto-scaling enabled

### Frontend Deployment

#### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

#### Netlify
1. Connect GitHub repository
2. Set base directory: `frontend`
3. Set build command: `npm run build`
4. Set publish directory: `frontend/dist`
5. Configure environment variables in Netlify dashboard

#### Cloudflare Pages
1. Connect GitHub repository
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - JWT_SECRET=your_secret_key
      - NODE_ENV=production
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:5000
```

## ☁️ Cloud Deployment

### AWS
1. **Backend**: Deploy to AWS Lambda with Serverless Framework or EC2
2. **Frontend**: Deploy to S3 + CloudFront
3. **Database**: Use RDS for PostgreSQL or DynamoDB
4. **Storage**: S3 for file uploads

### Google Cloud Platform
1. **Backend**: Deploy to Cloud Run or App Engine
2. **Frontend**: Deploy to Firebase Hosting
3. **Database**: Use Cloud SQL or Firestore
4. **Storage**: Cloud Storage for files

### Microsoft Azure
1. **Backend**: Deploy to Azure App Service
2. **Frontend**: Deploy to Azure Static Web Apps
3. **Database**: Use Azure Database for PostgreSQL
4. **Storage**: Azure Blob Storage

## 🗄️ Database Setup

### SQLite (Development)
Already configured for local development with in-memory storage.

### PostgreSQL (Production)
1. Create PostgreSQL database
2. Update backend to use database connection:
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });
   ```

### MongoDB (Alternative)
1. Set up MongoDB Atlas or local MongoDB
2. Replace SQLite with MongoDB connection:
   ```javascript
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URL);
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
LIBRETRANSLATE_URL=https://libretranslate.de
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
VITE_APP_NAME=SmartCollab
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=your_sentry_dsn_here
```

## 📊 Monitoring & Analytics

### Error Tracking
- **Sentry**: Add to both frontend and backend
- **LogRocket**: For frontend session replay
- **Winston**: For backend logging

### Performance Monitoring
- **New Relic**: Full-stack monitoring
- **DataDog**: Infrastructure monitoring
- **Google Analytics**: User analytics

### Uptime Monitoring
- **Pingdom**: Website uptime monitoring
- **UptimeRobot**: Free uptime monitoring
- **StatusPage**: Status page for users

## 🔒 Security Considerations

### SSL/TLS
- Use HTTPS in production
- Configure SSL certificates (Let's Encrypt recommended)
- Set up HSTS headers

### API Security
- Rate limiting with express-rate-limit
- Input validation and sanitization
- CORS configuration for production domains
- API key authentication for external services

### Database Security
- Use connection pooling
- Enable SSL for database connections
- Regular backups and encryption at rest
- Principle of least privilege for database users

## 📈 Scaling

### Horizontal Scaling
- Load balancer (Nginx, AWS ALB, Cloudflare)
- Multiple backend instances
- CDN for static assets
- Database read replicas

### Caching
- Redis for session storage and caching
- CDN for static assets (Cloudflare, AWS CloudFront)
- Application-level caching
- Database query optimization

### Performance Optimization
- Code splitting for frontend
- Image optimization and lazy loading
- Database indexing
- API response compression

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
```javascript
// Backend - Update CORS configuration
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --clean
```

#### Database Connection Issues
- Check connection string format
- Verify database credentials
- Ensure database server is running
- Check firewall settings

#### Memory Issues
- Increase Node.js memory limit: `--max-old-space-size=4096`
- Optimize database queries
- Implement proper caching
- Use streaming for large data sets

### Logs and Debugging
```bash
# Backend logs
cd backend
npm run dev -- --verbose

# Frontend build logs
cd frontend
npm run build -- --debug

# Docker logs
docker logs container_name -f
```

## 📞 Support

For deployment support:
- Check the main README.md for general setup
- Create an issue on GitHub for bugs
- Join our Discord for community support
- Email support@smartcollab.com for enterprise support

---

**Happy Deploying! 🚀**

