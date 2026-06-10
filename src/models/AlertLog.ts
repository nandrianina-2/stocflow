import { Schema, model, models } from 'mongoose';

const AlertLogSchema = new Schema({
  rule:        { type: Schema.Types.ObjectId, ref: 'AlertRule', required: true },
  message:     String,
  triggeredAt: { type: Date, default: Date.now },
  resolved:    { type: Boolean, default: false },
  resolvedAt:  Date,
}, { timestamps: true });

export default models.AlertLog || model('AlertLog', AlertLogSchema);