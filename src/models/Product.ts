import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  name:        { type: String, required: true },
  sku:         { type: String, required: true, unique: true },
  description: String,
  category:    { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  supplier:    { type: Schema.Types.ObjectId, ref: 'Supplier' },
  type:        { type: String, enum: ['physical', 'raw_material', 'equipment'], required: true },
  tags:        [String],
  imageUrls:   [String],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

ProductSchema.index({ name: 'text', sku: 'text' });

export default models.Product || model('Product', ProductSchema);