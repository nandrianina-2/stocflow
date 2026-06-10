import { Schema, model, models } from 'mongoose';

const StockMovementSchema = new Schema({
  type:        { type: String, enum: ['entry', 'exit', 'transfer', 'adjustment', 'return', 'loss'], required: true },
  reference:   String,
  notes:       String,
  status:      { type: String, enum: ['draft', 'confirmed', 'cancelled'], default: 'draft' },
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  confirmedAt: Date,
  date:        { type: Date, default: Date.now },
}, { timestamps: true });

export default models.StockMovement || model('StockMovement', StockMovementSchema);