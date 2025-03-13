import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {cloudinaryUploader} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) => {
    // get users details
    // validation - required fields are non empty
    // check if user already exists
    // check if image, avatar(required field)
    // uplaod on cloudinary, avatar
    // create a user object - creation call in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, username, email , password} = req.body;
    console.log("email: ",email);

    if(
        [fullName, username, email , password].some((fields)=> fields?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser) throw new ApiError(409,"Username or Email Already exists.")

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    const avatar = await cloudinaryUploader(avatarLocalPath);
    const coverImage = cloudinaryUploader(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is required");
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )

    res.json({
        message:"ok"
    })
})

export {registerUser}