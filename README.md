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
- Supabase for cloud persistence
- JWT for authentication

## Project Structure

```text
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
├── package.json            # Application dependencies
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Example environment variables
└── README.md               # Project documentation
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd vaccination-calendar-app
   ```

3. Install dependencies for both client and server:

   ```bash
   npm install
   cd server && npm install
   ```

4. Set up environment variables for the server by copying `server/.env.example` to `server/.env` and filling in the required values.

## Running the Application

1. Start the server:

   ```bash
   cd server
   npm start
   ```

2. Start the client:

   ```bash
   cd ../
   npm start
   ```

## Storage Modes

The backend now supports two storage modes:

- Local mode: if neither Supabase nor PostgreSQL credentials are set, the server keeps using the Excel workbook under `server/data/`.
- Supabase mode: if `STORAGE_PROVIDER=supabase` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, the server uses Supabase.
- PostgreSQL mode: if `DATABASE_URL` is set, the server uses PostgreSQL directly.

This makes local development possible without changing your existing Excel workflow while allowing a proper deployment target for Supabase.

## Supabase Setup

1. Create a Supabase project.
2. Push the schema in `server/supabase/migrations/` using the Supabase CLI, or apply the SQL manually.
3. Copy `SUPABASE_URL` and the `service_role` key into `server/.env`.
4. Set `STORAGE_PROVIDER=supabase`.
5. Start the backend; it will connect to Supabase and bootstrap the super admin account.

## Recommended Deployment

- Frontend: Netlify
- Backend: Render
- Database: Supabase

The frontend should point to your deployed backend by setting `REACT_APP_API_URL` to the backend API base URL.

## Deployment Steps

1. Deploy the backend on Render using `render.yaml`.
2. In Render, fill these required variables:
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPER_ADMIN_NATIONAL_ID`
   - `SUPER_ADMIN_PASSWORD`
3. After Render gives you the backend URL, update `netlify.toml` and replace `https://replace-with-your-backend-domain` with the real backend domain.
4. In Netlify, set `REACT_APP_API_URL` to `https://your-backend-domain/api`.
5. Redeploy the frontend so the production bundle stops calling `http://localhost:5000/api`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
