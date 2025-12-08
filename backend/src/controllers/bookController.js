const KnowledgeBook = require('../models/KnowledgeBook');
const KnowledgeBookPage = require('../models/KnowledgeBookPage');

// GET /api/books - list all books
exports.listBooks = async (req, res) => {
  try {
    const { category, q, limit = 20, skip = 0 } = req.query;
    const filter = { published: true };

    if (category) filter.category = category;
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ title: re }, { description: re }];
    }

    const books = await KnowledgeBook.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('author', 'email fullName');

    const total = await KnowledgeBook.countDocuments(filter);
    res.json({ books, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (err) {
    console.error('listBooks', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/books/:slug - get book info with page count
exports.getBook = async (req, res) => {
  try {
    const { slug } = req.params;
    const book = await KnowledgeBook.findOne({ slug, published: true }).populate('author', 'email fullName');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const pageCount = await KnowledgeBookPage.countDocuments({ book: book._id });
    res.json({ ...book.toObject(), pageCount });
  } catch (err) {
    console.error('getBook', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/books/:slug/pages - list all pages of a book
exports.listPages = async (req, res) => {
  try {
    const { slug } = req.params;
    const book = await KnowledgeBook.findOne({ slug });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const pages = await KnowledgeBookPage.find({ book: book._id }).sort({ pageNumber: 1 });
    res.json(pages);
  } catch (err) {
    console.error('listPages', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/books/:slug/page - get specific page
exports.getPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1 } = req.query;
    const book = await KnowledgeBook.findOne({ slug });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const pageData = await KnowledgeBookPage.findOne({ book: book._id, pageNumber: parseInt(page) });
    if (!pageData) return res.status(404).json({ message: 'Page not found' });

    const totalPages = await KnowledgeBookPage.countDocuments({ book: book._id });
    res.json({ ...pageData.toObject(), totalPages });
  } catch (err) {
    console.error('getPage', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/books (admin) - create book
exports.createBook = async (req, res) => {
  try {
    const { title, slug, category = 'General', description = '', coverImage = '', published = true } = req.body;
    if (!title || !slug) return res.status(400).json({ message: 'Missing required fields' });

    const exists = await KnowledgeBook.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug already exists' });

    const book = await KnowledgeBook.create({
      title,
      slug,
      category,
      description,
      coverImage,
      published,
      author: req.user?.id,
    });

    res.status(201).json({ message: 'Book created', book });
  } catch (err) {
    console.error('createBook', err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/books/:id (admin) - update book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await KnowledgeBook.findByIdAndUpdate(id, req.body, { new: true }).populate('author', 'email fullName');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book updated', book });
  } catch (err) {
    console.error('updateBook', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/books/:id (admin) - delete book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await KnowledgeBook.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    // Delete all pages of the book
    await KnowledgeBookPage.deleteMany({ book: id });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error('deleteBook', err);
    res.status(500).json({ message: err.message });
  }
};

// Pages
// POST /api/books/:bookId/pages (admin) - create page
exports.createPage = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { pageNumber, title = '', content, attachments = [] } = req.body;
    if (!pageNumber || !content) return res.status(400).json({ message: 'Missing required fields' });

    const book = await KnowledgeBook.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const page = await KnowledgeBookPage.create({
      book: bookId,
      pageNumber: parseInt(pageNumber),
      title,
      content,
      attachments: Array.isArray(attachments) ? attachments : (attachments || '').split(',').map(s => s.trim()),
    });

    res.status(201).json({ message: 'Page created', page });
  } catch (err) {
    console.error('createPage', err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/books/:bookId/pages/:pageId (admin) - update page
exports.updatePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const data = req.body;

    if (data.attachments && !Array.isArray(data.attachments)) {
      data.attachments = (data.attachments || '').split(',').map(s => s.trim());
    }

    const page = await KnowledgeBookPage.findByIdAndUpdate(pageId, data, { new: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page updated', page });
  } catch (err) {
    console.error('updatePage', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/books/:bookId/pages/:pageId (admin) - delete page
exports.deletePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const page = await KnowledgeBookPage.findByIdAndDelete(pageId);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    console.error('deletePage', err);
    res.status(500).json({ message: err.message });
  }
};
