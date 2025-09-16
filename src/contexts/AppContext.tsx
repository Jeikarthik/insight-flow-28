import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  type: 'document-processing' | 'review' | 'analysis';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'processed' | 'processing';
  tags: string[];
}

interface AppContextType {
  tasks: Task[];
  documents: Document[];
  addTask: (task: Omit<Task, 'id'>) => void;
  addDocument: (document: Omit<Document, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Review Medical Contract Terms",
    description: "Analyze legal terms and compliance requirements for the new medical services contract",
    priority: "high",
    dueDate: "2024-01-15",
    assignee: "Legal Team",
    status: "pending",
    type: "review"
  },
  {
    id: "2",
    title: "Process Insurance Claims Batch",
    description: "Extract and validate information from 47 insurance claim documents",
    priority: "medium",
    dueDate: "2024-01-12",
    assignee: "Claims Team",
    status: "in-progress",
    type: "document-processing"
  },
  {
    id: "3",
    title: "Financial Report Analysis",
    description: "Generate insights and summaries from Q4 financial documents",
    priority: "high",
    dueDate: "2024-01-18",
    assignee: "Finance Team",
    status: "pending",
    type: "analysis"
  }
];

const initialDocuments: Document[] = [
  {
    id: "1",
    name: "Contract_Q4_2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadDate: "2024-01-10",
    status: "processed",
    tags: ["contract", "legal"]
  },
  {
    id: "2", 
    name: "Medical_Records_Batch_847.docx",
    type: "DOCX",
    size: "1.8 MB",
    uploadDate: "2024-01-09",
    status: "processing",
    tags: ["medical", "records"]
  },
  {
    id: "3",
    name: "Invoice_January_2024.xlsx",
    type: "XLSX", 
    size: "856 KB",
    uploadDate: "2024-01-08",
    status: "processed",
    tags: ["finance", "invoice"]
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addDocument = (docData: Omit<Document, 'id'>) => {
    const newDocument: Document = {
      ...docData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setDocuments(prev => [newDocument, ...prev]);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  return (
    <AppContext.Provider value={{ 
      tasks, 
      documents, 
      addTask, 
      addDocument, 
      updateTaskStatus 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}