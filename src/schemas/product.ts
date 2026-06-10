import { z } from 'zod';

export const productSchema = z.object({
  name:        z.string().min(1, 'Nom requis'),
  sku:         z.string().min(1, 'SKU requis'),
  description: z.string().optional(),
  category:    z.string().min(1, 'Catégorie requise'),
  supplier:    z.string().optional(),
  type:        z.enum(['physical', 'raw_material', 'equipment']),
  tags:        z.array(z.string()).optional(),
  imageUrls:   z.array(z.string()).optional(),
  isActive:    z.boolean().optional(),
});

export const productVariantSchema = z.object({
  sku:        z.string().min(1, 'SKU requis'),
  attributes: z.record(z.string(), z.string()).optional(),
  costPrice:  z.number().min(0).optional(),
  sellPrice:  z.number().min(0).optional(),
  unit:       z.string().optional(),
  barcode:    z.string().optional(),
  isActive:   z.boolean().optional(),
});

export type ProductInput        = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;