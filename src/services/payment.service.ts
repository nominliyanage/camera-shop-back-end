import paymentModel from "../model/payment.model";
import mongoose from "mongoose";

export const savePayment = async (paymentData: any) => {
    try {
        console.log("Saving payment data:", paymentData);

        // Validate and convert userId to ObjectId
        if (mongoose.Types.ObjectId.isValid(paymentData.userId)) {
            paymentData.userId = new mongoose.Types.ObjectId(paymentData.userId);
        } else if (typeof paymentData.userId === 'string' && paymentData.userId.length === 24) {
            // If userId is a string of 24 characters, assume it's a valid ObjectId
            paymentData.userId = new mongoose.Types.ObjectId(paymentData.userId);
        } else {
            throw new Error(`Invalid User ID format: ${paymentData.userId}`);
        }

        // Create and save the payment document
        const payment = new paymentModel(paymentData);
        return await payment.save();

    } catch (error) {
        console.error("Error saving payment:", error);
        throw error;
    }
};

export const getAllPayments = async () => {
    try {
        const payments = await paymentModel.find().populate("userId", "name email").lean();
        return payments.map(payment => ({
            ...payment,
            createdAt: payment.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error("Error retrieving payments:", error);
        throw error;
    }
};