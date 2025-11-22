/* Placeholder Icons Note:
 * These are temporary placeholder files.
 * Production icons will be generated from icon.svg using proper tooling.
 * For now, the extension will use these simple placeholders.
 */

// Create simple 1x1 transparent PNG as base64 data
const createPlaceholderIcon = (size) => {
  // This is a minimal valid PNG (1x1 transparent pixel)
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

[16, 32, 48, 128].forEach(size => {
  const filePath = path.join(__dirname, `icon-${size}.png`);
  fs.writeFileSync(filePath, createPlaceholderIcon(size));
  console.log(`Created placeholder: icon-${size}.png`);
});
