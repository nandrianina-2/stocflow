import { z } from 'zod';

export const supplierSchema = z.object({
  name:    z.string().min(1, 'Nom requis'),
  email:   z.string().email('Email invalide').optional().or(z.literal('')),
  phone:   z.string().optional(),
  address: z.string().optional(),
  notes:   z.string().optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;