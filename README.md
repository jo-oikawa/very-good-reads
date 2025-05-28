
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

## Additional Resources

- [Azure Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [MongoDB Node.js Driver Documentation](https://www.mongodb.com/docs/drivers/node/current/)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
