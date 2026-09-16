const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Create a task
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, projectId, assignedTo } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({
                message: "Title and project are required"
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project.members.includes(req.user.userId)) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        if (assignedTo && !project.members.includes(assignedTo)) {
            return res.status(400).json({
                message: "Assigned user is not a project member"
            });
        }

        const task = await Task.create({
            title,
            description,
            project: projectId,
            assignedTo: assignedTo || null
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task",
            error: error.message
        });
    }
});


// Get tasks for a project
router.get("/project/:projectId", authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project.members.includes(req.user.userId)) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        const tasks = await Task.find({
            project: req.params.projectId
        }).populate("assignedTo", "name email");

        res.json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
});


// Update task status
router.put("/:taskId/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "To Do",
            "In Progress",
            "Done"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

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

        task.status = status;
        await task.save();

        res.json({
            message: "Task status updated",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task",
            error: error.message
        });
    }
});


// Assign task to a user
router.put("/:taskId/assign", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body;

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

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!project.members.includes(userId)) {
            return res.status(400).json({
                message: "User is not a project member"
            });
        }

        task.assignedTo = userId;
        await task.save();

        res.json({
            message: "Task assigned successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to assign task",
            error: error.message
        });
    }
});


module.exports = router;
