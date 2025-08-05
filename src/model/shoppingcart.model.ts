import mongoose, {Schema, Document} from "mongoose";

export interface ShoppingCartItem {
    productId: string;
    quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    Name: string;
}

export interface ShoppingCart extends Document {
    userId: string;
    items: ShoppingCartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const ShoppingCartItemSchema = new Schema<ShoppingCartItem>({
    productId: {type: String, required: true},
    quantity: {type: Number, required: true},
    UnitPrice: {type: Number, required: true},
    TotalPrice: {type: Number, required: true},
    Name: {type: String, required: true},
});

const ShoppingCartSchema = new Schema<ShoppingCart>({
    userId: {type: String, required: true, unique: true},
    items: [ShoppingCartItemSchema],
});
export const ShoppingCartModel = mongoose.model<ShoppingCart>("ShoppingCart", ShoppingCartSchema);