# Database Setup: Azure Cosmos DB with MongoDB API

This document outlines the database setup for the `very-good-reads` project, which uses Azure Cosmos DB with the MongoDB API to connect to a Node.js backend and a React frontend.

## Prerequisites

1. **Azure Account**: Ensure you have an active Azure subscription.
2. **Node.js**: Install Node.js (v14 or later).
3. **MongoDB Driver**: Ensure the `mongodb` package is installed in your Node.js project.
4. **React App**: Set up your React frontend.

## Steps to Set Up Azure Cosmos DB

1. **Create a Cosmos DB Account**:
    - Log in to the [Azure Portal](https://portal.azure.com).
    - Create a new Azure Cosmos DB account using the MongoDB API.

2. **Configure Database and Collections**:
    - In the Azure Portal, create a database and the required collections for your app.

3. **Connection String**:
    - Navigate to the "Connection String" section in your Cosmos DB account.
    - Copy the connection string for use in your Node.js app.

## Node.js Backend Configuration

1. **Install MongoDB Driver**:
    ```bash
    npm install mongodb
    ```

2. **Connect to Cosmos DB**:
    Update your backend code to connect to Cosmos DB:
    ```javascript
    const { MongoClient } = require('mongodb');

    const uri = process.env.COSMOS_DB_CONNECTION_STRING; // Store in .env file
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    async function connectToDatabase() {
         try {
              await client.connect();
              console.log("Connected to Azure Cosmos DB!");
         } catch (err) {
              console.error("Failed to connect to database", err);
         }
    }

    connectToDatabase();
    ```

3. **Environment Variables**:
    Add the connection string to your `.env` file:
    ```
    COSMOS_DB_CONNECTION_STRING=<your-connection-string>
    ```

## React Frontend Configuration

1. **API Integration**:
    Ensure your React app communicates with the Node.js backend to fetch and update data.

2. **Environment Variables**:
    Store any necessary API URLs or keys in a `.env` file in your React project:
    ```
    REACT_APP_API_URL=http://localhost:5000/api
    ```

3. **Fetch Data**:
    Use `fetch` or `axios` to interact with your backend:
    ```javascript
    const fetchData = async () => {
         const response = await fetch(`${process.env.REACT_APP_API_URL}/data`);
         const data = await response.json();
         console.log(data);
    };

    fetchData();
    ```

## Testing the Setup

1. Start the Node.js backend:
    ```bash
    npm start
    ```

2. Start the React frontend:
    ```bash
    npm start
    ```

3. Verify that your app can read and write data to Azure Cosmos DB.

## Additional Resources

- [Azure Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [MongoDB Node.js Driver Documentation](https://www.mongodb.com/docs/drivers/node/current/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
