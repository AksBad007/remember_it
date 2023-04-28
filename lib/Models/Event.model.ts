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
        userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    },
    location: {
        coordinates: { type: [ Number ], required: false },
        description: { type: String, required: true },
        link : { type: String, required: false },
    },
    invited_users: [{
        userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        status: { type: String, required: true, default: 'pending' }
    }]
});

export default models.Event || model('Event', EventSchema)
