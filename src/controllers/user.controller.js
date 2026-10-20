import prisma from "../config/db.js";

// 1. Create a user
export const createUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({
                success: false,
                message: "Fields are missing"
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists"
            });
        }

        const user = await prisma.user.create({
            data: {
                username,
                email
            }
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 2. Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();

        return res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 3. Get a user by ID
export const getUserById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 4. Update a user
export const updateUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { username, email } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (username || email) {
            const duplicateUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        ...(email ? [{ email }] : []),
                        ...(username ? [{ username }] : [])
                    ],
                    NOT: {
                        id
                    }
                }
            });

            if (duplicateUser) {
                return res.status(409).json({
                    success: false,
                    message: "Username or email already exists"
                });
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(username !== undefined && { username }),
                ...(email !== undefined && { email })
            }
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 5. Delete a user
export const deleteUser = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await prisma.user.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 6. Get all posts created by a user
export const getUserPosts = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const posts = await prisma.post.findMany({
            where: {
                authorId: id
            }
        });

        return res.status(200).json({
            success: true,
            data: posts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// 7. Get all posts liked by a user
export const getUserLikedPosts = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const likes = await prisma.like.findMany({
            where: {
                userId: id
            },
            include: {
                post: true
            }
        });

        const posts = likes.map(like => like.post);

        return res.status(200).json({
            success: true,
            data: posts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};