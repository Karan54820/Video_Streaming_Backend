import {v2 as cloudinary} from "cloudinary";
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
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
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("Error in clodinary file upload: ",error);
        return null;
    }
}

const deleteFileFromCloudinary = async (cloudinary_url) => {
    try {
        // Extract the publicId from the Cloudinary URL
        const publicId = cloudinary_url
            .split('/upload/')[1] // Get everything after '/upload/'
            .split('/').slice(1).join('/') // Remove the version (e.g., v1742633446)
            .split('.')[0]; // Remove the file extension

        console.log("Extracted publicId:", publicId); // Debugging log

        // Delete the file from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        console.log("File deleted successfully:", result);
        return result;
    } catch (error) {
        console.log("Error while removing files from Cloudinary:", error);
        return null;
    }
};

export {cloudinaryUploader,deleteFileFromCloudinary}