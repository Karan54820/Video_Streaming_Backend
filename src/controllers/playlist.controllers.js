import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/videos.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(400,"Please Provide Description and Name");
    }

    const user = req.user;

    if(!user){
        throw new ApiError(400,"Please sign in to create playlist");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:user._id,
    })

    if(!playlist){
        throw new ApiError(400,"Error while creating playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist Created Successfully",playlist)
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400,"Please Provide User id");
    }

    const playlists = await Playlist.find({ owner: userId });

    return res
    .status(200)
    .json(
        new ApiResponse(200,"ALL playlists of you have been fetched Successfully",playlists)
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(400,"Please provide a playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"Playlist with the id not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist fetched Successfully",playlist)
    )


})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400,"Please provide a playlist id and videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist with the id not found");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    playlist.videos.push(video._id);
    playlist.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video Added to the playlist Successfully",playlist.videos)
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId){
        throw new ApiError(400,"Please provide a playlist id and videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist with the id not found");
    }

    let found = false;
    for(let i=0;i<playlist.videos.length;i++){
        if(playlist.videos[i]==videoId){
            found = true;
            playlist.videos.splice(i,1);
            break;
        }
    }

    if(!found){
        throw new ApiError(404,"Video is already not in the playlist");
    }

    await playlist.save({ validateBeforeSave: false });
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video Removed Successfully",playlist.videos)
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Please provide a playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"Playlist with the id not found");
    }

    await Playlist.findByIdAndDelete(playlist._id);

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist Deleted Successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(400,"Please provide a playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"Playlist with the id not found");
    }

    if(!name || !description){
        throw new ApiError(400,"Please Provide Description and Name");
    }

    playlist.name = name;
    playlist.description=description;
    playlist.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist Updated Successfully",playlist)
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}