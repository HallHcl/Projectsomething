import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserNav from '../src/components/UserNav';

export default function KBReader() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch book info on mount
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/books/${slug}`);
        const data = await res.json();
        if (res.ok) {
          setBook(data);
          setPage(1); // Start at page 1
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

  // Fetch page data when page changes
  useEffect(() => {
    if (!book) return;
    const fetchPage = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/books/${slug}/page?page=${page}`);
        const data = await res.json();
        if (res.ok) {
          setPageData(data);
        } else {
          console.error('Page not found:', data);
        }
      } catch (e) {
        console.error('fetch page', e);
      }
    };
    fetchPage();
  }, [page, slug, book]);

  const handleNext = () => {
    if (pageData && page < pageData.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleClose = () => {
    navigate('/knowledge');
  };

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
    <div className="min-h-screen bg-gray-900">
      <UserNav />
      
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          ← Back to Knowledge
        </button>
        <h1 className="text-xl font-semibold">{book.title}</h1>
        <div className="text-sm">
          {pageData && `Page ${page} of ${pageData.totalPages}`}
        </div>
      </div>

      {/* Reader Container */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Page Content */}
          <div className="min-h-[600px] p-8 bg-white">
            {pageData ? (
              <>
                {pageData.title && (
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">{pageData.title}</h2>
                )}
                
                {/* HTML Content */}
                <div
                  className="prose prose-lg max-w-none text-gray-700 mb-6"
                  dangerouslySetInnerHTML={{ __html: pageData.content }}
                />

                {/* Attachments */}
                {pageData.attachments && pageData.attachments.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="font-semibold text-gray-900 mb-4">Attachments:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pageData.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {att.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={att} alt={`Attachment ${idx + 1}`} className="max-w-xs rounded" />
                          ) : att.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video controls className="max-w-xs rounded">
                              <source src={att} />
                            </video>
                          ) : (
                            <a href={att} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                              {att.split('/').pop()}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500">Loading page...</div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="bg-gray-50 border-t px-8 py-4 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              className={`px-6 py-2 rounded font-semibold transition ${
                page <= 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              ← Previous
            </button>

            <div className="text-sm text-gray-600 font-medium">
              {pageData && `Page ${page} of ${pageData.totalPages}`}
            </div>

            <button
              onClick={handleNext}
              disabled={!pageData || page >= pageData.totalPages}
              className={`px-6 py-2 rounded font-semibold transition ${
                !pageData || page >= pageData.totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
