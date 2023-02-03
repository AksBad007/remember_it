import { models, model, Schema } from 'mongoose';

const EventSchema: Schema = new Schema({
    start_date: { type: Number, required: true },
    end_date: { type: Number, required: true },
    timezone: { type: String, required: false },
    full_day: { type: Boolean, required: true, default: false },
    next_reminder: { type: Number, required: true, default: 0 },
    title: { type: String, required: true },
    description: { type: String, required: false },
    repeat_status: { type: Number, required: true },
    reminder_status: { type: Boolean, required: true, default: true},
    notify: { type: Number, required: true },
    still_active: { type: Boolean, required: true },
    created_by: {
        id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: false },
        email: { type: String, required: false },
    },
    location: {
        coordinates: { type: [ Number ], required: false },
        description: { type: String, required: false },
        link : { type: String, required: false },
    },
    invited_users: [{
        id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: false },
        email: { type: String, required: false },
        status: { type: String, required: true, default: "pending" }
    }]
});

const EventModel = models.User || model('User', EventSchema);

export default EventModel
