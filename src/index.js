import dotenv from 'dotenv';
import DBConnect from './db/index.js';

dotenv.config({
    path: './env'
});

console.log('Environment Variables:', process.env.MONGODB_URI, process.env.DB_NAME);

DBConnect()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on PORT : ${process.env.PORT}`)
    })
})
.catch(()=>{
    console.log('MongoDB Connection Failed !!! : ',error)
})