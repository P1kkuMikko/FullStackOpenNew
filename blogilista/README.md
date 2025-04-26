# Blog List Application

A full-stack blog list application with React frontend and Node.js/Express backend.

## Features

- User registration and authentication with JWT
- Create, read, update, and delete blog posts
- Like functionality for blog posts
- User-specific blog management
- RESTful API backend
- React-based responsive frontend

## Tech Stack

- **Frontend**: React, Axios, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Testing**: Vitest, React Testing Library, Supertest

## Deployment Guide for Render.com

### Prerequisites

1. Create an account at [Render](https://render.com/)
2. Set up a MongoDB database (e.g., with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
3. Push your code to a GitHub repository

### Deployment Steps

#### Option 1: Deploy with render.yaml (recommended)

1. Push your code to GitHub
2. Log in to Render and navigate to Blueprint section
3. Connect to your GitHub repository
4. Render will automatically detect the render.yaml file and configure the service

#### Option 2: Manual Deployment

1. Log in to Render and select "New Web Service"
2. Connect your GitHub repository
3. Configure the web service:
   - **Name**: bloglist-app (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && cd ../blogilistafrontend && npm install && npm run build && cp -r dist ../blogilista/build`
   - **Start Command**: `npm start`

4. Add Environment Variables:
   - `NODE_ENV`: production
   - `PORT`: 10000 (or your preferred port)
   - `MONGODB_URI`: Your MongoDB connection string
   - `SECRET`: Secret key for JWT token generation

5. Click "Create Web Service"

### Environment Variables

Make sure to set the following environment variables in Render:

| Variable | Description |
|----------|-------------|
| PORT | The port the server will run on (e.g., 10000) |
| MONGODB_URI | Your MongoDB connection string |
| SECRET | Secret key for JWT token generation |
| NODE_ENV | Set to 'production' |

## Local Development

### Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd blogilista
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../blogilistafrontend
   npm install
   ```
4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3003
   MONGODB_URI=your_mongodb_connection_string
   SECRET=your_secret_key
   ```

### Running the Application

#### Backend Development Server
```bash
cd blogilista
npm run dev
```

#### Frontend Development Server
```bash
cd blogilistafrontend
npm run dev
```

### Building for Production
```bash
cd blogilista
npm run build:ui:windows  # For Windows
npm run build:ui          # For Linux/Mac
```

### Running Tests

#### Backend Tests
```bash
cd blogilista
npm test
```

#### Frontend Tests
```bash
cd blogilistafrontend
npm test
```

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/users` - Register a new user

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create a new blog (requires authentication)
- `GET /api/blogs/:id` - Get a specific blog
- `PUT /api/blogs/:id` - Update a blog (requires authentication)
- `DELETE /api/blogs/:id` - Delete a blog (requires authentication)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user

## Project Structure

```
blogilista/             # Backend code
├── controllers/        # API route handlers
├── models/             # Database models
├── utils/              # Utility functions and middleware
├── tests/              # Backend tests
├── build/              # Frontend build files (generated)
├── app.js              # Express app configuration
└── index.js            # Entry point

blogilistafrontend/     # Frontend code
├── src/
│   ├── components/     # React components
│   ├── services/       # API service functions
│   ├── tests/          # Frontend tests
│   ├── App.jsx         # Main React component
│   └── main.jsx        # React entry point
└── public/             # Static assets
```