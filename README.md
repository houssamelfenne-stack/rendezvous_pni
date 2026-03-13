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
- MongoDB for the database
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
4. Set up environment variables by copying `.env.example` to `.env` and filling in the required values.

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

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.