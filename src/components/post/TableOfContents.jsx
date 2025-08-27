import React, { useState, useEffect } from 'react';

const TableOfContents = ({ content, isSidebarOpen, setIsSidebarOpen }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Parse headings from markdown content
    const lines = content.split('\n');
    const headers = lines
      .filter(line => line.startsWith('#'))
      .map(line => {
        const level = line.match(/^#+/)[0].length;
        const title = line.replace(/^#+\s/, '');
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return { level, title, id };
      });
    setHeadings(headers);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    const headers = document.querySelectorAll('h1, h2, h3');
    headers.forEach(header => observer.observe(header));

    return () => headers.forEach(header => observer.unobserve(header));
  }, []);

  return (
    <>
      {isSidebarOpen && (
        <nav
          className="fixed top-24 left-4 w-72 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 
            z-50 transition-all duration-300 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-4
            max-h-[calc(100vh-120px)] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-700">Mục lục</h4>
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="space-y-2">
            {headings.map((heading, index) => (
              <li
                key={index}
                style={{ marginLeft: `${(heading.level - 1) * 1}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                      window.history.pushState(null, '', `#${heading.id}`);
                      setActiveId(heading.id); // Thêm: Set active ngay để highlight tức thì
                      setIsSidebarOpen(false); // Đóng sidebar trên mobile
                    }
                  }}
                  className={`block py-1 text-sm transition-colors duration-200 ${
                    activeId === heading.id
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {heading.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
};

export default TableOfContents;