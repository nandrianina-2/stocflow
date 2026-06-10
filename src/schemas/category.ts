import { z } from 'zod';

export const categorySchema = z.object({
  name:   z.string().min(1, 'Nom requis'),
  slug:   z.string().min(1, 'Slug requis').regex(/^[a-z0-9-]+$/, 'Slug invalide (minuscules, chiffres, tirets)'),
  parent: z.string().nullable().optional(),
  image:  z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;