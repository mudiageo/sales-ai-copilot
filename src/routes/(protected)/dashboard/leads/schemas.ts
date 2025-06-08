import { z } from "zod";

export const leadSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  title: z.string(),
  leadScore: z.number().min(0).max(100),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation']),
  lastActivity: z.string(),
  assignedRep: z.string(),
});

export type Lead = z.infer<typeof leadSchema>;