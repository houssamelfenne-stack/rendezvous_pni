import { getDatabaseProvider, initializeDatabase } from '../storage/database';

const connectDB = async () => {
    await initializeDatabase();
    console.log(`${getDatabaseProvider()} database initialized successfully`);
};

export default connectDB;