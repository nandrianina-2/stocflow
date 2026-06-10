import { z } from 'zod';

export const purchaseOrderItemSchema = z.object({
  variant:         z.string().min(1),
  quantityOrdered: z.number().min(1),
  unitPrice:       z.number().min(0),
});

export const purchaseOrderSchema = z.object({
  supplier:    z.string().min(1, 'Fournisseur requis'),
  warehouse:   z.string().min(1, 'Entrepôt requis'),
  reference:   z.string().optional(),
  supplierRef: z.string().optional(),
  expectedAt:  z.string().optional(),
  notes:       z.string().optional(),
  items:       z.array(purchaseOrderItemSchema).min(1, 'Au moins un article requis'),
});

export type PurchaseOrderInput     = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>;