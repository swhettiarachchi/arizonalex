const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: [true, 'Post content is required'], maxlength: 5000 },
        type: { type: String, enum: ['text', 'image', 'video', 'thread', 'policy'], default: 'text' },
        policyTitle: { type: String, default: '' },
        policyCategory: { type: String, default: '' },
        images: [{ type: String }],
        video: { type: String, default: '' },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        hashtags: [{ type: String }],
        commentsCount: { type: Number, default: 0 },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

postSchema.virtual('likesCount').get(function () { return this.likes ? this.likes.length : 0; });
postSchema.virtual('repostsCount').get(function () { return this.reposts ? this.reposts.length : 0; });

// Extract hashtags from content before save
postSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        const hashtagRegex = /#(\w+)/g;
        const matches = this.content.match(hashtagRegex);
        if (matches) {
            this.hashtags = matches.map((tag) => tag.replace('#', ''));
        }
    }
    next();
});

// Index for feed queries and search
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ type: 1 });

module.exports = mongoose.model('Post', postSchema);
