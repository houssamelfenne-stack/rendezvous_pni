import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import childRoutes from './routes/childRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import vaccineRoutes from './routes/vaccineRoutes';
import vaccineDoseRoutes from './routes/vaccineDoseRoutes';
import { config } from 'dotenv';
import { initializeExcelDatabase } from './storage/excelDatabase';

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Excel database initialization
initializeExcelDatabase();
console.log('Excel database ready');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/vaccine-doses', vaccineDoseRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});