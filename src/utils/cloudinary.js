import {v2 as cloudinary} from cloudinary;
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const cloudinaryUploader = async (localFilePath) => {
    try {
        if(!localFilePath){
            console.log("File not present in local Storage");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        });

        console.log("File has been uploaded on cloudinary",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("Error in clodinary file upload: ",error);
        return null;
    }
}