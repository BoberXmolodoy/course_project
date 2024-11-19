const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    action: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
