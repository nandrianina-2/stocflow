import { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
  name:   { type: String, required: true },
  slug:   { type: String, required: true, unique: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  image:  { type: String },
}, { timestamps: true });

export default models.Category || model('Category', CategorySchema);