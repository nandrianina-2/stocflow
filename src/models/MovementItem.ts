import { Schema, model, models } from 'mongoose';

const MovementItemSchema = new Schema({
  movement:     { type: Schema.Types.ObjectId, ref: 'StockMovement', required: true },
  variant:      { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  quantity:     { type: Number, required: true },
  fromLocation: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation' },
  toLocation:   { type: Schema.Types.ObjectId, ref: 'WarehouseLocation' },
  unitCost:     Number,
  batchNumber:  String,
  expiresAt:    Date,
}, { timestamps: true });

export default models.MovementItem || model('MovementItem', MovementItemSchema);