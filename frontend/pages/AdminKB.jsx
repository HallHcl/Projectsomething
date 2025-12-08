import React, { useState } from 'react';
import UserNav from '../src/components/UserNav';

export default function AdminKB() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/kb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g,'-'), category, tags, content, published }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Create failed');
      }
      alert('Article created');
      setTitle(''); setSlug(''); setCategory('General'); setTags(''); setContent(''); setPublished(true);
    } catch (e) {
      console.error('create kb', e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <UserNav />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Admin — Knowledge Base</h1>
        <div className="bg-white p-6 rounded shadow">
          <div className="grid grid-cols-1 gap-4">
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="px-3 py-2 border rounded" />
            <input value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="Slug (optional)" className="px-3 py-2 border rounded" />
            <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="Category" className="px-3 py-2 border rounded" />
            <input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="Tags (comma-separated)" className="px-3 py-2 border rounded" />
            <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Content" rows={8} className="px-3 py-2 border rounded" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)} /> Published</label>
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Create'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
