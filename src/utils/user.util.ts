import User from '../model/user.model';

export const getAdminEmails = async (): Promise<string[]> => {
    try {
        const admins = await User.find({ role: 'admin' }).select('email').lean();
        return admins
            .map(admin => admin.email)
            .filter((email): email is string => !!email); // Ensure only valid strings
    } catch (error) {
        console.error('Error fetching admin emails:', error);
        throw new Error('Failed to fetch admin emails');
    }
};