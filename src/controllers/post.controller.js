import prisma from "../config/db.js";

// 1. Create a post
export const createPost = async (req, res) => {
    try {
        const { caption, authorId } = req.body;

        if (!caption || !authorId) {
            return res.status(400).json({
                success: false,
                message: "Caption and authorId are required"
            });
        }

        // Find the user with id = authorId
        

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }

        // Create post
        

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 2. Get all posts with filtering, sorting and pagination
export const getPosts = async (req, res) => {
    try {
        const {
            q,
            authorId,
            likedByUserId,
            hasComments,
            sortBy,
            order,
            page,
            limit
        } = req.query;

        const where = {};

        // Search posts by caption
        if (q) {
            where.caption = {
                contains: q,
                mode: "insensitive"
            };
        }

        // Filter posts by author
        if (authorId) {
            where.authorId = Number(authorId);
        }

        // Find posts liked by a particular user
        if (likedByUserId) {
            where.likes = {
                some: {
                    userId: Number(likedByUserId)
                }
            };
        }

        // Find posts with or without comments
        if (hasComments === "true") {
            where.comments = {
                some: {}
            };
        }

        if (hasComments === "false") {
            where.comments = {
                none: {}
            };
        }

        const currentPage = Number(page) || 1;
        const pageSize = Number(limit) || 10;

        const allowedSortFields = ["id", "caption"];
        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : "id";

        const sortOrder = order === "asc" ? "asc" : "desc";

        const posts = await prisma.post.findMany({
            where,
            include: {
                author: true,
                comments: true,
                likes: true
            },
            orderBy: {
                [sortField]: sortOrder
            },
            skip: (currentPage - 1) * pageSize,
            take: pageSize
        });

        return res.status(200).json({
            success: true,
            page: currentPage,
            limit: pageSize,
            data: posts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 3. Get a single post by ID
export const getPostById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: true,
                comments: {
                    include: {
                        author: true
                    }
                },
                likes: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: post
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 4. Update a post
export const updatePost = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { caption } = req.body;

        const existingPost = await prisma.post.findUnique({
            where: { id }
        });

        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (caption === undefined) {
            return res.status(400).json({
                success: false,
                message: "Caption is required"
            });
        }

        const post = await prisma.post.update({
            where: { id },
            data: { caption }
        });

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: post
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 5. Delete a post
export const deletePost = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const post = await prisma.post.findUnique({
            where: { id }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        await prisma.post.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 6. Like a post
export const likePost = async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: Number(userId),
                    postId
                }
            }
        });

        if (existingLike) {
            return res.status(409).json({
                success: false,
                message: "Post is already liked by this user"
            });
        }

        const like = await prisma.like.create({
            data: {
                user: {
                    connect: {
                        id: Number(userId)
                    }
                },
                post: {
                    connect: {
                        id: postId
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: "Post liked successfully",
            data: like
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 7. Unlike a post
export const unlikePost = async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const userId = Number(req.params.userId);

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (!existingLike) {
            return res.status(404).json({
                success: false,
                message: "Like not found"
            });
        }

        await prisma.like.delete({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Post unliked successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};