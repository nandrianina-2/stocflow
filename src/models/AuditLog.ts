import { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema({
  collection:  { type: String, required: true },
  documentId:  { type: Schema.Types.ObjectId, required: true },
  action:      { type: String, enum: ['update', 'delete'], required: true },
  changes:     { type: Schema.Types.Mixed },
  changedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  changedAt:   { type: Date, default: Date.now },
}, { timestamps: false });

AuditLogSchema.index({ collection: 1, documentId: 1 });
AuditLogSchema.index({ changedAt: -1 });

export default models.AuditLog || model('AuditLog', AuditLogSchema);