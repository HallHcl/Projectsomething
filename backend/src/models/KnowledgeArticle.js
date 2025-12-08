const mongoose = require('mongoose');

const KnowledgeArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  // category reference
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeCategory', required: false },

  tags: { type: [String], default: [] },

  content: { type: String, required: true },
  contentType: { type: String, enum: ['html', 'markdown'], default: 'html' },

  // parent article for e-book style grouping
  parentArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle', default: null },

  // attachments (URLs)
  attachments: [{ type: String }],

  published: { type: Boolean, default: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeArticle', KnowledgeArticleSchema);
