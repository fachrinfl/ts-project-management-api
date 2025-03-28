import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  description: z.string().optional(),
  status: z.enum(['active', 'on_hold', 'completed']),
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
  teamEmails: z.array(z.string().email()).optional(),
});
