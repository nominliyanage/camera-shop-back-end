import {Request, Response} from "express";
import * as authService from '../services/auth.service';
import {sendEmail} from "../utils/email.util";

export const authenticateUser = async (req: Request, res: Response) => {
    const {username, password} = req.body;

    try{
    const authTokens = await authService.authenticateUser(username, password);

    if (!authTokens) {
        res.status(401).json({error: "Invalid credentials"});
        return;
    }

    // Send login notification email
    await sendEmail(
        authTokens.user.email,
        "Login Notification",
        `Hi ${authTokens.user.username}, you have successfully logged in.`,
        `<p>Hi <strong>${authTokens.user.username}</strong>, you have successfully logged in.</p>`
    );
    console.log(`Login email sent to ${authTokens.user.email}`);
    res.status(200).json(authTokens);
    } catch (error) {
        res.status(500).json({error: error instanceof Error ? error.message : "An unknown error occurred"});
    }
};

export const registerUser = async (req: Request, res: Response) => {
    const {username, password, role, email, image, status} = req.body;

    try {
        console.log("Registering user:", req.body);
        const result = await authService.registerUser(username, password, role, email, image, status);

        // Send welcome email
        await sendEmail(
            email,
            "Welcome to Our Platform",
            `Hi ${username}, welcome to our platform!`,
            `<p>Hi <strong>${username}</strong>, welcome to our platform!</p>`
        );
        console.log(`Welcome email sent to ${email}`);

        res.status(201).json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({error: error.message});
        } else {
            res.status(400).json({error: "An unknown error occurred"});
        }
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const {id} = req.params;
    const {email, username, role, image, oldPassword, newPassword, status} = req.body;

    try {
        console.log("Request body for updateUser:", req.body);
        console.log("Updating user with email:", email);
        const updatedUser = await authService.updateUser(id, email, username, role, image, oldPassword, newPassword, status);
        await sendEmail(
            email,
            "Profile Update Notification",
            `Hi ${username}, your profile has been successfully updated.`,
            `<p>Hi <strong>${username}</strong>, your profile has been successfully updated.</p>`
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({error: error instanceof Error ? error.message : "An unknown error occurred"});
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await authService.getAllUsers();
        console.log("Retrieved users:", users);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({error: error instanceof Error ? error.message : "An unknown error occurred"});
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    const {id} = req.params;
    console.log("Toggling user status for ID:", id);

    try {
        const user = await authService.getUserById(id);

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        if (!user.email) {
            return res.status(400).json({error: "User email is not defined"});
        }
        // Toggle user status
        const newStatus = user.status === "active" ? "inactive" : "active";
        const updatedUser = await authService.updateUserStatus(id, status);

        // Send email notification about status change
        await sendEmail(
            user.email,
            `Account ${newStatus === "active" ? "Activated" : "Deactivated"}`,
            `Your account status has been updated to ${newStatus}.`,
            `<p>Your account status has been updated to <strong>${newStatus}</strong>.</p>`
        );

        if (!updatedUser) {
            return res.status(500).json({error: "Failed to update user status"});
        }
        res.status(200).json({message: "User status updated successfully", status: updatedUser.status});
    } catch (error) {
        res.status(500).json({error: error instanceof Error ? error.message : "An unknown error occurred"});
    }
};

export const sendOtp = async (req: Request, res: Response) => {
    const {email} = req.body;

    try{
        await authService.sendOtp(email);
        res.status(200).json({message: "OTP sent successfully"});
    } catch (error) {
        res.status(500).json({error: error instanceof Error ? error.message : "An unknown error occurred"});
    }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
    const {email, otp, newPassword} = req.body;

    try {
        await authService.resetPasswordWithOtp(email, otp, newPassword);
        res.status(200).json({message: "Password reset successfully"});
    } catch (error) {
        res.status(500).json({error: error instanceof Error ? error.message : "An unknown error occurred"});
    }
};