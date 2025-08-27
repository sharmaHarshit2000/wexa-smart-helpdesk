const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

articleSchema.index({ title: 'text', body: 'text', tags: 'text' });

module.exports = mongoose.model('Article', articleSchema);