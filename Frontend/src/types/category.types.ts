export interface ICategory {
    id: number;
    title: string;
    description: string;
    isActive: boolean;


    _count?: {
        services: number;
    }
}