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

        const user = await prisma.user.findUnique({
            where: {
                id: Number(authorId)
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const post = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                author: {
                    connect: {
                        id: Number(authorId)
                    }
                },
                post: {
                    connect: {
                        id: Number(postId)
                    }
                }
            },
            include: {
                author: true,
                post: true
            }
        });

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

        const comments = await prisma.comment.findMany({
            where,
            include: {
                author: true,
                post: true
            },
            orderBy: {
                id: "desc"
            }
        });

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

        const existingComment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const comment = await prisma.comment.update({
            where: { id },
            data: { content }
        });

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

        const existingComment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        await prisma.comment.delete({
            where: { id }
        });

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