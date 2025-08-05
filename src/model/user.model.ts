import mongoose, {Schema} from "mongoose";
import { v4 as uuidv4 } from "uuid";

const UserModel = new mongoose.Schema(
    {
        "id": {
            required: true, // like not null
            type: String,
            default: uuidv4, // No Sql(Mongo Db) type is not String, sql varchar
            unique: true, // unique key constraint
            index: true // for better performance
        },
        "username": {
            required: true,
            type: String,
            unique: true, // unique username
            trim: true // remove extra spaces
        },
        "password": {
            required: true,
            type: String
        },
        "role": {
            required: true,
            type: String,
            enum: ["admin", "customer"], // allowed roles
            default: "customer"
        },
        "email": {
            type: String,
            trim: true,
            lowercase: true, // convert to lowercase
            unique: true, // unique email
            sparse: true // Allow multiple null values
        },
        "image": {
            type: String,
            trim: true // remove extra spaces
        },
        "status": {
            type: String,
            enum: ["active", "inactive"], // allowed statuses
            default: "active" // default status
        },
        "otp": {
            type: String
        },
        "otpExpiry": {
            type: Number
        }
    }
);

const User = mongoose.model('User', UserModel);
export default User;