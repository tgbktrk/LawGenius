export interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  role: string;
  isPremium: boolean;
}