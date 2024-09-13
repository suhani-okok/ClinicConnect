const mongoose = require('mongoose');
const locationSchema =  new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    address: String
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;