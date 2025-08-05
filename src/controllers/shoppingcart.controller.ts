import {Request, Response} from "express";
import * as cartService from "../services/cart.service";
import {ShoppingCartItem} from "../model/shoppingcart.model";

interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export const addToCart = async (req: Request, res: Response) => {
    console.log("Adding to cart for user:", req.params.userId, "with body:", req.body);
    try {
        const {userId} = req.params;
        const {productId, quantity, UnitPrice, TotalPrice, Name} = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({error: "Product ID and quantity are required"});
        }

        const cart = await cartService.getCartByUserId(userId);
        console.log("Current cart for user:", userId, "is:", cart);
        const items = cart ? cart.items : [];

        const itemIndex = items.findIndex((item: ShoppingCartItem) => item.productId === productId);
        if (itemIndex > -1) {
            // Update the existing item's quantity by 1
            items[itemIndex].quantity += quantity > 0 ? 1 : -1; // Increment or decrement by 1
            if (items[itemIndex].quantity < 1) {
                items[itemIndex].quantity = 1; // Ensure quantity is at least 1
            }
            console.log(`Updated quantity for product ${productId} to ${items[itemIndex].quantity}`);
            items[itemIndex].TotalPrice = items[itemIndex].UnitPrice * items[itemIndex].quantity;
            console.log(`Updated total price for product ${productId} to ${items[itemIndex].TotalPrice}`);
        } else {
            // Add a new item with quantity 1
            items.push({productId, quantity: 1, UnitPrice, TotalPrice: UnitPrice, Name});
        }
        console.log("Items after addition:", items);
        const updatedCart = await cartService.saveCart(userId, items);
        console.log("Updated cart for user:", userId, "is:", updatedCart);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({message: "Error adding to cart", error});
    }
};

export const updateCartItem = async (req: Request, res: Response) => {
    console.log("Updating cart item for user:", req.params.userId, "with body:", req.body);
    try {
        const {userId} = req.params;
        const {productId, quantity} = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({error: "Product ID and quantity are required"});
        }

        const cart = await cartService.getCartByUserId(userId);
        if (cart) {
            const item = cart.items.find((item: any) => item.productId === productId);
            if (item) {
                item.quantity = quantity;
                item.TotalPrice = item.UnitPrice * quantity; // Update total price based on new quantity
                const updatedCart = await cartService.saveCart(userId, cart.items);
                return res.status(200).json(updatedCart);
            } else {
                res.status(404).json({message: "Item not found in cart"});
            }
        } else {
            res.status(404).json({message: "Cart not found"});
        }
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({message: "Error updating cart item", error});
    }
};

export const deleteCartItem = async (req: Request, res: Response) => {
    try{
        const { userId, productId } = req.params;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const cart = await cartService.getCartByUserId(userId);

        if (cart){
            const updatedItems = cart.items.filter((item: ShoppingCartItem) => item.productId !== productId);
            const updatedCart = await cartService.saveCart(userId, updatedItems);
            return res.status(200).json(updatedCart);
        }

        res.status(404).json({ error: "Cart not found" });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({ message: "Error deleting cart item", error });
    }
};

export const clearCart = async (req: Request, res: Response) => {
    try{
        const { userId } = req.params;
        await cartService.clearCartByUserId(userId);
        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Error clearing cart", error });
    }
};

export const getCart = async (req: Request, res: Response) => {
    try {
        console.log("Retrieving cart for user:", req.params.userId);
        const { userId } = req.params;
        const cart = await cartService.getCartByUserId(userId);
        console.log("Cart retrieved:", cart);
        res.status(200).json(cart || { userId, items: [] });
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).json({ message: "Error retrieving cart", error });
    }
};