import { Schema, model, models } from 'mongoose';

const WarehouseSchema = new Schema({
  name:     { type: String, required: true },
  code:     { type: String, required: true, unique: true },
  address:  String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default models.Warehouse || model('Warehouse', WarehouseSchema);