
# Very Good Reads

Very Good Reads is a reading tracker app that connects a React frontend and a Node.js backend to an Azure Cosmos DB (MongoDB API) database. It also uses Azure OpenAI to generate book recommendations using LLMs.

## Prerequisites

1. **Azure Account**: Active Azure subscription for Cosmos DB and OpenAI services.
2. **Node.js**: v14 or later.
3. **MongoDB Driver**: Installed in your Node.js backend (`npm install mongodb`).
4. **React App**: Set up in the `frontend/` directory.

## Project Structure

- `backend/`: Node.js backend API
- `frontend/`: React frontend
- `database/`: Database setup docs

## Database Setup (Azure Cosmos DB with MongoDB API)

1. **Create a Cosmos DB Account**:
    - Log in to the [Azure Portal](https://portal.azure.com).
    - Create a new Azure Cosmos DB account using the MongoDB API.
2. **Configure Database and Collections**:
    - In the Azure Portal, create a database and the required collections for your app.
3. **Connection String**:
    - Copy the connection string from the Azure Portal for use in your Node.js backend.

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```
COSMOS_DB_CONNECTION_STRING=<your-cosmos-db-connection-string>
```

## Node.js Backend Configuration

1. **Install dependencies**:
    ```bash
    cd backend
    npm install
    ```
2. **Start the backend**:
    ```bash
    npm start
    ```

## React Frontend Configuration

1. **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```
2. **Start the frontend**:
    ```bash
    npm start
    ```

### Frontend Environment Variables (AI Recommendations)

Create a `.env` file in the `frontend/` directory with your Azure OpenAI keys:

```
PORT=3001
REACT_APP_AZURE_OPENAI_ENDPOINT=<your-azure-openai-endpoint>
REACT_APP_AZURE_OPENAI_API_KEY=<your-azure-openai-api-key>
REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME=<your-azure-openai-deployment-name>
REACT_APP_AZURE_OPENAI_API_VERSION=2023-12-01-preview
REACT_APP_AZURE_OPENAI_MODEL_VERSION=2025-04-14
```

**Note:** Never commit `.env` files with secrets to version control.

## How AI Book Recommendations Work

- The frontend uses the Azure OpenAI API to generate book recommendations based on your reading history or custom prompts.
- You must provide valid Azure OpenAI credentials in the frontend `.env` file (see above).
- The API is called from `frontend/src/utils/recommendationsAPI.js`.

## Testing the Setup

1. Start the backend:
    ```bash
    cd backend
    npm start
    ```
2. Start the frontend:
    ```bash
    cd frontend
    npm start
    ```
3. Verify the app can read/write data to Cosmos DB and fetch AI recommendations.

## Contributing Ideas

We welcome contributions to make Very Good Reads even better! Here are some areas where you could contribute:

### Feature Enhancements

- **Enhanced Search & Filtering**
  - Add full-text search across titles, authors, and notes
  - Implement advanced filters (date ranges, ratings, formats)
  - Add sorting options (by date added, rating, alphabetical)

- **Reading Statistics & Analytics**
  - Dashboard showing reading progress over time
  - Visual charts for books read per month/year
  - Genre distribution analysis
  - Average reading time tracking

- **Social Features**
  - Share reading lists with friends
  - Export reading records to various formats (CSV, JSON, PDF)
  - Social media integration for sharing book reviews
  - Book clubs or reading groups functionality

- **Mobile Experience**
  - Responsive design improvements for mobile devices
  - Progressive Web App (PWA) capabilities
  - Touch-optimized UI interactions

- **AI Integration Improvements**
  - Implement caching for AI recommendations to reduce API costs
  - Add more recommendation types (by mood, by genre, by length)
  - Allow users to provide feedback on AI recommendations to improve future suggestions
  - Add support for other AI providers (OpenAI, Anthropic Claude, Google Gemini)

### Technical Improvements

- **Testing**
  - Add comprehensive unit tests for backend API routes
  - Implement integration tests for database operations
  - Add E2E tests for critical user workflows
  - Improve test coverage for React components

- **Performance Optimization**
  - Implement pagination for large reading record lists
  - Add Redis caching layer for frequently accessed data
  - Optimize database queries with proper indexing
  - Implement lazy loading for images and heavy components

- **Security Enhancements**
  - Add user authentication and authorization
  - Implement rate limiting for API endpoints
  - Add input validation and sanitization
  - Set up HTTPS and security headers

- **Developer Experience**
  - Add Docker and Docker Compose setup for easy local development
  - Create comprehensive API documentation (Swagger/OpenAPI)
  - Add pre-commit hooks for linting and formatting
  - Implement CI/CD pipeline with automated testing
  - Add database migration tools

### UI/UX Improvements

- **Accessibility**
  - Ensure WCAG 2.1 AA compliance
  - Add keyboard navigation support
  - Improve screen reader compatibility
  - Add high contrast mode and dark theme

- **User Interface**
  - Design a more modern, clean interface
  - Add animations and transitions for better user feedback
  - Implement drag-and-drop for organizing reading lists
  - Add customizable themes and color schemes

- **User Experience**
  - Add onboarding tutorial for new users
  - Implement undo/redo functionality
  - Add bulk operations (delete, status change)
  - Improve error messages and user feedback

### Documentation

- **Code Documentation**
  - Add JSDoc comments to all functions and components
  - Create architecture decision records (ADRs)
  - Document database schema and relationships
  - Add inline code comments for complex logic

- **User Documentation**
  - Create user guide with screenshots
  - Add video tutorials for key features
  - Document common troubleshooting steps
  - Create FAQ section

### Getting Started with Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## Additional Resources

- [Azure Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [MongoDB Node.js Driver Documentation](https://www.mongodb.com/docs/drivers/node/current/)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
