import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  role:     { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  isActive: { type: Boolean, default: true },
  avatar:   { type: String },
}, { timestamps: true });

export default models.User || model('User', UserSchema);