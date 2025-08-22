export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
}

export interface TicketData {
  id: string;
  ticketNumber: string;
  title: string;
  // FIX: Made these fields optional to match the form validation schema.
  // This resolves the type mismatch when calling `createTicket`.
  supportDescription?: string;
  customerDescription?: string;
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
}