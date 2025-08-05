import {Request, Response} from "express";
import * as contactService from "../services/contact.service";
export const getAllContacts = (req: Request, res: Response) => {
    try {
        const contacts = contactService.getAllContacts();
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error retrieving contacts:', error);
        res.status(500).json({message: 'Error retrieving contacts', error});
    }
};

export const saveContact = (req: Request, res: Response) => {
    console.log('Received contact data:', req.body);
    const contact = req.body;
    const validationError = contactService.validateContact(contact);
    if (validationError) {
        res.status(400).json({error: validationError});
        return;
    }
    try {
        const savedContact = contactService.saveContact(contact);
        res.status(201).json(savedContact);
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({message: 'Error saving contact', error});
    }
};