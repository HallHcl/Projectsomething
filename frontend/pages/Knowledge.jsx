import React, { useEffect, useState } from 'react';
import UserNav from '../src/components/UserNav';
import { useNavigate } from 'react-router-dom';

export default function Knowledge() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'books', 'articles'
  const navigate = useNavigate();

  const categories = ['Printer', 'Network', 'Software', 'Account Login', 'Hardware', 'Policy'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = encodeURIComponent(query || '');
      const cat = encodeURIComponent(category || '');

      // Fetch articles
      const articlesRes = await fetch(`http://localhost:5000/api/kb?q=${q}&category=${cat}`);
      const articlesData = await articlesRes.json();
      setArticles(articlesData.articles || articlesData);

      // Fetch books
      const booksRes = await fetch(`http://localhost:5000/api/books?q=${q}&category=${cat}`);
      const booksData = await booksRes.json();
      setBooks(booksData.books || booksData);
    } catch (e) {
      console.error('fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query, category]);

  const excerpt = (s, n = 120) => (s ? (s.length > n ? s.slice(0, n) + '...' : s) : '');

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <UserNav />
      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="bg-purple-600 rounded-lg p-10 text-white mb-8 shadow-md">
          <h1 className="text-4xl font-light mb-6">How can we help you?</h1>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Help"
              className="flex-1 px-4 py-3 rounded shadow text-gray-800"
            />
            <button onClick={fetchData} className="px-4 py-3 bg-white rounded text-purple-600 font-medium">Search</button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? '' : c)}
              className={`p-6 rounded-lg shadow flex flex-col items-center justify-center transition ${
                category === c ? 'bg-white border-2 border-purple-600' : 'bg-white hover:shadow-lg'
              }`}
            >
              <div className="text-3xl mb-2">
                {c === 'Printer' ? '🖨' : c === 'Network' ? '🌐' : c === 'Software' ? '💻' : c === 'Account Login' ? '🔑' : c === 'Hardware' ? '🖥' : '📋'}
              </div>
              <div className="text-sm font-medium text-gray-700">{c}</div>
            </button>
          ))}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded font-semibold transition ${
              activeTab === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-6 py-2 rounded font-semibold transition ${
              activeTab === 'books' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            📖 E-Books
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-6 py-2 rounded font-semibold transition ${
              activeTab === 'articles' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            📄 Articles
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {/* Books Section */}
            {(activeTab === 'all' || activeTab === 'books') && books.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 E-Books</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <div
                      key={book._id}
                      onClick={() => navigate(`/book/${book.slug}`)}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                    >
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
                          <div className="text-white text-6xl">📖</div>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
                        <div className="text-sm text-gray-600 mb-3">{excerpt(book.description)}</div>
                        <div className="flex justify-between items-center">
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                            {book.category}
                          </span>
                          {book.pageCount && <span className="text-xs text-gray-500">{book.pageCount} pages</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Section */}
            {(activeTab === 'all' || activeTab === 'articles') && articles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📄 Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((a) => (
                    <div key={a._id} className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-blue-600">{a.title}</h3>
                        <div className="text-sm text-gray-500">{a.category}</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">{excerpt(a.content)}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <button onClick={() => navigate(`/kb/${a._id}`)} className="text-blue-600 hover:underline">
                          Read more →
                        </button>
                        <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {books.length === 0 && articles.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-4">📚</div>
                <p>No content found. Try searching or changing filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
