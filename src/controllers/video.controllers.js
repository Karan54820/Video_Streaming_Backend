import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/videos.model.js"
import {User} from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {cloudinaryUploader} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!(title && description)){
        throw new ApiError(401,"Please enter Title and Description for the video");
    }

    const videoLocalPath = req.files?.videofile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!(videoLocalPath)){
        throw new ApiError(401,"Please provide a video");
    }

    if(!(thumbnailLocalPath)){
        throw new ApiError(401,"Please provide a thumbnail for the video");
    }

    const videoFile = await cloudinaryUploader(videoLocalPath);
    const thumbnail = await cloudinaryUploader(thumbnailLocalPath);

    if(!(videoFile && thumbnail)){
        throw new ApiError(400,"Error while uploading video or thumbnail");
    }

    const duration = videoFile.duration;

    const user = req?.user;

    if(!user){
        throw new ApiError(500,"Not able to fetch owner");
    }

    const video = await Video.create({
        title,
        description,
        duration,
        videofile:videoFile?.url,
        thumbnail:thumbnail?.url,
        isPublished:true,
        owner:user?._id,
    })

    if(!video){
        throw new ApiError(500,"Error while uploading video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video uploaded Successfully",video)
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}