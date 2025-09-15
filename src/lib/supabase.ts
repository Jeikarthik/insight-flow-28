// Mock Supabase client for development
export function getSupabase() {
  return {
    auth: {
      signUp: async ({ email, password, options }: any) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { 
          data: { 
            user: { 
              id: '1', 
              email, 
              user_metadata: { full_name: options?.data?.full_name || 'Mock User' } 
            }
          }, 
          error: null 
        };
      },
      signInWithPassword: async ({ email, password }: any) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { 
          data: { 
            user: { 
              id: '1', 
              email, 
              user_metadata: { full_name: 'Mock User' } 
            }
          }, 
          error: null 
        };
      },
      signOut: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { error: null };
      },
      getSession: async () => {
        return { 
          data: { 
            session: { 
              user: { 
                id: '1', 
                email: 'user@example.com', 
                user_metadata: { full_name: 'Mock User' } 
              }
            } 
          }, 
          error: null 
        };
      },
      onAuthStateChange: (callback: Function) => {
        setTimeout(() => {
          callback('SIGNED_IN', { 
            user: { 
              id: '1', 
              email: 'user@example.com', 
              user_metadata: { full_name: 'Mock User' } 
            }
          });
        }, 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column?: string, value?: any) => ({ 
          single: () => ({
            data: { 
              id: '1', 
              email: 'user@example.com', 
              full_name: 'Mock User',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, 
            error: null 
          }),
          order: (column?: string, options?: any) => ({
            data: [],
            error: null
          }),
          data: [], 
          error: null 
        }),
        data: [], 
        error: null 
      }),
      insert: (data?: any) => ({ data: null, error: null }),
      update: (data?: any) => ({ eq: (column?: string, value?: any) => ({ data: null, error: null }) }),
      delete: () => ({ eq: (column?: string, value?: any) => ({ data: null, error: null }) }),
      upsert: (data?: any) => ({ data: null, error: null })
    })
  };
}

export function initSupabase() {
  return getSupabase();
}

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