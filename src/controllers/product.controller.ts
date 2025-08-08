import {Request, Response} from "express";
import * as productService from '../services/product.service';
import {sendEmail} from "../utils/email.util";
import {getAdminEmails} from "../utils/user.util";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        console.log("Retrieved products:", products);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({message: 'Something went wrong!', error});
    }
}

export const saveProduct = async (req: Request, res: Response) => {
    try {
        const {name, price, currency, description, category, image} = req.body;

        // Validate required fields
        if (!name || !price || !currency || !description || !category || !image) {
            return res.status(400).json({error: "All fields are required"});
        }

        // Generate a unique ID for the product
        const id = await productService.generateUniqueId();

        // Create the product object
        const product = {id, name, price, currency, description, category, image};

        // Save the product to the database
        const savedProduct = await productService.saveProduct(product);

        // Fetch admin emails
        const adminEmails = await getAdminEmails();

        // Send email to all admins
        await sendEmail(
            adminEmails.join(','), // Join emails with commas
            "New Product Added",
            `A new product "${name}" has been added.`,
            `<p>A new product "<strong>${name}</strong>" has been added with a price of ${price} ${currency}.</p>`
        );

        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({message: "An unexpected error occurred"});
    }
};

export const getProduct = async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id)
    if (isNaN(productId)) {
        res.status(400).json({
            error: 'Invalid Product Id'
        });
        return;
    }
    const product = await productService.getProductById(productId);
    if (!product) {
        res.status(404).json({
            error: 'Product not found'
        });
        return;
    }
    res.status(200).json(product);
}

export const updateProduct = async (req: Request, res: Response) => {
    try{
        console.log(("Request received at updateProduct endpoint"));
        console.log("Update product request body:", req.body);

        const { id, ...updateData } = req.body

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        // call the service to update the product
        const updatedProduct = await productService.updateProduct(id, updateData);

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Fetch admin emails
        const adminEmails = await getAdminEmails();

        // Send email to all admins
        await sendEmail(
            adminEmails.join(','), // Join emails with commas
            "Product Updated",
            `The product "${updatedProduct.name}" has been updated.`,
            `<p>The product "<strong>${updatedProduct.name}</strong>" has been updated.</p>`
        );
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({error: "An unexpected error occurred"});
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const productId = req.params.id;

    if (!productId) {
        res.status(400).json({error: "Product ID is required"});
        return;
    }
    try {
        const deletedProduct = await productService.deleteProduct(productId);
        if (!deletedProduct) {
            res.status(404).json({error: 'Product not found'});
            return;
        }

        // Fetch admin emails
        const adminEmails = await getAdminEmails();

        // Send email to all admins
        await sendEmail(
            adminEmails.join(','), // Join emails with commas
            "Product Deleted",
            `The product with ID "${productId}" has been deleted.`,
            `<p>The product with ID "<strong>${productId}</strong>" has been deleted.</p>`
        );


        res.status(200).json({message: 'Product deleted successfully'});
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({message: "Error deleting product", error});
    }
};