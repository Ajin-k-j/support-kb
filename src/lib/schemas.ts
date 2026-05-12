import { z } from 'zod';

export const ticketSchema = z.object({
  ticketNumber: z.string().min(1, 'Ticket ID is required').regex(/^[a-zA-Z0-9-]+$/, 'Ticket ID must be alphanumeric or dash'),
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

export const kbSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  resolution: z.string().optional(),
  tags: z.string().optional(), // We'll split this by comma into an array later
});

export type KBFormValues = z.infer<typeof kbSchema>;

export const codeSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  language: z.string().min(1, 'Language is required'),
  useCase: z.string().optional(),
  tags: z.string().optional(),
});

export type CodeFormValues = z.infer<typeof codeSchema>;
