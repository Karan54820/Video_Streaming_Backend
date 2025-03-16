import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req,res)=>{

    try {
        const token = req?.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unauthorized Access");
        }
    
        const decodedToken = jwt.verify(token,ACCESS_TOKEN_SECRET);
    
        const user = User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid Acces Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access Token")
    }
})