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
            excludeCaption,
            authorUsername,
            excludeAuthorUsername,
            commentContains,
            everyCommentContains,
            sortBy,
            order,
            page,
            limit
        } = req.query;

        const where = {};
        const conditions = [];

        // 1. Search caption OR author's username
        if (q) {
            conditions.push({
                OR: [
                    {
                        caption: {
                            contains: q,
                            mode: "insensitive"
                        }
                    },
                    {
                        author: {
                            is: {
                                username: {
                                    contains: q,
                                    mode: "insensitive"
                                }
                            }
                        }
                    }
                ]
            });
        }

        // 2. Filter by author ID
        if (authorId) {
            conditions.push({
                authorId: Number(authorId)
            });
        }

        // 3. Filter by user who liked the post
        if (likedByUserId) {
            conditions.push({
                likes: {
                    some: {
                        userId: Number(likedByUserId)
                    }
                }
            });
        }

        // 4. Filter posts that have comments
        if (hasComments === "true") {
            conditions.push({
                comments: {
                    some: {}
                }
            });
        }

        // 5. Filter posts that have no comments
        if (hasComments === "false") {
            conditions.push({
                comments: {
                    none: {}
                }
            });
        }

        // 6. Exclude captions containing specific text
        if (excludeCaption) {
            conditions.push({
                NOT: {
                    caption: {
                        contains: excludeCaption,
                        mode: "insensitive"
                    }
                }
            });
        }

        // 7. Filter by author's username
        if (authorUsername) {
            conditions.push({
                author: {
                    is: {
                        username: {
                            equals: authorUsername,
                            mode: "insensitive"
                        }
                    }
                }
            });
        }

        // 8. Exclude posts by a particular username
        if (excludeAuthorUsername) {
            conditions.push({
                author: {
                    isNot: {
                        username: {
                            equals: excludeAuthorUsername,
                            mode: "insensitive"
                        }
                    }
                }
            });
        }

        // 9. Find posts with at least one matching comment
        if (commentContains) {
            conditions.push({
                comments: {
                    some: {
                        content: {
                            contains: commentContains,
                            mode: "insensitive"
                        }
                    }
                }
            });
        }

        // 10. Find posts where every comment matches
        if (everyCommentContains) {
            conditions.push({
                comments: {
                    every: {
                        content: {
                            contains: everyCommentContains,
                            mode: "insensitive"
                        }
                    }
                }
            });
        }

        // Apply all supplied conditions together
        if (conditions.length > 0) {
            where.AND = conditions;
        }

        // Pagination
        const currentPage = Number(page) || 1;
        const pageSize = Number(limit) || 10;

        if (
            !Number.isInteger(currentPage) ||
            !Number.isInteger(pageSize) ||
            currentPage < 1 ||
            pageSize < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit"
            });
        }

        // Sorting
        const allowedSortFields = ["id", "caption"];

        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : "id";

        const sortOrder = order === "asc" ? "asc" : "desc";

        // Find all posts with matching condition
        

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

        // Find a post with given id and should contain likes, author and comments as well
        

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

        // Find a post with given id
        

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

        // Update post with given id and caption
        

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

        // Find a post with given id
        

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Delete a post with given id
        

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

        // Find a post with given id
        

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Find a user with given id
        

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if like already exists
        

        if (existingLike) {
            return res.status(409).json({
                success: false,
                message: "Post is already liked by this user"
            });
        }

        // Create a new like with given user and post
        

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

        // Check if like already exists
        

        if (!existingLike) {
            return res.status(404).json({
                success: false,
                message: "Like not found"
            });
        }

        // Delete the existing like
        

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