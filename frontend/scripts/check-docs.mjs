import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ignored = new Set(['.git', 'node_modules', 'dist', '.angular', 'public']);
const markdownFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) markdownFiles.push(fullPath);
  }
}

function slugHeading(value) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\-\s]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeAnchor(value) {
  try { return decodeURIComponent(value).toLowerCase(); }
  catch { return value.toLowerCase(); }
}

function collectAnchors(content) {
  const anchors = new Set();
  const counts = new Map();
  for (const line of content.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    const explicit = [...line.matchAll(/<a\s+(?:[^>]*\s)?id=["']([^"']+)["'][^>]*>/gi)];
    for (const match of explicit) anchors.add(normalizeAnchor(match[1]));
    if (!heading) continue;
    const base = slugHeading(heading[1]);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(normalizeAnchor(count ? `${base}-${count}` : base));
  }
  return anchors;
}

function stripCode(content) {
  return content.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, block => block.replace(/[^\n]/g, ' '));
}

const errors = [];
await walk(root);
markdownFiles.sort();
const contentByFile = new Map(await Promise.all(markdownFiles.map(async file => [file, await readFile(file, 'utf8')])));
const anchorsByFile = new Map([...contentByFile].map(([file, content]) => [file, collectAnchors(content)]));

for (const [file, raw] of contentByFile) {
  const relativeFile = path.relative(root, file).split(path.sep).join('/');
  const content = stripCode(raw);
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (/^#{1,6}\S/.test(line) && !/^#{1,6}\s/.test(line)) errors.push(`${relativeFile}:${index + 1}: heading marker must be followed by a space`);
    if (/^#{1,6}\s/.test(line) && index > 0 && lines[index - 1].trim() !== '' && lines[index - 1].trim() !== '---' && !/^\s*(?:```|~~~|\$\$)/.test(lines[index - 1])) {
      errors.push(`${relativeFile}:${index + 1}: add a blank line before the heading`);
    }
    if (/^#{1,6}\s/.test(line) && index + 1 < lines.length && lines[index + 1].trim() !== '' && !/^#{1,6}\s/.test(lines[index + 1]) && !/^\s*(?:[-*+]\s|\d+\.\s|```|~~~|\||<|\{)/.test(lines[index + 1]) && !lines[index + 1].startsWith('>') && !/^\S/.test(lines[index + 1])) {
      errors.push(`${relativeFile}:${index + 1}: add a blank line after the heading`);
    }
  }

  const linkPattern = /!?(?:\[[^\]]*\])\((<[^>]+>|[^\s)]*)(?:\s+[^)]*)?\)/g;
  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].startsWith('<') ? match[1].slice(1, -1) : match[1];
    const target = rawTarget.replace(/&amp;/g, '&');
    if (!target || target.startsWith('#') && target.length === 1 || target.includes('<') || target.includes('>')) continue;
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target) || target.startsWith('/')) continue;
    const decoded = target;
    const hashAt = decoded.indexOf('#');
    const pathname = hashAt < 0 ? decoded : decoded.slice(0, hashAt);
    const fragment = hashAt < 0 ? '' : decoded.slice(hashAt + 1);
    let decodedPath;
    try { decodedPath = decodeURIComponent(pathname); }
    catch { errors.push(`${relativeFile}: invalid URI encoding in link ${target}`); continue; }
    const destination = path.resolve(path.dirname(file), decodedPath || path.basename(file));
    if (destination === path.resolve(root, 'docs/templates/module-readme.md') && ['lessons/lesson.md', 'exercises/exercise.md', 'solutions/solution.md', 'evidence/acceptance.md'].includes(pathname)) continue;
    if (!destination.startsWith(`${root}${path.sep}`) && destination !== root) {
      errors.push(`${relativeFile}: link escapes repository: ${target}`); continue;
    }
    let destinationStat;
    try { destinationStat = await stat(destination); }
    catch { errors.push(`${relativeFile}: missing local link ${target}`); continue; }
    if (fragment && destinationStat.isFile() && path.extname(destination).toLowerCase() === '.md') {
      const targetAnchors = anchorsByFile.get(destination);
      if (!targetAnchors?.has(normalizeAnchor(fragment)) && !targetAnchors?.has(normalizeAnchor(fragment.replace(/-+/g, '-')))) errors.push(`${relativeFile}: missing anchor #${fragment} in ${path.relative(root, destination).split(path.sep).join('/')}`);
    }
  }
}

if (errors.length) {
  console.error(`Documentation check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Documentation check passed for ${markdownFiles.length} Markdown files.`);
}
