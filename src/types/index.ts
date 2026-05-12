export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean; // Keeping for backward compatibility temporarily
  role?: 'hduser' | 'admin' | null;
}

export interface TicketData {
  id: string;
  ticketNumber: string;
  title: string;
  supportDescription?: string;
  customerDescription?: string;
  aiSummary?: string;
  status: 'Open' | 'InProgress' | 'Pending' | 'Resolved' | 'Closed';
  businessImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  assignedTo?: string;
  assignedUsers: string[];
  supportingLinks: string[];
  createdAt: string;
  lastModified: string;
  investigationLog: InvestigationEntry[];
}

export interface InvestigationEntry {
  type: 'Hypothesis' | 'Action' | 'Observation' | 'Communication';
  description: string;
  timestamp: string;
  userId: string;
  userName?: string;
  userEmail?: string;
}

export interface KBData {
  id: string;
  subject: string;
  content: string;
  resolution?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: { uid: string; email: string; displayName: string };
}

export interface CodeSnippetData {
  id: string;
  subject: string;
  content: string;
  language: string;
  useCase?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: { uid: string; email: string; displayName: string };
}