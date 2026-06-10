import { Schema, model, models } from 'mongoose';

const PurchaseOrderSchema = new Schema({
  supplier:    { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse:   { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status:      { type: String, enum: ['draft', 'sent', 'partial', 'received', 'cancelled'], default: 'draft' },
  reference:   String,
  supplierRef: String,
  expectedAt:  Date,
  receivedAt:  Date,
  notes:       String,
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default models.PurchaseOrder || model('PurchaseOrder', PurchaseOrderSchema);