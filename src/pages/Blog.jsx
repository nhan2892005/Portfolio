// src/pages/Blog.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fm from 'front-matter';

// Import tất cả markdown files
const markdownModules = import.meta.glob('../data/posts/*.md', { as: 'raw', eager: true });

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    const loadPosts = () => {
      try {
        console.log('Loading posts...');
        console.log('Markdown modules:', markdownModules);
        
        const parsedPosts = Object.entries(markdownModules).map(([path, content]) => {
          console.log('Processing:', path);
          try {
            const parsed = fm(content);
            const slug = path.split('/').pop().replace('.md', '');
            
            // Validate required fields
            if (!parsed.attributes.title) {
              console.warn('Post missing title:', path);
              parsed.attributes.title = 'Untitled';
            }
            if (!parsed.attributes.date) {
              console.warn('Post missing date:', path);
              parsed.attributes.date = new Date().toISOString().split('T')[0];
            }
            
            return {
              ...parsed.attributes,
              content: parsed.body,
              slug,
              readTime: Math.ceil(parsed.body.length / 200), // Ước tính thời gian đọc
            };
          } catch (err) {
            console.error('Error parsing post:', path, err);
            return null;
          }
        }).filter(Boolean); // Remove null entries

        console.log('Parsed posts:', parsedPosts);

        // Sắp xếp theo ngày mới nhất
        parsedPosts.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
        
        setPosts(parsedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error loading posts:', error);
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Lọc bài viết theo search và tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  // Lấy tất cả tags unique
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📚 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Blog
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chia sẻ kiến thức, kinh nghiệm và những câu chuyện thú vị trong hành trình phát triển bản thân
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Tag Filter */}
            <div className="md:w-64">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">🏷️ Tất cả chủ đề</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>📝 {posts.length} bài viết</span>
            <span>🏷️ {allTags.length} chủ đề</span>
            {(searchTerm || selectedTag) && (
              <span>🔍 {filteredPosts.length} kết quả tìm thấy</span>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Không tìm thấy bài viết nào
            </h2>
            <p className="text-gray-600 mb-6">
              Thử thay đổi từ khóa tìm kiếm hoặc chọn chủ đề khác
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 text-white">
                  <div className="text-3xl mb-2">📝</div>
                  <h2 className="text-xl font-bold group-hover:text-yellow-200 transition-colors">
                    {post.title}
                  </h2>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>📅 {new Date(post.date).toLocaleDateString('vi-VN')}</span>
                    <span>⏱️ {post.readTime} phút đọc</span>
                  </div>

                  {/* Description */}
                  {post.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.description}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{post.tags.length - 3} khác
                        </span>
                      )}
                    </div>
                  )}

                  {/* Read more */}
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                    Đọc tiếp
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Featured Tags */}
        {!searchTerm && !selectedTag && allTags.length > 0 && (
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🏷️ Chủ đề nổi bật
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 px-4 py-2 rounded-full hover:from-blue-200 hover:to-purple-200 transition-colors font-medium"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
