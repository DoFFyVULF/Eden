export type tServices = {
  id: number;
  title: string;
  duration: number;
  price: number;
  img: string;
  categoryId?: number;
  isAppointment?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

export interface IService {
  id: number;
  title: string;
  description: string;
  duration: number;
  isActive: boolean;
  categoryId: number;
}
