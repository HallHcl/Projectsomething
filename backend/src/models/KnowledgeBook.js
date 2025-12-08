const mongoose = require('mongoose');

const KnowledgeBookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeCategory' },
    description: { type: String },
    coverImage: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KnowledgeBook', KnowledgeBookSchema);
