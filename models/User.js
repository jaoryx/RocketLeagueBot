const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    rlAcc: {
        type: mongoose.SchemaTypes.String,
        default: '',
    }
});

module.exports = mongoose.model('User', UserSchema);