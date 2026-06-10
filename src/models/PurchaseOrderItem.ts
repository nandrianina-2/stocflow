import { Schema, model, models } from 'mongoose';

const PurchaseOrderItemSchema = new Schema({
  order:            { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  variant:          { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  quantityOrdered:  { type: Number, required: true },
  quantityReceived: { type: Number, default: 0 },
  unitPrice:        { type: Number, required: true },
}, { timestamps: true });

export default models.PurchaseOrderItem || model('PurchaseOrderItem', PurchaseOrderItemSchema);