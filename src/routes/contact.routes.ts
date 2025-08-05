import {Router} from "express";
import {getAllContacts, saveContact} from "../controllers/contact.controller";

const contactRouter = Router();

contactRouter.get("/all", getAllContacts); // Get all contacts
contactRouter.post("/save", saveContact); // Save contact (this should be a different controller method)
export default contactRouter;