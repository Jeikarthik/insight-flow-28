import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size?: number;
  mime_type?: string;
  file_path: string;
  storage_bucket: string;
  status: 'uploaded' | 'processing' | 'ocr_complete' | 'classified' | 'completed' | 'failed';
  ocr_text?: string;
  ocr_confidence?: number;
  classification_id?: string;
  classification_confidence?: number;
  manual_classification: boolean;
  extracted_metadata: any;
  tags: string[];
  assigned_departments: string[];
  priority: number;
  deadline?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  document_classifications?: {
    name: string;
    color: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  task_type: 'review' | 'approval' | 'classification' | 'deadline' | 'custom';
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  assigned_by?: string;
  department_id?: string;
  document_id?: string;
  due_date?: string;
  reminder_sent: boolean;
  reminder_times: number[];
  completed_at?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  document_id?: string;
  task_id?: string;
  is_read: boolean;
  sent_via_email: boolean;
  sent_via_whatsapp: boolean;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: any;
  created_at: string;
}