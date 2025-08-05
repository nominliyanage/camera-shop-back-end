import {Router} from "express";
import {authorizeRoles} from "../middleware/auth.middleware";
import {getAllPayments, createPaymentIntent} from "../controllers/payment.controller";

const paymentRouter = Router();

paymentRouter.get("/all", authorizeRoles('admin'), getAllPayments); // Get all payments
paymentRouter.post("/create-payment-intent", authorizeRoles('customer'), createPaymentIntent); // Create payment intent
export default paymentRouter;