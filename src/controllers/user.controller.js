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

        // Check for existing user
        

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists"
            });
        }

        // Create a new user
        

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
        // Find all users along with their posts
        

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

        // Find user with given id along with his/her posts
        

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

        // Find existing user with given id
        

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (username || email) {
            // Check if duplicate user (username or email but not id) exists
            

            if (duplicateUser) {
                return res.status(409).json({
                    success: false,
                    message: "Username or email already exists"
                });
            }
        }

        // Update user (conditional update if username or email any of them is in the body)
        

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

        // Find existing user with given id
        

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete user along with posts
        

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

        // Find existing user with given id
        

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find all the posts of the user
        

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

        // Find existing user with given id
        

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find all the posts liked by user
        

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