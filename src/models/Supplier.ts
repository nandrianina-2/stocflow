import { Schema, model, models } from 'mongoose';

const SupplierSchema = new Schema({
  name:    { type: String, required: true },
  email:   String,
  phone:   String,
  address: String,
  notes:   String,
}, { timestamps: true });

export default models.Supplier || model('Supplier', SupplierSchema);