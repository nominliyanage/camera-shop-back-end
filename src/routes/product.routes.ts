import {Router} from "express";
import {deleteProduct, getAllProducts, getProduct, saveProduct, updateProduct} from "../controllers/product.controller";
import {authorizeRoles} from "../middleware/auth.middleware";
import multer from "multer";
import {deleteAllProducts} from "../services/product.service";

const productRouter: Router = Router();
const storage = multer.diskStorage({});
const upload = multer({ storage });

productRouter.get("/all", getAllProducts); // Get All Products
productRouter.post("/save", authorizeRoles('admin'), upload.single("image"), saveProduct); // Save Product
productRouter.get("/:id", getProduct); // Get Product by ID
productRouter.put("/update/:id", authorizeRoles('admin'), updateProduct); // Update Product
productRouter.delete("/delete/:id", authorizeRoles('admin'), deleteProduct); // Delete Product by ID
productRouter.delete("/delete-all", authorizeRoles('admin'), async (req, res) => {
    try {
        await deleteAllProducts(); // Call the service to delete all products
        res.status(200).json({ message: "All products deleted successfully." });
    } catch (error) {
        console.error("Error deleting all products:", error);
        res.status(500).json({ message: "Error deleting all products", error });
    }
});
export default productRouter;