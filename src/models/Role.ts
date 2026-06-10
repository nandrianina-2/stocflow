import mongoose, { Schema, model, models } from 'mongoose';

const RoleSchema = new Schema({
  name:        { type: String, required: true, unique: true },
  permissions: [{ type: String }],
}, { timestamps: true });

export default models.Role || model('Role', RoleSchema);