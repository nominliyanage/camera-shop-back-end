import {ProductDto} from "../dto/product.dto";
import Product from "../model/product.model";
import {v4 as uuidv4} from "uuid";
import mongoose from "mongoose";
import Category from "../model/category.model";

export const getAllProducts = async ()=> {
    try {
        const products = await Product.find({ id: { $regex: /^PROD/, $options: "i" } })
            .populate("category", "name")
            .lean();

        return products.map(product => ({
            id: product.id || '',
            name: product.name || '',
            price: product.price || 0,
            currency: product.currency || '',
            image: product.image || '',
            description: product.description || '',
            category: (product.category as any)?.name || 'Unknown Category',
        }));
    } catch (error) {
        console.error("Error retrieving products:", error);
        throw error;
    }
};

export const saveProduct = async (product: { id: string; name: string; price: number; currency: string; description: string; image: string; category: string }) => {
    try {
        console.log("Saving product:", product);

        // Check if the `id` already exists
        const existingProduct = await Product.findOne({ id: product.id }).lean();
        if (existingProduct) {
            throw new Error(`Product with id "${product.id}" already exists`);
        }

        // Check if the category is a valid ObjectId
        const category = mongoose.isValidObjectId(product.category)
            ? await Category.findById(product.category).lean()
            : await Category.findOne({ name: product.category }).lean();

        if (!category) {
            throw new Error(`Category "${product.category}" not found`);
        }

        // Replace the category with its ObjectId
        const savedProduct = await Product.create({
            ...product,
            category: category._id,
        });

        return savedProduct;
    } catch (error) {
        console.error("Error saving product:", error);
        throw error;
    }
};

export const getProductById = async (id: number): Promise<ProductDto | null> => {
    const product = await Product.findOne({ id }).populate("category", "name").lean();
    if (!product) return null;
    return {
        id: product.id || '',
        name: product.name,
        price: product.price,
        currency: product.currency,
        image: product.image,
        description: product.description || '',
        category: (product.category as any)?.name || '',
    };
};

export const updateProduct = async (productId: string, productData: Partial<ProductDto>)=> {
    try {
        //resolve the category to its ObjectId
        const category = mongoose.isValidObjectId(productData.category)
        ? productData.category // if it's already an ObjectId, use it directly
        : await Category.findOne({ name: productData.category }).lean();

        if (!category || typeof category === "string") {
            throw new Error(`Category "${productData.category}" not found or invalid`);
        }

        // Update the product with the new data
        const updatedProduct = await Product.findOneAndUpdate(
            { id: productId }, // Use the custom `id` field
            {...productData, category: category._id}, // Use the ObjectId of the category},
            { new: true} // Return the updated document
        );

        if (!updatedProduct) {
            throw new Error(`Product with id "${productId}" not found`);
        }

        return updatedProduct;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
    try {
        const result = await Product.deleteOne({ id });
        return result.deletedCount > 0; // Return true if a product was deleted
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error; // rethrow the error to be handled by the caller
    }
};

export const validateProduct = (product: ProductDto): string | null => {
    if (!product.id || !product.name || !product.price || !product.currency || !product.image || !product.description) {
        return "Product ID, name, price, and currency are required.";
    }
    return null; // No validation errors
};

export const generateUniqueId = async (): Promise<string> => {
    // find all products and extract their IDs
    const products = await Product.find({ id: { $regex: /^PROD\d+$/ } }).lean();

    let lastIdNumber = 0;

    if (products.length > 0) {
        // Extract numeric parts of IDs and find the highest number
        const numericIds = products.map(product => {
            const numericPart = product.id.replace("PROD", "");
            return parseInt(numericPart, 10) || 0;
        });
        lastIdNumber = Math.max(...numericIds);
    }

    // Increment the last ID number and generate a new ID
    const newIdNumber = lastIdNumber + 1;

    // Format the new ID as "PROD<number>"
    const uniqueId = `PROD${newIdNumber}`;

    return uniqueId;
};

export const deleteAllProducts = async (): Promise<void> => {
    try {
        const result = await Product.deleteMany({});
        console.log(`Deleted ${result.deletedCount} products from the database.`);
    } catch (error) {
        console.error("Error deleting all products:", error);
        throw error; // Rethrow the error for the caller to handle
    }
}