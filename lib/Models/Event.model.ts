import { models, model, Schema } from 'mongoose'

const EventSchema: Schema = new Schema({
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    next_reminder: { type: Number, required: true, default: 0 },
    title: { type: String, required: true },
    description: { type: String, required: false },
    repeat_status: { type: Number, required: true },
    reminder_status: { type: Boolean, required: true, default: false},
    notify: { type: Number, required: true },
    created_by: {
        user: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true }
    },
    location: {
        coordinates: { type: [ Number ], required: false },
        description: { type: String, required: true },
        link : { type: String, required: false },
    },
    invited_users: [{
        user: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
        status: { type: String, required: true, default: 'pending' }
    }]
})

EventSchema.post('save', async function(doc, next) {
    await doc.populate('created_by.user invited_users.user', 'email username')
    next()
})

export default models.Event || model('Event', EventSchema)
