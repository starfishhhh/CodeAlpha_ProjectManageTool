const express = require("express");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add a comment to a task
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { text, taskId } = req.body;

        if (!text || !taskId) {
            return res.status(400).json({
                message: "Comment text and task are required"
            });
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findById(task.project);

        if (!project.members.includes(req.user.userId)) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const comment = await Comment.create({
            text,
            task: taskId,
            user: req.user.userId
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate("user", "name email");

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
});


// Get comments for a task
router.get("/task/:taskId", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findById(task.project);

        if (!project.members.includes(req.user.userId)) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const comments = await Comment.find({
            task: req.params.taskId
        })
        .populate("user", "name email")
        .sort({ createdAt: 1 });

        res.json(comments);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message
        });
    }
});

module.exports = router;
