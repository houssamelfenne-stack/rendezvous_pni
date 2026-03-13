import { initializeDatabase } from '../storage/database';

const connectDB = async () => {
    await initializeDatabase();
    console.log('Excel database initialized successfully');
};

export default connectDB;