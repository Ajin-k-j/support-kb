import { z } from 'zod';

export const ticketSchema = z.object({
  ticketNumber: z.string().min(1, 'Ticket ID is required').regex(/^[a-zA-Z0-9]+$/, 'Ticket ID must be alphanumeric'),
  title: z.string().min(1, 'Title is required'),
  customerDescription: z.string().optional(),
  supportDescription: z.string().optional(),
  aiSummary: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Open', 'InProgress', 'Pending', 'Resolved', 'Closed']),
  businessImpact: z.enum(['Low', 'Medium', 'High', 'Critical']),
  supportingLinks: z.string().optional(),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
