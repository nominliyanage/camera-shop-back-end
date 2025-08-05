import {ShoppingCartItem, ShoppingCartModel} from "../model/shoppingcart.model";

export const getCartByUserId = async (userId: string) => {
    console.log("Fetching cart for user:", userId);
    return await ShoppingCartModel.findOne({ userId });
};

export const saveCart = async (userId: string, items: ShoppingCartItem[]) => {
    const cart = await ShoppingCartModel.findOneAndUpdate(
        { userId },
        { $set: { items } },
        { new: true, upsert: true } // Create a new cart if it doesn't exist
    );
    return cart;
};

export const createCart = async (cartData: { userId: string; items: ShoppingCartItem[] }) => {
    const cart = new ShoppingCartModel(cartData);
    return await cart.save();
};

export const clearCartByUserId = async (userId: string) => {
    return await ShoppingCartModel.deleteOne({ userId });
}