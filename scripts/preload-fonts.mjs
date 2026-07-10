import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "..", "dist");
const astro = join(dist, "_astro");

const fonts = readdirSync(astro).filter(f => f.endsWith(".woff2"));
const links = fonts.map(f => {
  const href = `/_astro/${f}`;
  return `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href}">`;
}).join("\n    ");

const dirs = readdirSync(dist, { withFileTypes: true })
  .filter(d => d.isDirectory() || d.name.endsWith(".html"))
  .map(d => d.isDirectory() ? join(dist, d.name, "index.html") : join(dist, d.name))
  .filter(f => f.endsWith(".html"));

dirs.forEach(file => {
  try {
    let html = readFileSync(file, "utf8");
    if (html.includes("</head>") && !html.includes('rel="preload" as="font"')) {
      html = html.replace("</head>", `    ${links}\n  </head>`);
      writeFileSync(file, html);
    }
  } catch {}
});

console.log(`Preloaded ${fonts.length} fonts across ${dirs.length} pages`);
