// scripts/generateSitemap.js
// Script để tự động tạo sitemap cho blog posts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fm from 'front-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDirectory = path.join(__dirname, '../src/data/posts');
const publicDirectory = path.join(__dirname, '../public');

// Đọc tất cả file markdown trong thư mục posts
function getAllPosts() {
  const posts = [];
  
  if (!fs.existsSync(postsDirectory)) {
    return posts;
  }

  const files = fs.readdirSync(postsDirectory);
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(postsDirectory, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const parsed = fm(content);
        const slug = file.replace('.md', '');
        
        posts.push({
          slug,
          date: parsed.attributes.date || new Date().toISOString().split('T')[0],
          title: parsed.attributes.title || 'Untitled',
        });
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
      }
    }
  });
  
  return posts;
}

// Tạo sitemap XML
function generateSitemap() {
  const posts = getAllPosts();
  const baseUrl = 'https://phucnhan.asia';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Trang chủ -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Trang About -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Trang Projects -->
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Trang Contact -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- Trang Blog -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Trang Transcript -->
  <url>
    <loc>${baseUrl}/transcript</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- Trang Photobooth -->
  <url>
    <loc>${baseUrl}/photobooth</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

  // Thêm các blog posts
  posts.forEach(post => {
    sitemap += `
  <!-- Blog Post: ${post.title} -->
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `
</urlset>
`;

  // Ghi file sitemap
  const sitemapPath = path.join(publicDirectory, 'mapsite.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  
  console.log(`✅ Sitemap generated successfully with ${posts.length} blog posts`);
  console.log(`📁 Saved to: ${sitemapPath}`);
}

// Chạy script
generateSitemap();
