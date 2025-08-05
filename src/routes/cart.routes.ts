import express from "express";
import { getCart, addToCart, updateCartItem, deleteCartItem, clearCart } from "../controllers/shoppingcart.controller";

const router = express.Router();

router.get("/:userId/get", getCart); // Get cart for a user
router.post("/:userId/save", addToCart); // Add item to cart
router.put("/:userId/update", updateCartItem); // Update item quantity
router.delete("/:userId/:productId/delete", deleteCartItem); // Remove item from cart
router.delete("/:userId/clear", clearCart); // Clear cart after payment

export default router;