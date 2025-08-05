import mongoose,{ Document, Schema} from "mongoose";

interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    paymentId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: "PENDING" | "COMPLETED" | "FAILED";
    transactionId: string;
    createdAt: Date;
}

const paymentSchema: Schema<IPayment> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        validate: {
            validator: (value: string) => mongoose.Types.ObjectId.isValid(value),
            message: "Invalid User ID format",
        },
    },
    paymentId: {
        type: String,
        required: [true, "Payment ID is required"],
        unique: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be a positive number"],
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        trim: true,
        uppercase: true,
        default: "LKR",
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        trim: true,
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        trim: true,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED"],
            message: "Status must be one of 'PENDING', 'COMPLETED', or 'FAILED'",
        },
    },
    transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
export default Payment;