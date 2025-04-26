# Blog List Application

This is a blog list application with a React frontend and Node.js/Express backend.

## Deployment to Render

### Prerequisites

1. Create a Render account at https://render.com/
2. Have your MongoDB connection string ready (from MongoDB Atlas or another MongoDB provider)

### Steps to deploy

1. Push your code to a GitHub repository
2. Log in to Render and click "New Web Service"
3. Select your GitHub repository
4. Configure the web service:
   - Name: bloglist-app (or any name you prefer)
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

5. Add the following environment variables:
   - `PORT`: 10000 (or any port Render allows)
   - `MONGODB_URI`: Your MongoDB connection string
   - `SECRET`: Secret for JWT token generation

6. Click "Create Web Service"

The application will be deployed and available at the URL provided by Render.

## Local Development

### Backend

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend

```bash
# Navigate to the frontend directory
cd ../blogilistafrontend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build:prod

# Run tests
npm test

# Lint code
npm run lint
```

## Features

- User registration and authentication
- Create, read, update, and delete blog posts
- Like functionality for blog posts
- User-specific blog management