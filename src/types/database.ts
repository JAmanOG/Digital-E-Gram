export type Profile = {
  id: string;
  name: string;
  email?: string;
  role: 'citizen' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  documents_required?: string[];
  fee?: number;
  processing_time?: string;
  created_at: string;
};

export type Application = {
  id: string;
  user_id: string;
  service_id: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  documents?: string[];
  created_at: string;
  updated_at: string;
  service?: Service;
};

export type Document = {
  id: string;
  application_id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type?: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          name: string;
          email?: string;
          role?: 'citizen' | 'staff' | 'admin';
          phone?: string;
          address?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'citizen' | 'staff' | 'admin';
          phone?: string;
          address?: string;
          created_at?: string;
        };
      };
      services: {
        Row: Service;
        Insert: {
          id?: string;
          name: string;
          description: string;
          documents_required?: string[];
          fee?: number;
          processing_time?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          documents_required?: string[];
          fee?: number;
          processing_time?: string;
          created_at?: string;
        };
      };
      applications: {
        Row: Application;
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
          notes?: string;
          documents?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string;
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
          notes?: string;
          documents?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: Document;
        Insert: {
          id?: string;
          application_id: string;
          user_id: string;
          name: string;
          file_path: string;
          file_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          user_id?: string;
          name?: string;
          file_path?: string;
          file_type?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: Notification;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}