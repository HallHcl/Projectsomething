const mongoose = require('mongoose');

const KnowledgeBookPageSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeBook', required: true },
    pageNumber: { type: Number, required: true },
    title: { type: String },
    content: { type: String, required: true },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

// Ensure unique page numbers per book
KnowledgeBookPageSchema.index({ book: 1, pageNumber: 1 }, { unique: true });

module.exports = mongoose.model('KnowledgeBookPage', KnowledgeBookPageSchema);
