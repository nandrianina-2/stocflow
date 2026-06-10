import { z } from 'zod';

export const warehouseSchema = z.object({
  name:     z.string().min(1, 'Nom requis'),
  code:     z.string().min(1, 'Code requis').toUpperCase(),
  address:  z.string().optional(),
  isActive: z.boolean().optional(),
});

export const warehouseLocationSchema = z.object({
  code: z.string().min(1, 'Code requis'),
  name: z.string().optional(),
  type: z.enum(['zone', 'aisle', 'shelf', 'bin']).optional(),
});

export type WarehouseInput         = z.infer<typeof warehouseSchema>;
export type WarehouseLocationInput = z.infer<typeof warehouseLocationSchema>;