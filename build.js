const fs = require('fs');

const presets = JSON.parse(fs.readFileSync('presets.json', 'utf8'));
const template = fs.readFileSync('template.html', 'utf8');
const BASE_URL = 'https://exact-image-resizer.pages.dev';

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

const internalLinksHtml = presets
  .map(p => `<a href="/${p.slug}.html" class="block p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-emerald-400 transition truncate">${p.toolName}</a>`)
  .join('\n');

function buildPage(item, isHome = false) {
  const canonical = isHome ? `${BASE_URL}/` : `${BASE_URL}/${item.slug}.html`;
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": item.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  });

  const html = template
    .replace(/\{\{TITLE\}\}/g, isHome ? 'Exact Image Compressor & Resizer (KB & Pixels) - Free Online Tool' : item.title)
    .replace(/\{\{DESC\}\}/g, isHome ? 'Compress images to exact KB (20KB, 50KB, 100KB) and resize to exact pixels or mm for US Visa, Passport, Schengen, and forms. 100% private in-browser.' : item.description)
    .replace(/\{\{H1\}\}/g, isHome ? 'Exact-Size Image Compressor & Resizer' : item.h1)
    .replace(/\{\{CANONICAL\}\}/g, canonical)
    .replace(/\{\{PRESET_ID\}\}/g, item.id)
    .replace('{{PRESETS_JSON}}', JSON.stringify(presets))
    .replace('{{INTERNAL_LINKS}}', internalLinksHtml)
    .replace('{{FAQ_SCHEMA}}', faqSchema);

  const outFile = isHome ? 'dist/index.html' : `dist/${item.slug}.html`;
  fs.writeFileSync(outFile, html);
}

buildPage(presets[0], true);
presets.forEach(p => buildPage(p, false));

const sitemapUrls = [
  `  <url>\n    <loc>${BASE_URL}/</loc>\n    <priority>1.0</priority>\n  </url>`,
  ...presets.map(p => `  <url>\n    <loc>${BASE_URL}/${p.slug}.html</loc>\n    <priority>0.8</priority>\n  </url>`)
].join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>`;
fs.writeFileSync('dist/sitemap.xml', sitemap);
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`);

console.log(`Generated ${presets.length + 1} pages.`);
