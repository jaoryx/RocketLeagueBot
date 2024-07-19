const mongoose = require('mongoose');

const RolesSchema = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    roles: {
        type: mongoose.SchemaTypes.Array,
        default: [],
    }
});

module.exports = mongoose.model('Roles', RolesSchema);