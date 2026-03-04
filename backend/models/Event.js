const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'Event title is required'], maxlength: 200 },
        type: { type: String, enum: ['rally', 'speech', 'meeting', 'townhall', 'debate'], required: true },
        date: { type: Date, required: true },
        location: { type: String, required: true },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        description: { type: String, required: true, maxlength: 5000 },
    },
    { timestamps: true }
);

eventSchema.index({ date: 1 });
eventSchema.index({ type: 1 });

module.exports = mongoose.model('Event', eventSchema);
