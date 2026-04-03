const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        type: { type: String, enum: ['voice', 'video'], required: true },
        status: { type: String, enum: ['ringing', 'connected', 'ended', 'missed', 'rejected'], default: 'ringing' },
        duration: { type: Number, default: 0 }, // seconds
        startedAt: { type: Date },
        endedAt: { type: Date },
        agoraChannel: { type: String },
    },
    { timestamps: true }
);

callLogSchema.index({ conversation: 1, createdAt: -1 });
callLogSchema.index({ initiator: 1 });

module.exports = mongoose.model('CallLog', callLogSchema);
