const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        image: { type: String, required: [true, 'Story image is required'] },
        viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    },
    { timestamps: true }
);

// Auto-delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
