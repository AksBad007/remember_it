import { models, model, Schema } from 'mongoose'
import { hash } from 'bcrypt'

const FriendSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
})

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends_added: [FriendSchema],
    friends_received: [FriendSchema],
    friends_sent: [FriendSchema]
})

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        next()

    this.password = await hash(this.password, 12)
})

export default models.User || model('User', UserSchema)
