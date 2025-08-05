export interface PaymentDto{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    transactionId: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
    userId: string; // Assuming the payment is associated with a user
}