# Very Good Reads

A nostalgic Windows 95-style reading tracker with AI-powered book recommendations. Track your reading journey, get personalized book suggestions, and visualize your reading activity over time—all wrapped in a retro desktop interface.

## ✨ Features

### 📚 Reading Management
- **Add & Track Books**: Log books, articles, audiobooks, and other reading materials
- **Status Management**: Track items as "to-read", "reading", "read", or "did-not-finish"
- **Reviews & Ratings**: Rate books with star ratings and add detailed reviews
- **Search & Filter**: Find books quickly with search and status filtering
- **Multiple Windows**: Organize your workflow with draggable desktop windows

### 🎨 Retro UI Experience
- **Windows 95 Interface**: Desktop with icons, taskbar, start menu, and draggable windows
- **Desktop Icons**: Quick access to Add New, Currently Reading, Collection, and Recommendations
- **Window Management**: Minimize, maximize, restore, and close windows
- **Taskbar**: View minimized windows and current time

### 🤖 AI-Powered Recommendations
- **Smart Suggestions**: Get book recommendations from your to-read list
- **History-Based**: Receive personalized suggestions based on your reading history and ratings
- **Custom Requests**: Ask for specific types of books using natural language
- **Book Covers**: Automatically fetch cover images from Google Books API

### 📊 Timeline Visualization
- **Activity Charts**: View your reading activity over time with interactive charts
- **Multiple Views**: Switch between week, month, and year views
- **Reading Metrics**: Track books read, pages read, and reading speed
- **Visual Insights**: Understand your reading patterns at a glance

### 🔔 User Experience
- **Notifications**: Toast notifications for successful actions and errors
- **Real-time Updates**: Instant UI updates when adding, editing, or deleting records
- **Responsive Design**: Works across different screen sizes

## 📁 Documentation

This project includes several documentation files:
- `README.md` (this file): Quick start guide and project overview
- `specification_plan.md`: Detailed project requirements and scope
- `development_plan.md`: Technical implementation details and timeline

## 🛠️ Tech Stack

### Frontend
- **React 19.1**: Modern UI library
- **Recharts**: Timeline visualization and charts
- **React-Draggable**: Draggable window interface
- **VS Code Codicons**: Icon library for retro UI
- **Custom CSS**: Windows 95-inspired styling

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB**: Database for storing reading records
- **Azure Cosmos DB**: Cloud database option (MongoDB API)

### AI & External APIs
- **Azure OpenAI**: GPT-4 for book recommendations
- **Google Books API**: Fetch book covers and metadata

## 📋 Prerequisites

1. **Node.js**: v14 or later
2. **Database**: MongoDB (local) or Azure Cosmos DB (cloud)
3. **Azure OpenAI**: API key and deployment for recommendations (optional but recommended)
4. **Docker** (optional): For containerized deployment

## 📂 Project Structure

```
very-good-reads/
├── backend/                  # Node.js Express API
│   ├── index.js             # Server entry point
│   ├── db.js                # Database connection
│   ├── routes/              # API routes
│   │   └── readingRecords.js
│   └── Dockerfile
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── Desktop/     # Desktop and icons
│   │   │   ├── Window/      # Window component
│   │   │   ├── Timeline/    # Timeline visualization
│   │   │   ├── taskbar/     # Taskbar and start menu
│   │   │   ├── windows/     # Window implementations
│   │   │   └── ...
│   │   ├── context/         # React context
│   │   ├── utils/           # API utilities
│   │   └── styles/          # CSS and theming
│   └── public/
└── docker-compose.yml        # Docker configuration
```

## 🚀 Getting Started

### Option 1: Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/jo-oikawa/very-good-reads.git
cd very-good-reads

# Start all services
docker-compose up

# Backend runs on http://localhost:3001
# MongoDB runs on http://localhost:27017
```

### Option 2: Local Development Setup

#### 1. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS with Homebrew:
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Option B: Azure Cosmos DB**
1. Log in to the [Azure Portal](https://portal.azure.com)
2. Create a new Azure Cosmos DB account using the MongoDB API
3. Create a database and collection for your app
4. Copy the connection string from the Azure Portal

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/very-good-reads-db

# OR for Azure Cosmos DB:
# COSMOS_DB_CONNECTION_STRING=<your-cosmos-db-connection-string>

# Server configuration
PORT=3001
NODE_ENV=development
EOF

# Start the backend
npm start
# Server runs on http://localhost:3001
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional - for AI recommendations)
cat > .env << EOF
PORT=3000
REACT_APP_AZURE_OPENAI_ENDPOINT=<your-azure-openai-endpoint>
REACT_APP_AZURE_OPENAI_API_KEY=<your-azure-openai-api-key>
REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME=<your-deployment-name>
REACT_APP_AZURE_OPENAI_API_VERSION=2023-12-01-preview
EOF

# Start the frontend
npm start
# App opens at http://localhost:3000
```

**Note:** The app works without Azure OpenAI credentials, but recommendations will use mock data.

## 📊 Data Structure

```json
{
  "_id": "unique-record-id",
  "title": "Book Title",
  "author": "Author Name",
  "format": "Physical Book | Audiobook | E-book | Article | Document",
  "status": "to-read | reading | read | did-not-finish",
  "notes": "User notes about the book",
  "tags": ["fiction", "science-fiction"],
  "review": {
    "stars": 5,
    "description": "Review text"
  },
  "createdAt": "2026-02-04T10:00:00.000Z",
  "updatedAt": "2026-02-04T10:00:00.000Z"
}
```

## 🔌 API Endpoints

### Reading Records
- `POST /api/reading-records` - Create a new record
- `GET /api/reading-records` - Get all records
- `GET /api/reading-records/:status` - Get records by status
- `PUT /api/reading-records/:id` - Update a record
- `PUT /api/reading-records/:id/status` - Update record status
- `DELETE /api/reading-records/:id` - Delete a record
- `POST /api/reading-records/:id/review` - Add a review to a record

## 🎯 Using the App

### Getting Started
1. **Desktop Icons**: Click any desktop icon to open a window
2. **Add a Book**: Click "Add New" to log your first book
3. **Track Progress**: Move books between "to-read", "reading", and "read" 
4. **Add Reviews**: Rate completed books with stars and reviews
5. **Get Recommendations**: Click "Recommended" for AI-powered suggestions
6. **View Timeline**: See your reading activity visualized over time

### Window Management
- **Drag**: Click and drag the title bar to move windows
- **Minimize**: Click the minimize button (—) to hide a window
- **Maximize**: Click the maximize button (□) to fullscreen
- **Close**: Click the X button to close a window
- **Restore**: Click taskbar buttons to restore minimized windows

### AI Recommendations
The Recommendations window offers three types of suggestions:
1. **From Your To-Read List**: Pick your next book from your saved list
2. **Based on History**: Get suggestions based on what you've read and rated
3. **Custom Request**: Describe what you're looking for in natural language

Example custom requests:
- "Science fiction books with strong female protagonists"
- "Books similar to The Lord of the Rings"
- "Non-fiction about climate change"
- "Mystery novels set in Japan"

## ✅ Implemented Features

- ✅ Full CRUD operations for reading records
- ✅ Status tracking (to-read, reading, read, did-not-finish)
- ✅ Star ratings and reviews
- ✅ Search and filtering by title, author, format, and status
- ✅ Windows 95-style desktop interface
- ✅ Draggable, resizable windows with minimize/maximize
- ✅ Desktop icons and taskbar
- ✅ AI-powered book recommendations (Azure OpenAI)
- ✅ Google Books API integration for cover images
- ✅ Timeline visualization with activity charts
- ✅ Toast notifications for user actions
- ✅ Multiple themed windows (Add New, Currently Reading, Collection, Recommendations)
- ✅ Docker support with MongoDB

## 🔮 Future Enhancements

### Priority Features
- 📱 Mobile responsive design improvements
- 🌙 Dark mode / Light mode toggle
- 📖 Reading goals and progress tracking
- 🏆 Achievement badges and gamification
- 📥 Import/export data (CSV, JSON)
- 👥 Multi-user support with authentication
- 🔗 Social sharing features
- 📚 Reading lists and collections
- 📝 Enhanced note-taking and highlights
- 🔔 Reading reminders and notifications

These features are planned for future releases based on user feedback and development priorities.

## 🛠️ Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests (when implemented)
cd backend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# The build folder contains optimized production files
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

## 🐛 Troubleshooting

### Backend won't start
- Check that MongoDB is running (`brew services list` on macOS)
- Verify connection string in `.env` file
- Check port 3001 is not already in use

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check `proxy` setting in `frontend/package.json`
- Verify CORS settings in `backend/index.js`

### AI recommendations not working
- Verify Azure OpenAI credentials in frontend `.env`
- Check Azure OpenAI deployment name and endpoint
- Review browser console for API errors
- App will use mock data if API is unavailable

### Book covers not loading
- Google Books API has rate limits
- Some books may not have cover images available
- Fallback icon will display if cover not found

## 📚 Additional Resources

- [Azure Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [React Documentation](https://react.dev/)
- [Recharts Documentation](https://recharts.org/)
- [Google Books API](https://developers.google.com/books)

## 🤝 Contributing

Want to contribute to Very Good Reads? Here's how:

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to your branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request** with a clear description of your changes

### Contribution Ideas
- 🐛 Bug fixes and improvements
- ✨ New features from the roadmap
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- ♿ Accessibility improvements

## 💬 Feedback & Support

- **Issues**: Found a bug? [Open an issue](https://github.com/jo-oikawa/very-good-reads/issues)
- **Feature Requests**: Have an idea? [Start a discussion](https://github.com/jo-oikawa/very-good-reads/discussions)
- **Questions**: Need help? Check existing issues or open a new one

## 📄 License

This project is open source and available for educational and personal use.

## 🙏 Acknowledgments

- Inspired by the nostalgic Windows 95 interface
- Built with modern web technologies
- Powered by AI through Azure OpenAI
- Book data from Google Books API

---

**Made with 📚 and ☕ for book lovers everywhere**

Ready to track your reading journey? Get started by following the setup instructions above!
