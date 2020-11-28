const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WoWTokenSchema = new Schema({
  prices: {
    type: Array,
    required: true,
  }
}, {
    timestamps:true
});

const WoWToken = mongoose.model('WoWToken', WoWTokenSchema);

module.exports = {
  WoWToken
};
