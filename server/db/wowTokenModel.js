const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WoWTokenJobSchema = new Schema({
  prices: {
    type: Array,
    required: true,
  }
}, {
    timestamps:true
});

const WoWTokenSchema = new Schema({
  prices: {
    type: Array,
    required: true,
  }
}, {
  timestamps:true,
  toJSON: { getters: true }
});

WoWTokenSchema.path('createdAt').get(v => {
  return v.getTime();
});

const WoWJobToken = mongoose.model('WoWJobToken', WoWTokenJobSchema);
const WoWToken = mongoose.model('WoWToken', WoWTokenSchema);


module.exports = {
  WoWJobToken,
  WoWToken,
};
