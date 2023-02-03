import { models, model, Schema } from 'mongoose';

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true }
});

const UserModel = models.User || model('User', UserSchema);

export default UserModel
