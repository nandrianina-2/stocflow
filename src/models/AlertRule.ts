import { Schema, model, models } from 'mongoose';

const AlertRuleSchema = new Schema({
  product:      { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse:    { type: Schema.Types.ObjectId, ref: 'Warehouse', default: null },
  metric:       { type: String, enum: ['low_stock', 'overstock', 'expiry'], required: true },
  threshold:    { type: Number, required: true },
  isActive:     { type: Boolean, default: true },
  notifyEmails: [String],
}, { timestamps: true });

export default models.AlertRule || model('AlertRule', AlertRuleSchema);