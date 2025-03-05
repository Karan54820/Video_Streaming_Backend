import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
const DBConnect = async ()=>{
    try {   
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Mongo DB Connected !! DB Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error in DB Connect: ",error);
        process.exit(1);
    }
}

export default DBConnect