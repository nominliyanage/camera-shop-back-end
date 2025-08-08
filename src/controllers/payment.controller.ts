import * as paymentService from '../services/payment.service';
import { Request, Response } from 'express';
import crypto from "crypto";
import Stripe from "stripe";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from "../utils/email.util";

const stripe = new Stripe("sk_test_51R6ZgFKiBxldEfFSDQhuZZlyZufTUH4ua3pqx4P8XTx746kQN4ufxX4GWZZ8YSehmDhVV6ULYuS9apUtmcdJHhwR00LMZq0lIJ", );

export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const { amount, currency, paymentMethod, status, userId, createdAt, email } = req.body;

        if (!amount || !currency || !paymentMethod || !status || !userId || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid User ID format" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            payment_method_types: [paymentMethod],
        });

        const charges = await stripe.charges.list({ payment_intent: paymentIntent.id });
        const paymentId = charges.data.length > 0 ? charges.data[0].id : uuidv4(); // Generate a unique fallback ID

        const paymentData = {
            amount,
            currency,
            paymentMethod,
            status,
            transactionId: paymentIntent.id,
            paymentId,
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            paymentIntentId: paymentIntent.id,
            email // Include user email for confirmation
        };

        await paymentService.savePayment(paymentData);

        // Send email after successful payment
        await sendEmail(
            email,
            "Payment Confirmation",
            `Your payment of ${amount} ${currency} was successful.`,
            `<p>Dear user,</p><p>Your payment of <strong>${amount} ${currency}</strong> was successful. Thank you for your purchase!</p>`
        );

        res.status(200).json({
            message: "Payment saved successfully",
            clientSecret: paymentIntent.client_secret,
            transactionId: paymentIntent.id,
            paymentId,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ message: "Error creating payment intent", error });
    }
};

export const getAllPayments = async (req: Request, res: Response) => {
    try {
        const payments = await paymentService.getAllPayments();
        console.log("Retrieved payments:", payments);
        res.status(200).json(payments);
    } catch (error) {
        console.error("Error retrieving payments:", error);
        res.status(500).json({ message: "Error retrieving payments"});
    }
};