// src/components/BlogPost.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import fm from 'front-matter';
import 'highlight.js/styles/github-dark.css'; // Chọn theme highlight

// Import tất cả markdown files
const markdownModules = import.meta.glob('../data/posts/*.md', { as: 'raw', eager: true });

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = () => {
      try {
        // Tìm file markdown tương ứng với slug
        const filePath = `../data/posts/${slug}.md`;
        console.log('Loading post from:', filePath);
        console.log('Available modules:', Object.keys(markdownModules));
        
        const markdownContent = markdownModules[filePath];
        
        if (!markdownContent) {
          setError('Bài viết không tồn tại');
          setLoading(false);
          return;
        }

        console.log('Markdown content loaded:', markdownContent.substring(0, 200));

        // Parse frontmatter
        const parsed = fm(markdownContent);
        console.log('Parsed data:', parsed.attributes);
        console.log('Parsed content length:', parsed.body.length);
        
        setPost({ ...parsed.attributes, content: parsed.body, slug });
        setLoading(false);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Lỗi khi tải bài viết: ' + err.message);
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Bài viết không tồn tại</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/blog')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Quay lại Blog
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🏠 Trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
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
                    <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
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
                  <span>{Math.ceil((post.content?.length || 0) / 500)} phút đọc</span>
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
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom components for better styling
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-gray-800 mb-3 mt-6">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                code: ({ node, inline, className, children, ...props }) => {
                  if (inline) {
                    return (
                      <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 bg-blue-50 p-4 rounded-r-lg mb-6">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-blue-600 hover:text-blue-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-800">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700">{children}</em>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <Link 
            to="/blog"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Tất cả bài viết
          </Link>
          
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ↑ Lên đầu trang
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
