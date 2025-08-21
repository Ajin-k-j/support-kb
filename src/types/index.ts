export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
}

export interface TicketData {
  id: string;
  title: string;
  supportDescription: string; // Rich text (plain for now, Tiptap later)
  customerDescription: string; // Rich text (plain for now)
  status: 'Open' | 'InProgress' | 'Pending' | 'Resolved' | 'Closed';
  businessImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  assignedTo?: string; // UID of assigned user
  createdAt: string; // ISO string for Firestore compatibility
  lastModified: string; // ISO string
  investigationLog: InvestigationEntry[];
}

export interface InvestigationEntry {
  type: 'Hypothesis' | 'Action' | 'Observation' | 'Communication';
  description: string; // Rich text (plain for now)
  timestamp: string; // ISO string
  userId: string;
}