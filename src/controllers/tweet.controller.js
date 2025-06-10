import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //coming soon: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    // coming soon: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //coming soon: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //coming soon: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
