import mongoose, {Schema} from "mongoose";

const ProductModel = new mongoose.Schema({
    "id": {
        required: true, // like not null
        type: String,
        unique: true, // Unique key constraint
        index: true // For better performance
    },
    "name": {
        required: true,
        type: String
    },
    "price": {
        required: true,
        type: Number
    },
    "currency": {
        required: true,
        type: String
    },
    "image": {
        required: true,
        type: String
    },
    "description": {
        type: String
    },
    "category": {
        type: Schema.Types.ObjectId, // Reference to the Category model
        ref: "Category", // Name of the Category model
        required: true,
    }
});

const Product = mongoose.model('Product', ProductModel);
export default Product;