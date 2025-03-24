import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    if(!content){
        throw new ApiError(400,"Please provide Content for the tweet");
    }

    const user = req.user;

    if(!user){
        throw new ApiError(400,"Ypu must be logged in to post a tweet");
    }

    const tweet = await Tweet.create({
        content:content,
        owner:user._id,
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Tweet Posted Successfully",tweet)
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400,"Failed to fetch user");
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId) 
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,"All Tweets of you fetched successfully",tweets)
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(400,"tweetId not given");
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404,"Tweet with given id not found");
    }

    const {newContent} = req.body;

    if(!newContent){
        throw new ApiError(400,"Please provide new Content");
    }

    tweet.content = newContent;
    await tweet.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Tweet edited Successfully",tweet)
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(400,"tweetId not given");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Tweet Deleted Successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}