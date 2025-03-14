import dotenv from 'dotenv';
import DBConnect from './db/index.js';
import app from './app.js';

dotenv.config({
    path: './env'
});

DBConnect()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on PORT : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log('MongoDB Connection Failed !!! : ',error)
})