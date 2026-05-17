#!/usr/bin/env node
/**
 * FinCoach AI — Palette Refactoring Script
 * Tüm sayfa ve componentlerdeki tekrarlı `const P = { ... }` bloklarını kaldırır
 * ve yerine `import { P } from '...styles/palette'` ekler.
 *
 * Çalıştır: node scripts/refactor-palette.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const SRC_DIR    = join(__dirname, '..', 'src');
const PALETTE_PATH = join(SRC_DIR, 'styles', 'palette.js');

// ------------------------------------------------------------------
// Helper: recursive file list
// ------------------------------------------------------------------
function walkDir(dir, ext = ['.jsx', '.js']) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'styles' || entry === 'assets') continue; // skip
      results.push(...walkDir(full, ext));
    } else if (ext.some((e) => entry.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

// ------------------------------------------------------------------
// Helper: strip the `const P = { ... };` block from source
// ------------------------------------------------------------------
function stripPaletteBlock(source) {
  const marker = 'const P = {';
  const start  = source.indexOf(marker);
  if (start === -1) return null; // nothing to do

  let braceCount = 0;
  let i = start + 'const P = '.length;
  let end = -1;

  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') { braceCount++; }
    else if (ch === '}') {
      braceCount--;
      if (braceCount === 0) {
        // Consume optional semicolon + one newline
        let j = i + 1;
        if (source[j] === ';') j++;
        if (source[j] === '\n') j++;
        end = j;
        break;
      }
    }
  }

  if (end === -1) return null; // malformed — skip

  const before = source.slice(0, start).trimEnd();
  const after  = source.slice(end);
  return (before ? before + '\n' : '') + after;
}

// ------------------------------------------------------------------
// Helper: insert import line after last `import ... from` line
// ------------------------------------------------------------------
function insertImport(source, importLine) {
  // Find the index after the last import statement
  const importRegex = /^import\s+.+?from\s+['"].+?['"];?\s*$/gm;
  let lastMatch = null;
  let m;
  while ((m = importRegex.exec(source)) !== null) {
    lastMatch = m;
  }

  if (!lastMatch) {
    // No existing imports — prepend
    return importLine + '\n' + source;
  }

  const insertAt = lastMatch.index + lastMatch[0].length;
  return source.slice(0, insertAt) + '\n' + importLine + source.slice(insertAt);
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
const files = walkDir(SRC_DIR);
let updatedCount = 0;

for (const filePath of files) {
  const original = readFileSync(filePath, 'utf8');

  if (!original.includes('const P = {')) continue;

  // 1. Strip the P block
  const stripped = stripPaletteBlock(original);
  if (stripped === null) {
    console.warn(`⚠ Could not parse P block in: ${filePath}`);
    continue;
  }

  // 2. Compute relative import path
  const relPalette = relative(dirname(filePath), PALETTE_PATH)
    .replace(/\\/g, '/')        // Windows safety
    .replace(/\.js$/, '');      // drop extension
  const importPath = relPalette.startsWith('.') ? relPalette : './' + relPalette;

  // 3. Check if import already exists (idempotent)
  if (stripped.includes(`from '${importPath}'`) || stripped.includes(`from "${importPath}"`)) {
    console.log(`✓ Already imported in: ${relative(SRC_DIR, filePath)}`);
    continue;
  }

  // 4. Insert import
  const importLine = `import { P } from '${importPath}';`;
  const result = insertImport(stripped, importLine);

  // 5. Write back
  writeFileSync(filePath, result, 'utf8');
  updatedCount++;
  console.log(`✅ Refactored: ${relative(SRC_DIR, filePath)}`);
}

console.log(`\n🎉 Done. ${updatedCount} files updated.`);
