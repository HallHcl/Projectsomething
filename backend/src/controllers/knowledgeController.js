const KnowledgeArticle = require('../models/KnowledgeArticle');
const KnowledgeCategory = require('../models/KnowledgeCategory');

// GET /api/kb?q=&category=&limit=&skip=
exports.listArticles = async (req, res) => {
  try {
    const { q, category, limit = 20, skip = 0 } = req.query;
    const filter = {};

    // support category as id or slug
    if (category) {
      // if looks like ObjectId, use directly
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        filter.category = category;
      } else {
        const cat = await KnowledgeCategory.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }

    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ title: re }, { content: re }, { tags: re }];
    }

    const articles = await KnowledgeArticle.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('category', 'name slug icon');

    const total = await KnowledgeArticle.countDocuments(filter);
    res.json({ articles, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (err) {
    console.error('listArticles', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/kb/:id
exports.getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await KnowledgeArticle.findById(id).populate('category', 'name slug icon').populate('author', 'email fullName');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error('getArticle', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/kb  (admin)
exports.createArticle = async (req, res) => {
  try {
    const { title, slug, category, tags = [], content, published = true, contentType = 'html', parentArticle = null, attachments = [] } = req.body;
    if (!title || !slug || !content) return res.status(400).json({ message: 'Missing required fields' });

    const exists = await KnowledgeArticle.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug already exists' });

    const article = await KnowledgeArticle.create({
      title,
      slug,
      category: category || null,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(s => s.trim()),
      content,
      contentType,
      parentArticle: parentArticle || null,
      attachments: Array.isArray(attachments) ? attachments : (attachments || '').split(',').map(s => s.trim()),
      published,
      author: req.user?.id,
    });

    await article.populate('category', 'name slug icon');

    res.status(201).json({ message: 'Article created', article });
  } catch (err) {
    console.error('createArticle', err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/kb/:id (admin)
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.tags && !Array.isArray(data.tags)) {
      data.tags = (data.tags || '').split(',').map(s => s.trim());
    }
    if (data.attachments && !Array.isArray(data.attachments)) {
      data.attachments = (data.attachments || '').split(',').map(s => s.trim());
    }
    const article = await KnowledgeArticle.findByIdAndUpdate(id, data, { new: true }).populate('category', 'name slug icon');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article updated', article });
  } catch (err) {
    console.error('updateArticle', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/kb/:id (admin)
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await KnowledgeArticle.findByIdAndDelete(id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (err) {
    console.error('deleteArticle', err);
    res.status(500).json({ message: err.message });
  }
};

// Categories
exports.listCategories = async (req, res) => {
  try {
    const cats = await KnowledgeCategory.find({}).sort({ order: 1, name: 1 });
    res.json(cats);
  } catch (err) {
    console.error('listCategories', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description = '', icon = '', order = 0, published = true } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Missing required fields' });
    const exists = await KnowledgeCategory.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug already exists' });
    const cat = await KnowledgeCategory.create({ name, slug, description, icon, order, published });
    res.status(201).json({ message: 'Category created', category: cat });
  } catch (err) {
    console.error('createCategory', err);
    res.status(500).json({ message: err.message });
  }
};