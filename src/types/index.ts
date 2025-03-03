export type User = {
  id: string;
  email: string;
  role: 'citizen' | 'staff' | 'admin';
  name: string;
  phone?: string;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Application = {
  id: string;
  user_id: string;
  service_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  documents?: string[];
};