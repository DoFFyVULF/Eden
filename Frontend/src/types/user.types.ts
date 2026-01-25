export interface IUser {
  id: number;
  login: string;
  profileImg?: string;
  masterId: number;
  role: 'master' | 'admin';
  isActive: boolean;
  name: string;
}
