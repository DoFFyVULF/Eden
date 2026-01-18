export interface IMaster {
  id: number;
  name: string;
  surname: string;
  middlename: string;
  specialization: string;
  photo: string;
  phone?: string;
  isActive?: boolean;

  services?: number[];
}