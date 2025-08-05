export interface ShoppingcartDto{
    userId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}