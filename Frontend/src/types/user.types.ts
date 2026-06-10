export interface IUser {
  id: number;
  login: string;
  profileImg?: string;
  masterId?: number | null;
  role: 'master' | 'admin';
  isActive: boolean;
  name?: string;
}
