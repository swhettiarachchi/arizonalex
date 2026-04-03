const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
        email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] },
        username: { type: String, required: [true, 'Username is required'], unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30, match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'] },
        password: { type: String, minlength: 6, select: false },
        googleId: { type: String, unique: true, sparse: true },
        authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
        avatar: { type: String, default: '' },
        banner: { type: String, default: '' },
        bio: { type: String, default: '', maxlength: 280 },
        role: { type: String, enum: ['politician', 'journalist', 'citizen', 'official', 'admin', 'businessman', 'entrepreneur', 'crypto_trader', 'stock_trader', 'banker', 'doctor', 'researcher', 'academic', 'lawyer', 'judge', 'activist', 'celebrity', 'other'], default: 'citizen' },
        // Political fields
        position: { type: String, default: '' },
        ideology: { type: String, default: '' },
        yearsActive: { type: String, default: '' },
        country: { type: String, default: '' },
        campaignPromises: [{ type: String }],
        achievements: [{ type: String }],
        // Business fields
        company: { type: String, default: '' },
        industry: { type: String, default: '' },
        services: [{ type: String }],
        portfolioUrl: { type: String, default: '' },
        // Analytics
        profileViews: { type: Number, default: 0 },
        supportPercentage: { type: Number, default: 0 },
        // Phone
        phone: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        party: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        // ── Security fields ──
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorCode: { type: String, select: false },
        twoFactorExpires: { type: Date, select: false },
        backupCodes: [{ type: String, select: false }],

        // Brute-force protection
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date },

        // Password & email change tracking
        passwordChangedAt: { type: Date },
        pendingEmail: { type: String },
        emailVerificationCode: { type: String, select: false },
        emailVerificationExpires: { type: Date, select: false },

        // Password reset
        resetPasswordCode: { type: String, select: false },
        resetPasswordExpires: { type: Date, select: false },

        // Soft delete
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },

        // Blocked users
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: follower/following counts
userSchema.virtual('followersCount').get(function () { return this.followers ? this.followers.length : 0; });
userSchema.virtual('followingCount').get(function () { return this.following ? this.following.length : 0; });

// Virtual: isLocked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Require password only for local auth
userSchema.pre('validate', function (next) {
    if (this.authProvider !== 'google' && !this.password && this.isNew) {
        this.invalidate('password', 'Password is required for local accounts');
    }
    next();
});

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
    if (!this.password) return false;
    return await bcrypt.compare(entered, this.password);
};

// Sign JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

// Generate OTP (6-digit)
userSchema.methods.generateOTP = function () {
    const otp = crypto.randomInt(100000, 999999).toString();
    this.twoFactorCode = crypto.createHash('sha256').update(otp).digest('hex');
    this.twoFactorExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (enteredOtp) {
    const hash = crypto.createHash('sha256').update(enteredOtp).digest('hex');
    if (this.twoFactorCode !== hash) return false;
    if (this.twoFactorExpires < Date.now()) return false;
    return true;
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        await this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
        return;
    }
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // 15 min lock
    }
    await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
    await this.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
};

// Generate backup codes
userSchema.methods.generateBackupCodes = function () {
    const codes = [];
    const hashedCodes = [];
    for (let i = 0; i < 8; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
        hashedCodes.push(crypto.createHash('sha256').update(code).digest('hex'));
    }
    this.backupCodes = hashedCodes;
    return codes;
};

// Verify backup code
userSchema.methods.verifyBackupCode = function (enteredCode) {
    const hash = crypto.createHash('sha256').update(enteredCode.toUpperCase()).digest('hex');
    const index = this.backupCodes.indexOf(hash);
    if (index === -1) return false;
    this.backupCodes.splice(index, 1); // remove used code
    return true;
};

module.exports = mongoose.model('User', userSchema);
