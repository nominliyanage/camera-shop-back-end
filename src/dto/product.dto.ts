export interface ProductDto {
    id: number;
    name: string;
    price: number;
    currency: string;
    image: string;
    description?: string | null;
    category?: string;
}