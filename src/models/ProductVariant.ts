import { Schema, model, models } from 'mongoose';

const ProductVariantSchema = new Schema({
  product:    { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku:        { type: String, required: true, unique: true },
  attributes: { type: Map, of: String },
  costPrice:  { type: Number, default: 0 },
  sellPrice:  { type: Number, default: 0 },
  unit:       { type: String, default: 'pièce' },
  barcode:    String,
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

ProductVariantSchema.index({ sku: 'text', barcode: 'text' });

export default models.ProductVariant || model('ProductVariant', ProductVariantSchema);