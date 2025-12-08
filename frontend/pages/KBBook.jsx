import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserNav from '../src/components/UserNav';

export default function KBBook() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/books/${slug}`);
        const data = await res.json();
        if (res.ok) {
          setBook(data);
        } else {
          console.error('Book not found:', data);
          navigate('/knowledge');
        }
      } catch (e) {
        console.error('fetch book', e);
        navigate('/knowledge');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
        <UserNav />
        <div>Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#F5F7FF]">
        <UserNav />
        <div className="text-center py-12">Book not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserNav />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={() => navigate('/knowledge')}
          className="mb-8 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Knowledge
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Book Cover */}
          <div className="flex justify-center">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-80 h-96 object-cover rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-80 h-96 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg shadow-2xl flex items-center justify-center">
                <div className="text-white text-center px-4">
                  <div className="text-6xl mb-4">📖</div>
                  <div className="text-2xl font-bold">{book.title}</div>
                </div>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-semibold">
                  {book.category}
                </span>
                {book.pageCount && (
                  <span className="text-gray-600 text-sm">
                    {book.pageCount} pages
                  </span>
                )}
              </div>
            </div>

            {book.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            )}

            {book.author && (
              <div>
                <p className="text-sm text-gray-600">
                  By <span className="font-semibold">{book.author.fullName || book.author.email}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Published {new Date(book.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => navigate(`/book-reader/${slug}`)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                ➜ Start Reading
              </button>
              <button
                onClick={() => navigate('/knowledge')}
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Book Stats */}
        <div className="mt-16 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{book.pageCount || 0}</div>
              <div className="text-sm text-gray-600">Pages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{book.category}</div>
              <div className="text-sm text-gray-600">Category</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
