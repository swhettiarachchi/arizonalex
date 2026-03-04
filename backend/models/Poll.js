const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
    label: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const pollSchema = new mongoose.Schema(
    {
        question: { type: String, required: [true, 'Poll question is required'], maxlength: 500 },
        options: { type: [pollOptionSchema], validate: [arr => arr.length >= 2, 'Poll must have at least 2 options'] },
        endDate: { type: Date, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

pollSchema.virtual('totalVotes').get(function () {
    return this.options.reduce((total, opt) => total + (opt.votes ? opt.votes.length : 0), 0);
});

module.exports = mongoose.model('Poll', pollSchema);
