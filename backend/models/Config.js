const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  autoCloseEnabled: {
    type: Boolean,
    default: true
  },
  confidenceThreshold: {
    type: Number,
    default: 0.78,
    min: 0,
    max: 1
  },
  slahours: {
    type: Number,
    default: 24
  }
}, {
  
  collection: 'config',
  versionKey: false
});

configSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('Config', configSchema);