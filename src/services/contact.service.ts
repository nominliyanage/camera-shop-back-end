import Contact from '../model/contact.model';
import { ContactDto } from "../dto/contact.dto";

export const getAllContacts = async (): Promise<ContactDto[]> => {
    try {
        const contacts = await Contact.find();
        return contacts;
    } catch (error) {
        console.error("Error retrieving contacts:", error);
        throw new Error("Failed to retrieve contacts");
    }
};

export const saveContact = async (contact: ContactDto): Promise<ContactDto> => {
    try {
        console.log("Received contact data:", contact);
        // Validate the contact data
        const validationError = validateContact(contact);
        if (validationError) {
            throw new Error(validationError);
        }

        // Save the contact to the database
        const newContact = new Contact(contact);
        return await newContact.save();
    } catch (error) {
        console.error("Error saving contact:", error);
        throw new Error("Failed to save contact");
    }
};

// validate contact data
export const validateContact = (contact: ContactDto): string | null => {
    if (!contact.email || !contact.message) {
        return "Name, email, and message are required fields";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        return "Invalid email format";
    }
    return null;
};