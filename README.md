# Very Good Reads

Very Good Reads is a reading tracker app that connects a React frontend and a Node.js backend to an Azure Cosmos DB (MongoDB API) database. It also uses Azure OpenAI to generate book recommendations using LLMs.

## Documentation

This project includes several documentation files:
- `README.md` (this file): Quick start guide and project overview
- `specification_plan.md`: Detailed project requirements and scope
- `development_plan.md`: Technical implementation details and timeline
- `feedback_plan.md`: Structured template for collecting and analyzing user feedback

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

### Data Structure

```json
{
  "readingRecords": [
    {
      "id": "unique-record-id",
      "title": "string",
      "author": "string",
      "format": "string",
      "status": "string",
      "note": "string",
      "tags": ["string"],
      "review": {
        "stars": "number",
        "description": "string"
      },
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ]
}
```

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

## Planned Features

### Priority 1 Features
- Advanced search and filtering options for better organization of reading records
- Timeline view to visualize reading activity over time

### Future Enhancements
- Gamification elements including:
  - Reading goals and progress tracking
  - Achievement badges
  - Reading streaks
- Data import/export functionality to/from external platforms
- Personalized book recommendations based on reading history
- Social features for sharing reading records and recommendations
- Enhanced community engagement features

These features are planned for future releases based on user feedback and development priorities.

## Additional Resources

- [Azure Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [MongoDB Node.js Driver Documentation](https://www.mongodb.com/docs/drivers/node/current/)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

## Recommended Contribution Ideas

Looking to contribute? Here are some great ways to get involved:

- **Bug fixes**: Browse open issues labeled `bug` and submit a fix with a test.
- **New features**: Pick up a feature from the [Planned Features](#planned-features) section or propose your own via a GitHub issue.
- **Documentation**: Improve the README, add inline code comments, or write a guide for a new feature.
- **Tests**: Add unit or integration tests to improve coverage for the backend API or frontend components.
- **UI/UX improvements**: Suggest or implement design refinements that make the app more intuitive and accessible.
- **Performance**: Profile the app and submit optimizations for database queries or frontend rendering.
- **Accessibility**: Audit the frontend for WCAG compliance and open a PR with fixes.

Before contributing, please open an issue to discuss your idea so we can coordinate and avoid duplicate work. When ready, fork the repo, create a feature branch, and submit a pull request with a clear description of your changes.

## Try it & share feedback

Want to try Very Good Reads? Follow the quick start steps above to run the backend and frontend locally, explore the app, and try generating recommendations. Your feedback helps shape the project — please open an issue or a pull request on the repository with bugs, feature ideas, or improvements. If you'd like to contribute code or docs, fork the repo and send a PR. Thank you for trying it out and helping make it better!
