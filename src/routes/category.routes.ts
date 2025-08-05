import {Router} from "express";
import {saveCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory} from "../controllers/category.controller";
import {authorizeRoles} from "../middleware/auth.middleware";
import multer from "multer";
import {deleteAllCategories} from "../services/category.service";

const categoryRouter: Router = Router();
const storage = multer.diskStorage({});
const upload = multer({storage});
categoryRouter.get("/all", getAllCategories);
categoryRouter.post("/save", authorizeRoles("admin"), upload.single("image"), saveCategory);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/update/:id", authorizeRoles("admin"), upload.single("image"), updateCategory);
categoryRouter.delete("/delete/:id", authorizeRoles("admin"), deleteCategory);
categoryRouter.delete("/delete-all", authorizeRoles('admin'), async (req, res) => {
    try {
        await deleteAllCategories();
        res.status(200).json({message: "All categories deleted successfully."});
    } catch (error) {
        console.error("Error deleting all categories:", error);
        res.status(500).json({message: "Error deleting all categories", error});
    }
});

export default categoryRouter;