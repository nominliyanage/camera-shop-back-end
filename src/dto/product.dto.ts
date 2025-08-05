export interface ProductDto {
    id: string;
    name: string;
    price: number;
    currency: string;
    image: string;
    description: string | null | undefined;
    category: string;
}