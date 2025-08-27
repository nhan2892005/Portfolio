import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => {
            const id = children.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <h1 
                id={id} 
                className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500 scroll-mt-24"
              >
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = children.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <h2 
                id={id} 
                className="text-2xl font-bold text-gray-800 mb-4 mt-8 scroll-mt-24"
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = children.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <h3 
                id={id} 
                className="text-xl font-bold text-gray-800 mb-3 mt-6 scroll-mt-24"
              >
                {children}
              </h3>
            );
          },
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
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;