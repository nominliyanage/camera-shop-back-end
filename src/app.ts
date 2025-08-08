import express, {Express} from "express";
import productRoutes from "./routes/product.routes";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import {authenticateToken} from "./middleware/auth.middleware";
import categoryRoutes from "./routes/category.routes";
import path from "path";
import cloudinaryRoutes from "./routes/cloudinary.routes";
import paymentRoutes from "./routes/payment.routes";
import helmet from "helmet";
import contactRoutes from "./routes/contact.routes";
import cartRoutes from "./routes/cart.routes";

// 1. Initialize the express app
const app: Express = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://www.payhere.lk", "'unsafe-inline'"],
                connectSrc: ["'self'", "https://www.payhere.lk"],
                frameSrc: ["'self'", "https://www.payhere.lk"],
            },
        },
    })
);

const allowedOrigins = [
    "http://localhost:5173"
];

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const corsOptions = {
    origin: (origin: string | undefined,
             callback: (err: Error | null,
             allow?:boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes); // Contact route
app.use("/api/users/", authenticateToken, authRoutes); // Toggle user active status route
app.use("/api/auth/all", authenticateToken, authRoutes); // Get all users route
app.use("/api/auth/register", authRoutes); // Register user route
app.use("/api/auth/update", authenticateToken, authRoutes); // Update user route
app.use("/api/products", authenticateToken, productRoutes);
app.use("/api/categories", authenticateToken, categoryRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("api/payment", authenticateToken, paymentRoutes);
app.use("/api/cart", authenticateToken, cartRoutes);
app.use("/api/create-payment-intent", authenticateToken, paymentRoutes);
app.use("/api/auth/send-otp", authRoutes);
app.use("/api/auth/reset-password-with-otp", authRoutes);
app.use("/api/cloudinary", cloudinaryRoutes); // Cloudinary routes
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

export default app;