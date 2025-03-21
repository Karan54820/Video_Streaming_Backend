import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {cloudinaryUploader} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const options = {
    httpOnly: true,
    secure: true
}

const genrateAcessandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong while genrating Refresh and Access Token")
    }
}

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

    const {fullname, username, email , password} = req.body;

    if(
        [fullname, username, email , password].some((fields)=> fields?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser) throw new ApiError(409,"Username or Email Already exists.")
    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    const avatar = await cloudinaryUploader(avatarLocalPath);
    const coverImage = await cloudinaryUploader(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is required");
    }

    const user = await User.create({
        fullname,
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
        new ApiResponse(200,"User registered Successfully",createdUser)
    )
})

const loginUser = asyncHandler(async (req,res)=>{
    // Get Email and password from user
    // Check if that email exists in our db
    // if email exists check if the password matches or not
    // genrate access and refresh token and send it to them
    // send in cookies
    const {email,username,password} = req.body;
    console.log(req.body);


    if(!username && !email){
        throw new ApiError(400,"Please Enter your username or email")
    }
    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"Email/Username not found , Please Register First")
    }

    if(!await user.isPasswordCorrect(password)){
        throw new ApiError(401,"Password Incorrect")
    }

    const {accessToken,refreshToken} = await genrateAcessandRefreshToken(user._id);

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken");


    return res
    .status(200)
    .cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(
        new ApiResponse(
            201,
            "User Logged in Successfully",
            {
                user:loggedinUser,accessToken,refreshToken
            }
        )
    )
})

const logoutUser = asyncHandler( async(req,res) =>{
    await User.findByIdAndUpdate(req.user._id,
        {
            refreshToken: undefined
        },
        {
            new:true
        }
    )


    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            201,"User Logged Out",{}
        )
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    // Get Token from req body or cookies
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        
        if(!incomingRefreshToken){
            throw new ApiError(404,"No Refresh Token Found");
        }
    
        // Getting Decoded Token through secret information
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        // Database Query
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        // Checking
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401,"Refresh Token Expired or used")
        }
    
        const {accessToken,refreshToken} = await genrateAcessandRefreshToken(user?._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                "Access Token Refreshed",
                {
                    accessToken,
                    refreshToken,
                }
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
    
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword} = req.body;

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(401,"Unauthorized Access");
    }

    if(!await user.isPasswordCorrect(oldpassword)){
        throw new ApiError(401,"Old Password Incorrect");
    }

    user.password = newpassword;

    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Password Changed Successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = req?.user;

    if(!user){
        throw new ApiError(401,"No Current User");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Current User fetched Successfully!!",
            user
        )
    )
})

const changeusername = asyncHandler(async(req,res)=>{

    const {newusername} = req.body;

    if(!newusername){
        throw new ApiError(401,"Please Provide a new username");
    }

    const user = await User.findById(req?.user?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(401,"Unauthroized Access");
    }

    user.username = newusername;
    await user.save({validateBeforeSave:false});

    // const data = user.select("-password -refreshToken");
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Username Changed Successfully",
            {
                user
            }
        )
    )
})

const changeAvatar = asyncHandler(async(req,res)=>{
    console.log("Files received:", req.files);
    console.log("Body received:", req.body);
    
    if(!req.files) {
        throw new ApiError(400, "No files were uploaded");
    }
    
    const newavatarpath = req.files?.newavatar?.[0]?.path;
    
    if(!newavatarpath){
        throw new ApiError(404,"Please provide a newAvatar file");
    }

    const newavatar = await cloudinaryUploader(newavatarpath);

    const user = await User.findById(req?.user?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(401,"Unauthorized Access");
    }

    user.avatar=newavatar?.url;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Avatar updated successfully",
            {
                user,
            }
        )
    )

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params;

    if(!username.trim()){
        throw new ApiError(400,"Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscribers",
                as:"subscribedTo"
            }
        },{
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                subscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in :[req.user?._id,"$subscribers.subscriber"]}
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400,"Channel does'nt exists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req?.user?._id) // Because mongoose has will convert normal string into mongo db id
            }
        },{
            $lookup:{
                from:"videos",
                localField:"watchIstory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Watch History Fetched Successfully",user[0].watchHistory)
    )
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,changeusername,changeAvatar,getUserChannelProfile,getWatchHistory}