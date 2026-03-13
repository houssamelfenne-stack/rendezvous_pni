import { initializeExcelDatabase } from '../storage/excelDatabase';

const connectDB = async () => {
    initializeExcelDatabase();
    console.log('Excel database initialized successfully');
};

export default connectDB;