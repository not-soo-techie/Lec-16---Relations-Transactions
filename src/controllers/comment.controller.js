import prisma from "../config/db.js";

// 1. Create a comment
export const createComment = async (req, res) => {
    try {
        const { content, authorId, postId } = req.body;

        if (!content || !authorId || !postId) {
            return res.status(400).json({
                success: false,
                message: "Content, authorId and postId are required"
            });
        }

        // Find user with given id
        

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find post with given id
        

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Add comment of given user under given post
        

        return res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: comment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 2. Get comments
// Optionally filter using ?postId=1
export const getComments = async (req, res) => {
    try {
        const { postId } = req.query;

        const where = {};

        if (postId) {
            where.postId = Number(postId);
        }

        // Find all comments, filter is optional
        

        return res.status(200).json({
            success: true,
            data: comments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 3. Update a comment
export const updateComment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });
        }

        // Find existing comment with given id
        

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Update comment with given id and content
        

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: comment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 4. Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Find existing comment with given id
        

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Delete comment with given id
        

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};