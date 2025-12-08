import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserNav from '../src/components/UserNav';

export default function KBDetail(){
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(()=>{
    const fetchArticle = async ()=>{
      try{
        const res = await fetch(`http://localhost:5000/api/kb/${id}`);
        if(!res.ok) throw new Error('Not found');
        const data = await res.json();
        setArticle(data);
      }catch(e){ console.error(e); }
    };
    fetchArticle();
  },[id]);

  if(!article) return <div className="min-h-screen bg-[#F5F7FF]"><UserNav /><div className="max-w-4xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <UserNav />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
        <div className="text-sm text-gray-500 mb-6">{article.category} • {new Date(article.createdAt).toLocaleDateString()}</div>
        <div className="bg-white rounded p-6 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </div>
  );
}
