import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import childRoutes from './routes/childRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import vaccineRoutes from './routes/vaccineRoutes';
import vaccineDoseRoutes from './routes/vaccineDoseRoutes';
import adminRoutes from './routes/adminRoutes';
import healthCenterRoutes from './routes/healthCenterRoutes';
import { config } from 'dotenv';
import connectDB from './config/database';

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/vaccine-doses', vaccineDoseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health-center', healthCenterRoutes);

// Start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize database', error);
        process.exit(1);
    });