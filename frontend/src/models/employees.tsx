export type Employee = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'Seller' | 'Admin' | 'User';
  active: boolean;
  joinedAt?: string;
};
