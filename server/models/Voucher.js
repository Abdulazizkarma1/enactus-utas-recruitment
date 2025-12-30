const mongoose = require('mongoose');
const VoucherSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    isUsed: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Voucher', VoucherSchema);