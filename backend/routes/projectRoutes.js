const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a project
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        const project = await Project.create({
            name,
            description,
            owner: req.user.userId,
            members: [req.user.userId]
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create project",
            error: error.message
        });
    }
});


// Get user's projects
router.get("/", authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({
            members: req.user.userId
        })
        .populate("owner", "name email")
        .populate("members", "name email");

        res.json(projects);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch projects",
            error: error.message
        });
    }
});


// Add a member to a project
router.post("/:projectId/members", authMiddleware, async (req, res) => {
    try {
        const { email } = req.body;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Only the project owner can add members"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (project.members.includes(user._id)) {
            return res.status(400).json({
                message: "User is already a member"
            });
        }

        project.members.push(user._id);
        await project.save();

        res.json({
            message: "Member added successfully",
            project
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add member",
            error: error.message
        });
    }
});

module.exports = router;
