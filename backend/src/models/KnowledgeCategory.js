const mongoose = require('mongoose');

const KnowledgeCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeCategory', KnowledgeCategorySchema);
