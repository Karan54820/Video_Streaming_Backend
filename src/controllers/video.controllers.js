import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/videos.model.js"
import {User} from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {cloudinaryUploader, deleteFileFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    console.log(req.files)
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

    if(!videoId){
        throw new ApiError(400,"Please provide a video id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"Video Not Found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video Fetched Successfully",video)
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"Please provide a video id");
    }

    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body;

    if(!(title && description)){
        throw new ApiError(400,"Please Provide title and Description for updation");
    }

    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Please provide thumbnail for updation");
    }

    const thumbnail = await cloudinaryUploader(thumbnailLocalPath);

    if(!thumbnail){
        throw new ApiError(400,"Error uploading thumbnail on cloudinary")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"Video not found");
    }

    await deleteFileFromCloudinary(video.thumbnail);

    video.thumbnail = thumbnail?.url;
    video.title = title;
    video.description = description;
    await video.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video Updated Successfully",video)
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Please provide a video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Delete files from Cloudinary
    await deleteFileFromCloudinary(video.thumbnail);
    await deleteFileFromCloudinary(video.videofile,"video");

    // Delete the video document from MongoDB
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, "Video deleted successfully")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Please provide a video ID");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video with given video id not found");
    }

    video.isPublished=!(video.isPublished);
    video.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Status Toggled Successfully",video)
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}