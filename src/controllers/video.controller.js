import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
//for duration


// Get all videos with pagination, filtering, sorting
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {};

    if (query) {
        // Search videos by title or description using regex case-insensitive
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }
        filter.owner = userId;
    }

    // Sorting object for mongoose
    const sortObj = {};
    sortObj[sortBy] = sortType === "desc" ? -1 : 1;

    const videos = await Video.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("owner", "username email");

    // Get total count for pagination
    const total = await Video.countDocuments(filter);

    res.json(new ApiResponse(200, { videos, total, page: Number(page), limit: Number(limit) }));
});

// Publish a new video: upload video and thumbnail, save metadata
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoFile = req.files.videoFile[0];
    const thumbnailFile = req.files.thumbnail[0];

    // Upload video to Cloudinary
    const videoUploadResult = await uploadOnCloudinary(videoFile.path, {
        resource_type: "video",
        folder: "vidtube/videos",
         use_filename: true,    //optional
    });
    

    //duration change
    

    // Upload thumbnail image to Cloudinary
    const thumbnailUploadResult = await uploadOnCloudinary(thumbnailFile.path, {
        folder: "thumbnails",
    });


    // Create new video document
    const newVideo = new Video({
        videoFile: videoUploadResult.secure_url,
        thumbnail: thumbnailUploadResult.secure_url,
        title,
        description,
        duration:5, // Optional: calculate actual duration if possible
        owner: userId,
    });

    await newVideo.save();

    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username email");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.json(new ApiResponse(200, video));
});

// Update video details: title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Optional: check if logged-in user is owner of video (authorization)
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    // Update fields if provided
    if (title) video.title = title;
    if (description) video.description = description;

    // If thumbnail file uploaded, upload new thumbnail and update URL
    if (req.file) {
        const thumbnailUploadResult = await uploadOnCloudinary(req.file.path, {
            folder: "thumbnails",
        });
        video.thumbnail = thumbnailUploadResult.secure_url;
    }

    await video.save();

    res.json(new ApiResponse(200, video, "Video updated successfully"));
});

// Delete a video by ID
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization check
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    await video.deleteOne();

    res.json(new ApiResponse(200, null, "Video deleted successfully"));
});

// Toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    video.isPublished = !video.isPublished;

    await video.save();

    res.json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
