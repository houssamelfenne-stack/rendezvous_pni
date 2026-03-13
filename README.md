# Vaccination Calendar App

## Overview
The Vaccination Calendar App is a web application designed to manage vaccination appointments for children as part of the national immunization program. It allows users to register, log in, and manage their children's vaccination schedules efficiently.

## Features
- User registration and authentication
- Profile management for users
- Adding and managing children's information
- Scheduling and managing vaccination appointments
- Viewing vaccination schedules and available vaccines
- Protected routes to ensure secure access to user data

## Technologies Used
- React for the frontend
- TypeScript for type safety
- Node.js and Express for the backend
- Excel workbook for local persistence fallback
- PostgreSQL for cloud persistence via Neon or any managed Postgres provider
- JWT for authentication

## Project Structure
```
vaccination-calendar-app
├── src
│   ├── components          # Reusable components
│   ├── pages               # Application pages
│   ├── services            # API services
│   ├── hooks               # Custom hooks
│   ├── context             # Context providers
│   ├── types               # TypeScript types
│   ├── utils               # Utility functions
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point of the application
│   └── routes.tsx          # Application routing
├── server
│   ├── src
│   │   ├── controllers     # Request handlers
│   │   ├── models          # Database models
│   │   ├── routes          # API routes
│   │   ├── middleware      # Middleware functions
│   │   ├── config          # Configuration files
│   │   └── app.ts          # Main server file
├── package.json             # Application dependencies
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Example environment variables
└── README.md                # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd vaccination-calendar-app
   ```
3. Install dependencies for both client and server:
   ```
   npm install
   cd server && npm install
   ```
4. Set up environment variables for the server by copying `server/.env.example` to `server/.env` and filling in the required values.

## Running the Application
1. Start the server:
   ```
   cd server
   npm start
   ```
2. Start the client:
   ```
   cd ../
   npm start
   ```

## Storage Modes
The backend now supports two storage modes:

- Local mode: if `DATABASE_URL` is not set, the server keeps using the Excel workbook under `server/data/`.
- Cloud mode: if `DATABASE_URL` is set, the server uses PostgreSQL and automatically initializes the required tables.

This makes local development possible without changing your existing Excel workflow while allowing a proper deployment target for Neon.

## PostgreSQL and Neon Setup
1. Create a PostgreSQL database in Neon.
2. Copy the connection string into `server/.env` as `DATABASE_URL`.
3. Keep `DATABASE_SSL=true` for Neon.
4. Run the SQL in `server/database/schema.sql` if you want to initialize the schema manually.
5. Start the backend; it will also create the tables automatically if they do not exist.

## Recommended Deployment
- Frontend: Netlify
- Backend: Render or Railway
- Database: Neon

The frontend should point to your deployed backend by setting `REACT_APP_API_URL` to the backend API base URL.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.