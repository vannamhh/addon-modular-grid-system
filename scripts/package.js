import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const REQUIRED_ICONS = ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png'];
const ASSETS_DIR = path.join(rootDir, 'src', 'assets');
const DIST_DIR = path.join(rootDir, 'dist');
const OUTPUT_ZIP = path.join(rootDir, 'dist.zip');

console.log('📦 Starting packaging process...');

// 1. Verify Icons
console.log('🔍 Verifying icons...');
const missingIcons = REQUIRED_ICONS.filter(icon => !fs.existsSync(path.join(ASSETS_DIR, icon)));

if (missingIcons.length > 0) {
  console.error(`❌ Missing required icons in ${ASSETS_DIR}:`, missingIcons.join(', '));
  process.exit(1);
}
console.log('✅ All required icons present.');

// 2. Run Build
console.log('🏗️  Running build...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
} catch (error) {
  console.error('❌ Build failed.');
  process.exit(1);
}
console.log('✅ Build successful.');

// 3. Verify Manifest
console.log('🔍 Verifying manifest...');
const manifestPath = path.join(DIST_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ dist/manifest.json not found.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const requiredFields = ['name', 'version', 'description', 'icons'];
const missingFields = requiredFields.filter(field => !manifest[field]);

if (missingFields.length > 0) {
  console.error('❌ Manifest missing required fields:', missingFields.join(', '));
  process.exit(1);
}

// Verify manifest icons reference existing files in dist
const manifestIcons = manifest.icons || {};
const missingManifestIcons = Object.values(manifestIcons).filter(iconPath => {
    // iconPath is relative to dist root, e.g., "assets/icon-16.png"
    return !fs.existsSync(path.join(DIST_DIR, iconPath));
});

if (missingManifestIcons.length > 0) {
    console.error('❌ Manifest references missing files in dist:', missingManifestIcons.join(', '));
    process.exit(1);
}

console.log('✅ Manifest verification passed.');

// 4. Create Zip
console.log('📦 Creating zip artifact...');
const output = fs.createWriteStream(OUTPUT_ZIP);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(`✅ Artifact created: ${OUTPUT_ZIP} (${archive.pointer()} bytes)`);
  console.log('🎉 Packaging complete!');
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  Archiver warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);
archive.directory(DIST_DIR, false);
archive.finalize();
