import {Router} from "express";
import {authenticateUser, registerUser, updateUser, getAllUsers, toggleUserStatus, sendOtp, resetPasswordWithOtp} from "../controllers/auth.controller";
const authRouter: Router = Router();

authRouter.post("/login", authenticateUser);
authRouter.post("/register", registerUser); // Register user route
authRouter.put("/update/:id", updateUser); // Update user route
authRouter.get("/all", getAllUsers); // Get all users route
authRouter.post("/:id/toggle-active", (req, res, next) =>{
    console.log("Route hit for toggling user status");
    next();
},toggleUserStatus); // Toggle user active status route
authRouter.post("/send-otp", sendOtp); // Send OTP route
authRouter.post("/reset-password-with-otp", resetPasswordWithOtp); // Reset password with OTP route


export default authRouter;