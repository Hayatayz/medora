# Medora - AI-Powered Academic Reading Platform

Medora is a comprehensive academic reading platform that combines PDF reading, AI-powered study tools, and progress tracking to enhance the learning experience for students and researchers.

## Features

### 📚 Smart PDF Reader
- Upload and read PDF documents with chapter navigation
- Highlight text and add personal notes
- Bookmark important pages for quick access
- Dark mode support for comfortable reading

### 🤖 AI Study Assistant
- **AI Chat**: Get explanations and answers about your reading material
- **Smart Flashcards**: Auto-generated flashcards from PDF content
- **Interactive Quizzes**: AI-created quizzes to test comprehension
- **Summaries**: Quick chapter and document summaries

### 📊 Progress Tracking
- Reading progress visualization
- Study streak tracking
- Pomodoro timer integration
- Weekly activity charts
- Comprehensive statistics dashboard

### 🎯 Study Tools
- Integrated Pomodoro timer for focused study sessions
- Personal library with search and categorization
- Reading goals and progress tracking
- Study session analytics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui Nova
- **Database**: PostgreSQL with Prisma 7
- **Authentication**: Custom JWT implementation
- **AI**: OpenAI GPT-4o, Google Gemini 1.5 Flash
- **File Storage**: AWS S3 (production) / Local storage (development)
- **PDF Processing**: pdf-parse, pdfjs-dist

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medora
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medora"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# AWS S3 (optional - uses local storage if not configured)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"

# AI APIs (optional - features disabled if not configured)
OPENAI_API_KEY="your-openai-key"
GEMINI_API_KEY="your-gemini-key"
YOUTUBE_API_KEY="your-youtube-key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses 15 database tables:

- **Users**: User accounts and authentication
- **Books**: PDF documents and metadata
- **Chapters**: Auto-detected book chapters
- **ReadingProgress**: User reading progress tracking
- **Highlights**: Text highlights with positions
- **Notes**: User notes with page references
- **Bookmarks**: Saved page bookmarks
- **Flashcards**: AI-generated study cards
- **Quizzes**: AI-generated quiz questions
- **QuizAttempts**: Quiz completion tracking
- **PomodoroSessions**: Study session tracking
- **UserStats**: Aggregated user statistics
- **ChatMessages**: AI chat conversation history

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Books & Reading
- `GET /api/books` - List user's books
- `POST /api/books` - Create new book
- `GET /api/books/[bookId]` - Get book details
- `POST /api/books/[bookId]/upload` - Upload PDF file
- `GET /api/books/[bookId]/chapters` - Get book chapters

### Study Tools
- `POST /api/ai/chat` - AI chat assistant
- `POST /api/ai/flashcards` - Generate flashcards
- `POST /api/ai/quiz` - Generate quiz questions
- `POST /api/ai/quiz/attempt` - Submit quiz attempt
- `POST /api/ai/summary` - Generate summaries
- `GET /api/ai/videos` - Get related videos

### User Data
- `GET/POST /api/highlights` - Text highlights
- `GET/POST /api/bookmarks` - Page bookmarks
- `GET/POST /api/notes` - User notes
- `GET/POST /api/progress` - Reading progress
- `GET/POST /api/stats` - User statistics

## Development

### Building for Production

```bash
npm run build
npm start
```

### Code Quality

```bash
npm run lint
```

### Database Management

```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

## Deployment

### Environment Setup

1. Set up PostgreSQL database
2. Configure AWS S3 bucket (optional)
3. Get AI API keys (optional)
4. Set production environment variables

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `npm run build`
2. Set up production database
3. Run migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

## Features in Detail

### AI Integration
- **Graceful Degradation**: All AI features work with placeholder API keys (disabled state)
- **Multiple Providers**: Uses both OpenAI and Gemini for different use cases
- **Context Awareness**: AI chat understands your current reading context

### File Storage
- **Development**: Files stored in `public/uploads/` (gitignored)
- **Production**: Files uploaded to AWS S3 with presigned URLs
- **Processing**: PDF text extraction and chapter detection

### Authentication
- **JWT Tokens**: Secure httpOnly cookies
- **Middleware Protection**: Route-level authentication
- **Session Management**: 7-day token expiration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
