import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    // Get all comments for a video
    // 🛠️ Implementation coming soon
    res.status(501).json(new ApiResponse(501, null, "getVideoComments: Coming soon"))
})

const addComment = asyncHandler(async (req, res) => {
    // 🛠️ Add a comment to a video - Coming soon
    res.status(501).json(new ApiResponse(501, null, "addComment: Coming soon"))
})

const updateComment = asyncHandler(async (req, res) => {
    // 🛠️ Update a comment - Coming soon
    res.status(501).json(new ApiResponse(501, null, "updateComment: Coming soon"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // 🛠️ Delete a comment - Coming soon
    res.status(501).json(new ApiResponse(501, null, "deleteComment: Coming soon"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
