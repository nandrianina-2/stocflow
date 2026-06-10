import { Schema, model, models } from 'mongoose';

const StockLevelSchema = new Schema({
  variant:      { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  location:     { type: Schema.Types.ObjectId, ref: 'WarehouseLocation', required: true },
  quantity:     { type: Number, required: true, default: 0 },
  reserved:     { type: Number, default: 0 },
  minThreshold: { type: Number, default: 0 },
  maxThreshold: { type: Number },
}, { timestamps: true });

StockLevelSchema.index({ variant: 1, location: 1 }, { unique: true });

export default models.StockLevel || model('StockLevel', StockLevelSchema);