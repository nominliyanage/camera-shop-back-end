import mongo from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_DB_URL = process.env.MONGO_DB_URL as string;
const DBConnection = async () => {
    try {
        console.log(MONGO_DB_URL);
        const connection = await mongo.connect(MONGO_DB_URL);
        return `Successfully connected to MongoDB: ${connection.connection?.host}`;
    } catch (error) {
        return "Mongo DB Connection Error:" + error;
    }
}

export default DBConnection;