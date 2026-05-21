# Medora Deployment Guide

## Quick Start (Development)

1. **Clone and Install**
```bash
git clone <repository-url>
cd medora
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

3. **Database Setup**
```bash
# Start PostgreSQL (adjust for your system)
sudo systemctl start postgresql
# or
brew services start postgresql

# Run migrations
npx prisma migrate dev
```

4. **Start Development Server**
```bash
npm run dev
```

Visit http://localhost:3000

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - Connect repository to Vercel
   - Vercel will auto-detect Next.js

2. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/medora
   JWT_SECRET=your-production-secret
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_S3_BUCKET_NAME=your-bucket
   OPENAI_API_KEY=your-openai-key
   GEMINI_API_KEY=your-gemini-key
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Database Setup**
   ```bash
   # Run migrations on production database
   npx prisma migrate deploy
   ```

4. **Deploy**
   - Push to main branch
   - Vercel deploys automatically

### Option 2: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

2. **Docker Compose**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/medora
      - JWT_SECRET=your-secret
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=medora
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

3. **Deploy**
```bash
docker-compose up -d
```

### Option 3: VPS/Server

1. **Server Setup**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Application Setup**
```bash
# Clone and build
git clone <repository-url>
cd medora
npm install
npm run build

# Setup database
sudo -u postgres createdb medora
npx prisma migrate deploy
```

3. **Process Management**
```bash
# Start with PM2
pm2 start npm --name "medora" -- start
pm2 startup
pm2 save
```

4. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migrations

### Development
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset
```

### Production
```bash
# Deploy migrations
npx prisma migrate deploy

# Generate client (if needed)
npx prisma generate
```

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens

### Optional (Features disabled if not set)
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `OPENAI_API_KEY` - OpenAI API key
- `GEMINI_API_KEY` - Google Gemini API key
- `YOUTUBE_API_KEY` - YouTube API key

### Configuration
- `NEXT_PUBLIC_APP_URL` - Your app's public URL
- `NODE_ENV` - Environment (development/production)
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/auth/me
```

### Logs
```bash
# PM2 logs
pm2 logs medora

# Docker logs
docker-compose logs -f app
```

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Build Errors**
   - Clear .next folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check Node.js version (18+ required)

3. **File Upload Issues**
   - Check AWS credentials and bucket permissions
   - Verify public/uploads directory exists (development)
   - Check file size limits

4. **AI Features Not Working**
   - Verify API keys are set correctly
   - Check API quotas and billing
   - Features gracefully degrade with placeholder keys

### Performance Optimization

1. **Database**
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Monitor query performance

2. **File Storage**
   - Use CDN for static assets
   - Implement file compression
   - Set up proper caching headers

3. **Application**
   - Enable Next.js caching
   - Use Redis for session storage
   - Implement rate limiting