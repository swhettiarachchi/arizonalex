const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
        email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] },
        username: { type: String, required: [true, 'Username is required'], unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30, match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'] },
        password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
        avatar: { type: String, default: '' },
        banner: { type: String, default: '' },
        bio: { type: String, default: '', maxlength: 280 },
        role: { type: String, enum: ['politician', 'journalist', 'citizen', 'official', 'admin'], default: 'citizen' },
        verified: { type: Boolean, default: false },
        party: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: follower/following counts
userSchema.virtual('followersCount').get(function () { return this.followers ? this.followers.length : 0; });
userSchema.virtual('followingCount').get(function () { return this.following ? this.following.length : 0; });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

// Sign JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

module.exports = mongoose.model('User', userSchema);
