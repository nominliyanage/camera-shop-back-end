import User from "../model/user.model";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {sendEmail} from "../utils/email.util";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const refreshTokens = new Set<string>();

export const registerUser = async (username: string, password: string, role: string, email: string, image: string, status: string) => {
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new Error("Username already exists");
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ username, password: hashedPassword, role, email, image, status });
        await newUser.save();
        return { message: "User registered successfully" };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "An unknown error occurred");
    }
};

export const authenticateUser = async (username: string, password: string) => {
    try {
        console.log(`Authenticating user: ${username}, Password: ${password.length > 0 ? "******" : "empty"}`);

        const existingUser = await User.findOne({ username }).select("username password role email image status");

        if (!existingUser) {
            throw new Error("User not found");
        }

        if (!existingUser.email) {
            throw new Error("User email is not available");
        }

        console.log("Retrieved user data:", existingUser);

        if (existingUser.status === "inactive") {
            throw new Error("You cannot log in. Admin has restricted your account.");
        }

        const isValidPassword = bcrypt.compareSync(password, existingUser.password);
        if (!isValidPassword) {
            throw new Error("Invalid password");
        }

        const accessToken = jwt.sign(
            { id: existingUser._id, username: existingUser.username, role: existingUser.role, email: existingUser.email, image: existingUser.image },
            JWT_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
            { username: existingUser.username},
            REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );
        refreshTokens.add(refreshToken);

        const response = {
            accessToken,
            refreshToken,
            user: {
                id: existingUser._id,
                username: existingUser.username,
                role: existingUser.role,
                email: existingUser.email,
                image: existingUser.image,
                status: existingUser.status
            },
            message: "User authenticated successfully, please save the tokens"
        };
        console.log("Authentication response:", response);
        return response;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "An unknown error occurred");
    }
};

export async function updateUser(
    id?: string,
    email?: string,
    username?: string,
    role?: string,
    image?: string,
    oldPassword?: string,
    newPassword?: string,
    status?: string
) {
    try {
        console.log("Role received:", role);

        const existingUser = await User.findById(id).select("username role email image password");

        if (!existingUser) {
            throw new Error("User not found");
        }

        if (oldPassword && newPassword) {
            const isValidOldPassword = bcrypt.compareSync(oldPassword, existingUser.password);
            if (!isValidOldPassword) {
                throw new Error("Old password is incorrect");
            }
            const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
            existingUser.password = hashedNewPassword;
        }

        if (email) existingUser.email = email;
        if (username) existingUser.username = username;
        if (role && (role === "admin" || role === "customer")) {
            existingUser.role = role;
        } else if (role) {
            throw new Error("Invalid role provided");
        }
        if (image) existingUser.image = image;
        if (status) {
            if (status !== "active" && status !== "inactive") {
                throw new Error("Invalid status value. Status must be 'active' or 'inactive'.");
            }
            existingUser.status = status;
        }

        await existingUser.save();

        return {
            userId: existingUser._id,
            username: existingUser.username,
            role: existingUser.role,
            email: existingUser.email,
            image: existingUser.image,
            status: existingUser.status || 'active' // Default to 'active' if status is not set
        };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "An unknown error occurred");
    }
}

export const getAllUsers = async () => {
    try {
        const users = await User.find().select("username role email image status");
        return users.map(user => ({
            userId: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            image: user.image,
            status: user.status
        }));
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "An unknown error occurred");
    }
};

export const updateUserStatus = async (id: string, status: string) => {
    return await User.findByIdAndUpdate(id, { status }, { new: true });
};

export async function getUserById(id: string) {
    try {
        const user = await User.findById(id).select("username role email image status");
        if (!user) {
            throw new Error("User not found");
        }
        return {
            userId: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            image: user.image,
            status: user.status
        };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "An unknown error occurred");
    }
}

export const sendOtp = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    // generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp; // Assuming you have an otp field in your User model
    user.otpExpiry = Date.now() + 300000; // 5 minutes expiry
    await user.save();

    if (!user.email) {
        throw new Error("User email is not available");
    }
     await sendEmail(user.email, "Your OTP Code", `Your OTP code is ${otp}. It is valid for 5 minutes.`);
};

export const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string) : Promise<void> => {
    const user = await User.findOne({ email});
    if (!user || user.otp !== otp ) {
        throw new Error("Invalid or expired OTP");
    }

    if(user.otpExpiry === undefined || user.otpExpiry === null || user.otpExpiry < Date.now()) {
        throw new Error("Invalid or expired OTP");
    }

    user.password = bcrypt.hashSync(newPassword, 10); // Hash the new password
    user.otp = undefined; // Clear OTP after successful reset
    user.otpExpiry = undefined; // Clear OTP expiry after successful reset
    await user.save();
}
