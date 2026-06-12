import { z } from 'zod';

export const movementItemSchema = z.object({
  variant:      z.string().min(1),
  quantity:     z.number().min(1),
  fromLocation: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  toLocation:   z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  unitCost:     z.number().optional(),
  batchNumber:  z.string().optional(),
  expiresAt:    z.string().optional(),
});

export const movementSchema = z.object({
  type:      z.enum(['entry', 'exit', 'transfer', 'adjustment', 'return', 'loss']),
  reference: z.string().optional(),
  notes:     z.string().optional(),
  date:      z.string().optional(),
  items:     z.array(movementItemSchema).min(1, 'Au moins un article requis'),
});

export type MovementInput     = z.infer<typeof movementSchema>;
export type MovementItemInput = z.infer<typeof movementItemSchema>;