import { z } from 'zod';
export const GoogleProfileSchema = z.object({
  id: z.string(),
  emails: z.array(
    z.object({
      value: z.string().email(),
    }),
  ),
});
export type GoogleProfile = z.infer<typeof GoogleProfileSchema>;
