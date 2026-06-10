import { Schema, model, models } from 'mongoose';

const WarehouseLocationSchema = new Schema({
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  code:      { type: String, required: true },
  name:      String,
  type:      { type: String, enum: ['zone', 'aisle', 'shelf', 'bin'], default: 'bin' },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

WarehouseLocationSchema.index({ warehouse: 1, code: 1 }, { unique: true });

export default models.WarehouseLocation || model('WarehouseLocation', WarehouseLocationSchema);