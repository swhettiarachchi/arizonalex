const mongoose = require('mongoose');

const promiseSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'Promise title is required'], maxlength: 200 },
        description: { type: String, required: true, maxlength: 2000 },
        status: { type: String, enum: ['kept', 'broken', 'in-progress', 'pending'], default: 'pending' },
        politician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        category: { type: String, required: true },
    },
    { timestamps: true }
);

promiseSchema.index({ politician: 1 });
promiseSchema.index({ status: 1 });
promiseSchema.index({ category: 1 });

module.exports = mongoose.model('Promise', promiseSchema);
