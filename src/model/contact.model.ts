import mongoose from "mongoose";
const ContactModel = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    }
});
const Contact = mongoose.model('Contact', ContactModel);
export default Contact;