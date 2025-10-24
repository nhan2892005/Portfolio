import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import fm from 'front-matter';

import TableOfContents from './TableOfContents';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorPage from './ErrorPage';
import MarkdownRenderer from './MarkdownRenderer';
import FixedNavigation from './FixedNavigation';

// Import tất cả markdown files
const markdownModules = import.meta.glob('../../data/posts/*.md', { as: 'raw', eager: true });
function formatDate(dateStr) {
  return dateStr.replace(/-/g, "/");
}
const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const loadPost = () => {
      try {
        const filePath = `../../data/posts/${slug}.md`;
        const markdownContent = markdownModules[filePath];
        
        if (!markdownContent) {
          setError('Bài viết không tồn tại');
          setLoading(false);
          return;
        }

        const parsed = fm(markdownContent);
        setPost({ ...parsed.attributes, content: parsed.body, slug });
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải bài viết: ' + err.message);
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorPage error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
      <div className="flex flex-col md:flex-row md:gap-8 relative">
        {/* Table of Contents */}
        {post?.content && (
          <TableOfContents 
            content={post.content} 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
          />
        )}
          
        {/* Main Content */}
        <div className="flex-1 bg-transparent p-1 mt-10 md:mt-0 max-w-full sm:max-w-xl md:max-w-xl lg:max-w-4xl xl:max-w-7xl mx-auto rounded-lg shadow">
          <div className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
            >
              ← Quay lại Blog
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Cover image nếu có */}
              {post.cover && (
                <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-white text-6xl">📝</div>
                </div>
              )}
              
              <div className="p-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  {post.date && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                  )}
                  
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>{post.author}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span>⏱️</span>
                    <span>{Math.ceil((post.content?.length || 0) / 600)} phút đọc</span>
                  </div>
                </div>
                
                {post.description && (
                  <p className="text-lg text-gray-600 italic border-l-4 border-blue-500 pl-4">
                    {post.description}
                  </p>
                )}
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <MarkdownRenderer content={post.content} />
          </div>
        </div>

        {/* Fixed Navigation */}
        <FixedNavigation toggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
};

export default BlogPost;