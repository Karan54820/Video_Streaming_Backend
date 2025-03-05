import dotenv from 'dotenv';
import DBConnect from './db/index.js';

dotenv.config({
    path: './env'
});

console.log('Environment Variables:', process.env.MONGODB_URI, process.env.DB_NAME);

DBConnect();