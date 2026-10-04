#!/usr/bin/env node

/**
 * DURGAS POS - OPTIMIZED ELECTRON PACKAGING PIPELINE
 * 
 * Supports:
 * - Windows (win32-x64) Portable Folder → ZIP
 * - Linux (linux-x64) Portable Folder → ZIP
 * 
 * Optimizations:
 * - Clean production-only backend deps (npm install --omit=dev)
 * - Aggressive node_modules pruning (remove docs, maps, types, tests, unused)
 * - Removes unused Chromium locales (~45MB saved)
 * - Strips LICENSE/README/CHANGELOG bloat from node_modules
 * - Injects platform-specific pre-compiled SQLite3 native binaries
 * - Auto-versioning from releases/ directory
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASES_DIR = path.join(ROOT_DIR, 'releases');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const APP_NAME = 'durgas-billing-pos';
const DISPLAY_NAME = 'Durgas-Billing';

function log(emoji, message) {
  console.log(`\x1b[1m\x1b[36m${emoji} [RELEASE BUILDER]\x1b[0m ${message}`);
}

function success(message) {
  console.log(`\x1b[1m\x1b[32m✔ ${message}\x1b[0m`);
}

function warn(message) {
  console.log(`\x1b[1m\x1b[33m⚠ ${message}\x1b[0m`);
}

function error(message) {
  console.error(`\x1b[1m\x1b[31m✖ ${message}\x1b[0m`);
}

// ──────────────────────────────────────────────
//  VERSION MANAGEMENT
// ──────────────────────────────────────────────

function parseSemver(vStr) {
  const clean = vStr.replace(/^v/, '').trim();
  const parts = clean.split('.').map(n => parseInt(n, 10));
  return {
    major: isNaN(parts[0]) ? 1 : parts[0],
    minor: isNaN(parts[1]) ? 0 : parts[1],
    patch: isNaN(parts[2]) ? 0 : parts[2],
    raw: clean
  };
}

function compareSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function getExistingVersions() {
  if (!fs.existsSync(RELEASES_DIR)) {
    fs.mkdirSync(RELEASES_DIR, { recursive: true });
    return [];
  }
  const entries = fs.readdirSync(RELEASES_DIR, { withFileTypes: true });
  const versions = [];
  for (const entry of entries) {
    if (entry.isDirectory() && /^v?\d+\.\d+\.\d+$/.test(entry.name)) {
      versions.push(parseSemver(entry.name));
    }
  }
  versions.sort(compareSemver);
  return versions;
}

function determineNextVersion() {
  const existing = getExistingVersions();
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  const pkgVersion = parseSemver(pkg.version || '1.0.0');
  const args = process.argv.slice(2);
  const isMajor = args.includes('--major');
  const isMinor = args.includes('--minor');
  const setIndex = args.indexOf('--set');

  if (setIndex !== -1 && args[setIndex + 1]) {
    const custom = parseSemver(args[setIndex + 1]);
    return {
      version: `${custom.major}.${custom.minor}.${custom.patch}`,
      folderName: `v${custom.major}.${custom.minor}.${custom.patch}`,
      isFirst: false,
      previous: existing.length > 0 ? existing[existing.length - 1].raw : null
    };
  }

  if (existing.length === 0) {
    const vStr = `${pkgVersion.major}.${pkgVersion.minor}.${pkgVersion.patch}`;
    return { version: vStr, folderName: `v${vStr}`, isFirst: true, previous: null };
  }

  const highest = existing[existing.length - 1];
  let nextMajor = highest.major, nextMinor = highest.minor, nextPatch = highest.patch;

  if (isMajor) { nextMajor += 1; nextMinor = 0; nextPatch = 0; }
  else if (isMinor) { nextMinor += 1; nextPatch = 0; }
  else { nextPatch += 1; }

  const vStr = `${nextMajor}.${nextMinor}.${nextPatch}`;
  return { version: vStr, folderName: `v${vStr}`, isFirst: false, previous: highest.raw };
}

// ──────────────────────────────────────────────
//  FILE UTILITIES
// ──────────────────────────────────────────────

function copyDirSync(src, dest, filterFn = null) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (filterFn && !filterFn(srcPath, entry)) continue;
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, filterFn);
    } else if (entry.isSymbolicLink()) {
      // Resolve symlinks and copy actual files/folders to avoid breaking after prune
      try {
        const realPath = fs.realpathSync(srcPath);
        const stat = fs.statSync(realPath);
        if (stat.isDirectory()) {
          copyDirSync(realPath, destPath, filterFn);
        } else {
          fs.copyFileSync(realPath, destPath);
        }
      } catch (e) {
        // ignore broken symlinks
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findCachedElectronZip(platform) {
  const cacheBase = path.join(os.homedir(), '.cache/electron');
  if (!fs.existsSync(cacheBase)) return null;
  const targetPattern = platform === 'win32' ? 'win32-x64.zip' : 'linux-x64.zip';

  function search(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        const found = search(full);
        if (found) return found;
      } else if (f.isFile() && f.name.includes(targetPattern)) {
        return full;
      }
    }
    return null;
  }
  return search(cacheBase);
}

/**
 * Get total size of a directory in bytes
 */
function getDirSizeBytes(dirPath) {
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      totalSize += getDirSizeBytes(fullPath);
    } else if (entry.isFile()) {
      totalSize += fs.statSync(fullPath).size;
    }
  }
  return totalSize;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ──────────────────────────────────────────────
//  NODE_MODULES OPTIMIZATION
// ──────────────────────────────────────────────

/**
 * Aggressively prune node_modules to remove unnecessary files.
 * This can save 40-60% of node_modules size.
 */
function pruneNodeModules(nodeModulesDir) {
  if (!fs.existsSync(nodeModulesDir)) return;

  const sizeBefore = getDirSizeBytes(nodeModulesDir);
  let removedFiles = 0;
  let removedDirs = 0;

  // File patterns to delete (case-insensitive matching)
  const deleteFilePatterns = [
    /\.md$/i,
    /\.markdown$/i,
    /\.txt$/i,
    /\.map$/i,           // Source maps
    /\.ts$/i,            // TypeScript source files (not .d.ts we handle separately)
    /\.d\.ts$/i,         // TypeScript declarations
    /\.mts$/i,
    /\.cts$/i,
    /\.coffee$/i,
    /\.flow$/i,
    /\.gyp$/i,
    /\.gypi$/i,
    /Makefile$/i,
    /\.mk$/i,
    /\.c$/i,             // C source files (native modules already compiled)
    /\.cc$/i,
    /\.cpp$/i,
    /\.h$/i,
    /\.hpp$/i,
    /\.o$/i,
    /\.obj$/i,
    /\.yml$/i,
    /\.yaml$/i,
    /\.eslintrc/i,
    /\.prettierrc/i,
    /\.editorconfig$/i,
    /\.jshintrc/i,
    /\.npmignore$/i,
    /\.gitattributes$/i,
    /\.travis\.yml$/i,
    /appveyor\.yml$/i,
    /\.coveralls\.yml$/i,
    /\.babelrc/i,
    /tsconfig.*\.json$/i,
    /jest\.config/i,
    /\.nyc_output/i,
    /\.github/i,
    /\.vscode/i,
    /\.tar\.gz$/i,       // sqlite-autoconf tarballs
  ];

  // Exact filenames to delete (case-insensitive)
  const deleteExactNames = new Set([
    'readme.md', 'readme', 'readme.txt', 'readme.markdown',
    'changelog.md', 'changelog', 'changelog.txt',
    'history.md', 'history', 'history.txt',
    'changes.md', 'changes',
    'contributing.md', 'contributing',
    'authors', 'contributors',
    '.npmrc', '.eslintrc.json', '.eslintrc.js',
    '.prettierrc.json', '.prettierrc.js',
    'makefile', 'cmakelists.txt',
    '.editorconfig', '.gitattributes',
    'license.md', 'licence.md',
    'binding.gyp',
    '.package-lock.json',
  ]);

  // Directory names to delete entirely
  const deleteDirNames = new Set([
    'test', 'tests', '__tests__',
    'spec', 'specs',
    'example', 'examples',
    'doc', 'docs', 'documentation',
    'benchmark', 'benchmarks',
    'coverage', '.nyc_output',
    '.github', '.vscode', '.idea',
    'man',
    'scripts',         // build scripts in deps
    'src',             // source code (we only need compiled output)
    'prebuilds',       // pre-built binaries (we inject our own)
    'prebuilt',
    'build',           // native build artifacts (we inject our own sqlite3)
    'node-gyp',        // build tool
    'node-pre-gyp',    // build tool
    'prebuild-install',
    'deps',            // sqlite3 deps (contains tarballs)
    '.pnpm',           // pnpm virtual store (not needed inside packaged app)
    '.ignored',        // ignored packages
    '.bin',            // binary symlinks (breaks electron-builder 7z compression)
  ]);

  // Entire packages to remove (not needed at runtime)
  const deletePackages = new Set([
    'mongodb',           // Not used - phantom dep from sequelize
    'mongodb-connection-string-url',
    '@mongodb-js',
    'bson',
    'kerberos',
    'saslprep',
    'sparse-bitfield',
    'memory-pager',
    'whatwg-url',
    'webidl-conversions',
    'tr46',
    'codepage',          // Not used
    'cloudinary-core',   // Not used
    'moment',            // Heavy - not used by backend
    'moment-timezone',   // Heavy - not used by backend
    'node-gyp',          // Build tool only
    'tar',               // Used by node-gyp only
    'minipass',
    'minizlib',
    'yallist',
    'nopt',
    'abbrev',
    'node-addon-api',    // Build headers only
    'prebuild-install',
    'node-abi',
    'detect-libc',
    'github-from-package',
    'napi-build-utils',
    'tar-fs',
    'tar-stream',
    'pump',
    'bl',
    'readable-stream',   // Old streams polyfill
    'core-util-is',
    'inherits',
    'isarray',
    'process-nextick-args',
    'string_decoder',
    'util-deprecate',
    'safe-buffer',
    'core-js',           // Polyfill not needed for Electron's modern Node
    'regenerator-runtime',
    '@types',            // TypeScript types not needed at runtime
    'undici',            // HTTP client not needed
  ]);

  function shouldDeleteDir(dirName, parentPath) {
    if (deleteDirNames.has(dirName.toLowerCase())) return true;
    // Check if entire package should be removed
    const rel = path.relative(nodeModulesDir, parentPath);
    const parts = rel.split(path.sep);
    // Top-level package check
    if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) {
      if (deletePackages.has(dirName)) return true;
      // Handle scoped packages
      if (dirName.startsWith('@')) {
        if (deletePackages.has(dirName)) return true;
      }
    }
    return false;
  }

  function shouldDeleteFile(fileName) {
    const lower = fileName.toLowerCase();
    if (deleteExactNames.has(lower)) return true;
    for (const pattern of deleteFilePatterns) {
      if (pattern.test(fileName)) return true;
    }
    return false;
  }

  function pruneDir(dir, depth = 0) {
    if (!fs.existsSync(dir)) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Check if this directory should be entirely removed
        if (shouldDeleteDir(entry.name, dir)) {
          try {
            fs.rmSync(fullPath, { recursive: true, force: true });
            removedDirs++;
          } catch (e) { /* ignore */ }
          continue;
        }
        // Recurse into remaining directories
        pruneDir(fullPath, depth + 1);

        // Remove empty directories after pruning
        try {
          const remaining = fs.readdirSync(fullPath);
          if (remaining.length === 0) {
            fs.rmdirSync(fullPath);
            removedDirs++;
          }
        } catch (e) { /* ignore */ }
      } else if (entry.isFile()) {
        if (shouldDeleteFile(entry.name)) {
          try {
            fs.unlinkSync(fullPath);
            removedFiles++;
          } catch (e) { /* ignore */ }
        }
      }
    }
  }

  // First pass: remove entire unwanted packages
  for (const pkgName of deletePackages) {
    const pkgPath = path.join(nodeModulesDir, pkgName);
    if (fs.existsSync(pkgPath)) {
      try {
        fs.rmSync(pkgPath, { recursive: true, force: true });
        removedDirs++;
      } catch (e) { /* ignore */ }
    }
  }

  // Second pass: prune files and directories
  pruneDir(nodeModulesDir);

  const sizeAfter = getDirSizeBytes(nodeModulesDir);
  const saved = sizeBefore - sizeAfter;

  success(`Pruned node_modules: ${formatSize(sizeBefore)} → ${formatSize(sizeAfter)} (saved ${formatSize(saved)})`);
  success(`  Removed ${removedFiles} files, ${removedDirs} directories`);
}

/**
 * Create a minimal backend with only production dependencies.
 * Copies backend source files, then does a fresh npm install --omit=dev,
 * or falls back to copying+pruning existing node_modules.
 */
function assembleCleanBackend(appResourceDir) {
  const backendSrc = path.join(ROOT_DIR, 'backend');
  const backendDest = path.join(appResourceDir, 'backend');

  // Copy backend source files (excluding node_modules, tests, temp files)
  log('📂', 'Copying backend source files...');
  copyDirSync(backendSrc, backendDest, (p, entry) => {
    const name = entry.name;
    if (name === 'node_modules') return false;
    if (name === 'tests' || name === '__tests__') return false;
    if (name === '.sqlite-wal' || name === '.sqlite-shm') return false;
    if (p.endsWith('.sqlite-wal') || p.endsWith('.sqlite-shm')) return false;
    return true;
  });

  // Try clean npm install first
  log('📚', 'Installing production-only backend dependencies...');
  try {
    execSync('npm install --omit=dev --ignore-scripts --no-optional', {
      cwd: backendDest,
      stdio: 'pipe',
      timeout: 30000,
    });
    success('Clean production install succeeded');
  } catch (err) {
    warn('npm install failed (network issue), falling back to copy+prune...');
    // Fallback: copy existing node_modules and aggressively prune
    copyDirSync(
      path.join(backendSrc, 'node_modules'),
      path.join(backendDest, 'node_modules'),
      (p, entry) => {
        if (entry.name === '.pnpm') return false; // skip virtual store, symlinks resolve directly
        return true;
      }
    );
  }

  // Always prune regardless of install method
  log('🧹', 'Pruning node_modules (removing docs, tests, types, unused packages)...');
  pruneNodeModules(path.join(backendDest, 'node_modules'));

  // Verify key dependencies exist
  const requiredDeps = ['express', 'sequelize', 'sqlite3', 'cors', 'bcryptjs', 'jsonwebtoken', 'dotenv'];
  const missingDeps = requiredDeps.filter(dep =>
    !fs.existsSync(path.join(backendDest, 'node_modules', dep))
  );
  if (missingDeps.length > 0) {
    warn(`Missing backend dependencies after prune: ${missingDeps.join(', ')}`);
  } else {
    success('All required backend dependencies verified');
  }

  // Report final size
  const finalSize = getDirSizeBytes(path.join(backendDest, 'node_modules'));
  const fileCount = countFiles(path.join(backendDest, 'node_modules'));
  log('📊', `Final backend node_modules: ${formatSize(finalSize)}, ${fileCount} files`);
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

// ──────────────────────────────────────────────
//  PLATFORM BUILDERS
// ──────────────────────────────────────────────

function buildWindowsPackage(releaseVersionDir, version) {
  const targetFolderName = `${DISPLAY_NAME}-v${version}-Windows`;
  const appPackageDir = path.join(releaseVersionDir, targetFolderName);
  fs.mkdirSync(appPackageDir, { recursive: true });

  log('🪟', `Building Windows 64-bit Package...`);

  // 1. Extract Electron runtime
  const localElectronDist = path.join(ROOT_DIR, 'node_modules/electron/dist');
  if (fs.existsSync(path.join(localElectronDist, 'electron.exe'))) {
    log('📦', `Using installed Electron runtime from node_modules/electron/dist...`);
    copyDirSync(localElectronDist, appPackageDir);
  } else {
    const winZip = findCachedElectronZip('win32');
    if (!winZip || !fs.existsSync(winZip)) {
      throw new Error('Windows Electron binary not found in node_modules/electron/dist or cache. Run: node node_modules/electron/install.js');
    }
    log('📦', `Extracting Electron runtime from ${path.basename(winZip)}...`);
    try {
      execSync(`tar -xf "${winZip}" -C "${appPackageDir}"`, { stdio: 'inherit' });
    } catch {
      execSync(`powershell -Command "Expand-Archive -Path '${winZip}' -DestinationPath '${appPackageDir}' -Force"`, { stdio: 'inherit' });
    }
  }

  // 2. Rename executable
  const oldExe = path.join(appPackageDir, 'electron.exe');
  const newExe = path.join(appPackageDir, `${DISPLAY_NAME}.exe`);
  if (fs.existsSync(oldExe)) {
    fs.renameSync(oldExe, newExe);
    success(`Renamed executable to ${DISPLAY_NAME}.exe`);
  }

  // 3. Remove default_app.asar
  const defaultAppAsar = path.join(appPackageDir, 'resources/default_app.asar');
  if (fs.existsSync(defaultAppAsar)) {
    fs.unlinkSync(defaultAppAsar);
    success('Removed default_app.asar');
  }

  // 4. Assemble resources/app with optimized backend
  const appResourceDir = path.join(appPackageDir, 'resources/app');
  fs.mkdirSync(appResourceDir, { recursive: true });

  copyDirSync(path.join(ROOT_DIR, 'dist'), path.join(appResourceDir, 'dist'));
  copyDirSync(path.join(ROOT_DIR, 'electron'), path.join(appResourceDir, 'electron'));
  copyDirSync(path.join(ROOT_DIR, 'public'), path.join(appResourceDir, 'public'));

  assembleCleanBackend(appResourceDir);

  // 5. Inject Windows SQLite Native Binary
  let winSqliteBinary = path.join(ROOT_DIR, 'scripts/binaries/win32-x64/build/Release/node_sqlite3.node');
  if (!fs.existsSync(winSqliteBinary)) {
    const backendSqlite = path.join(ROOT_DIR, 'backend/node_modules/sqlite3/build/Release/node_sqlite3.node');
    if (fs.existsSync(backendSqlite)) {
      winSqliteBinary = backendSqlite;
    }
  }

  if (fs.existsSync(winSqliteBinary)) {
    log('🔧', 'Injecting Windows-native SQLite3 binary...');
    
    // Clear out existing linux bindings to prevent 7za broken symlink/missing file errors
    const sqliteBindingPath = path.join(appResourceDir, 'backend/node_modules/sqlite3/lib/binding');
    const sqliteBuildPath = path.join(appResourceDir, 'backend/node_modules/sqlite3/build');
    if (fs.existsSync(sqliteBindingPath)) fs.rmSync(sqliteBindingPath, { recursive: true, force: true });
    if (fs.existsSync(sqliteBuildPath)) fs.rmSync(sqliteBuildPath, { recursive: true, force: true });

    const targetDirs = [
      path.join(appResourceDir, 'backend/node_modules/sqlite3/build/Release'),
      path.join(appResourceDir, 'backend/node_modules/sqlite3/lib/binding'),
      path.join(appResourceDir, 'backend/node_modules/sqlite3/lib/binding/napi-v6-win32-x64'),
    ];
    for (const d of targetDirs) {
      try {
        fs.mkdirSync(d, { recursive: true });
        fs.copyFileSync(winSqliteBinary, path.join(d, 'node_sqlite3.node'));
      } catch (e) { /* ignore */ }
    }
    success('Windows SQLite native binary injected');
  } else {
    warn('Windows sqlite3 binary not found in scripts/binaries/win32-x64 or backend/node_modules');
  }

  // 6. Write minimal package.json
  const appPkg = {
    name: APP_NAME,
    productName: 'Durgas - POS Billing',
    version: version,
    main: 'electron/main.cjs',
    description: 'Offline POS Billing System',
    author: 'Makjuz Tech'
  };
  fs.writeFileSync(path.join(appResourceDir, 'package.json'), JSON.stringify(appPkg, null, 2));

  // 7. Remove unused Chromium locales (~45MB saved)
  removeUnusedLocales(appPackageDir);

  // 8. Remove unnecessary Electron files
  removeUnnecessaryElectronFiles(appPackageDir);

  // 9. Create Single .exe using electron-builder
  log('🗜️', `Packaging Single Windows Executable (.exe)...`);
  let finalExePath = null;
  const builderConfigPath = path.join(releaseVersionDir, 'electron-builder-win.yml');
  
  try {
    const builderConfig = `
appId: com.makjuz.durgasbilling
productName: ${DISPLAY_NAME}
directories:
  output: "${releaseVersionDir.replace(/\\/g, '/')}"
win:
  target: nsis
  icon: "public/logo.png"
nsis:
  artifactName: "\${productName}-v\${version}-Setup.exe"
  oneClick: false
  allowToChangeInstallationDirectory: true
`;
    fs.writeFileSync(builderConfigPath, builderConfig.trim());
    // Attempt to build a setup .exe
    execSync(`npx -y electron-builder --prepackaged "${appPackageDir}" --win nsis --config "${builderConfigPath}"`, { 
      stdio: 'inherit',
      env: { ...process.env, WINEPREFIX: path.join(require('os').homedir(), '.cache', 'wine-billing-pos') }
    });
    const finalExeName = `${DISPLAY_NAME}-v${version}-Setup.exe`;
    finalExePath = path.join(releaseVersionDir, finalExeName);
    
    if (fs.existsSync(finalExePath)) {
      const stats = fs.statSync(finalExePath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
      success(`✅ Single Windows Executable: ${finalExeName} (${sizeMb} MB)`);
    }
  } catch (err) {
    warn(`Single .exe build blocked by network (electron-builder needs internet). Falling back to ZIP...`);
    const zipName = `${DISPLAY_NAME}-v${version}-Windows.zip`;
    finalExePath = path.join(releaseVersionDir, zipName);
    try {
      execSync(`tar -a -c -f "${zipName}" "${targetFolderName}"`, { cwd: releaseVersionDir, stdio: 'inherit' });
    } catch {
      execSync(`powershell -Command "Compress-Archive -Path '${path.join(releaseVersionDir, targetFolderName)}' -DestinationPath '${finalExePath}' -Force"`, { stdio: 'inherit' });
    }
    if (fs.existsSync(finalExePath)) {
      const stats = fs.statSync(finalExePath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
      success(`✅ Windows Build (ZIP Fallback): ${zipName} (${sizeMb} MB)`);
    }
  }

  // Cleanup staging and temp configs
  fs.rmSync(appPackageDir, { recursive: true, force: true });
  fs.rmSync(builderConfigPath, { force: true });
  const yamlConfig = path.join(releaseVersionDir, 'builder-effective-config.yaml');
  if (fs.existsSync(yamlConfig)) fs.rmSync(yamlConfig, { force: true });

  return {
    platform: 'Windows x64',
    format: finalExePath.endsWith('.exe') ? 'Single Executable (.exe)' : 'Portable Folder (.zip)',
    executable: finalExePath
  };
}

function buildLinuxPackage(releaseVersionDir, version) {
  const targetFolderName = `${DISPLAY_NAME}-v${version}-Linux`;
  const appPackageDir = path.join(releaseVersionDir, targetFolderName);
  fs.mkdirSync(appPackageDir, { recursive: true });

  log('🐧', `Building Linux 64-bit Package...`);

  // 1. Extract Electron runtime
  const linuxZip = findCachedElectronZip('linux');
  if (!linuxZip || !fs.existsSync(linuxZip)) {
    throw new Error('Linux Electron binary zip not found in cache.');
  }

  log('📦', `Extracting Electron runtime from ${path.basename(linuxZip)}...`);
  execSync(`unzip -q -o "${linuxZip}" -d "${appPackageDir}"`, { stdio: 'inherit' });

  // Set up executable names
  const electronBin = path.join(appPackageDir, 'electron');
  const appNameBin = path.join(appPackageDir, DISPLAY_NAME);
  if (fs.existsSync(electronBin)) {
    fs.copyFileSync(electronBin, appNameBin);
    fs.chmodSync(appNameBin, 0o755);
  }

  // 2. Remove default_app.asar
  const defaultAppAsar = path.join(appPackageDir, 'resources/default_app.asar');
  if (fs.existsSync(defaultAppAsar)) {
    fs.unlinkSync(defaultAppAsar);
    success('Removed default_app.asar');
  }

  // 3. Assemble resources/app with optimized backend
  const appResourceDir = path.join(appPackageDir, 'resources/app');
  fs.mkdirSync(appResourceDir, { recursive: true });

  copyDirSync(path.join(ROOT_DIR, 'dist'), path.join(appResourceDir, 'dist'));
  copyDirSync(path.join(ROOT_DIR, 'electron'), path.join(appResourceDir, 'electron'));
  copyDirSync(path.join(ROOT_DIR, 'public'), path.join(appResourceDir, 'public'));

  assembleCleanBackend(appResourceDir);

  // 4. Inject Linux SQLite Native Binary
  const linuxSqliteBinary = path.join(ROOT_DIR, 'scripts/binaries/linux-x64/build/Release/node_sqlite3.node');
  if (fs.existsSync(linuxSqliteBinary)) {
    log('🔧', 'Injecting Linux-native SQLite3 binary...');
    const targetDirs = [
      path.join(appResourceDir, 'backend/node_modules/sqlite3/build/Release'),
      path.join(appResourceDir, 'backend/node_modules/sqlite3/lib/binding'),
      path.join(appResourceDir, 'backend/node_modules/sqlite3/lib/binding/napi-v6-linux-x64'),
    ];
    for (const d of targetDirs) {
      try {
        fs.mkdirSync(d, { recursive: true });
        fs.copyFileSync(linuxSqliteBinary, path.join(d, 'node_sqlite3.node'));
      } catch (e) { /* ignore */ }
    }
    success('Linux SQLite native binary injected');
  } else {
    warn('Linux sqlite3 binary not found in scripts/binaries/linux-x64');
  }

  // 5. Write minimal package.json
  const appPkg = {
    name: APP_NAME,
    productName: 'Durgas - POS Billing',
    version: version,
    main: 'electron/main.cjs',
    description: 'Offline POS Billing System',
    author: 'Makjuz Tech'
  };
  fs.writeFileSync(path.join(appResourceDir, 'package.json'), JSON.stringify(appPkg, null, 2));

  // 6. Remove unused Chromium locales
  removeUnusedLocales(appPackageDir);

  // 7. Remove unnecessary Electron files
  removeUnnecessaryElectronFiles(appPackageDir);

  // 8. Create ZIP
  const zipName = `${DISPLAY_NAME}-v${version}-Linux.zip`;
  const zipPath = path.join(releaseVersionDir, zipName);
  log('🗜️', `Creating optimized Linux ZIP...`);
  execSync(`cd "${releaseVersionDir}" && zip -q -r -9 "${zipName}" "${targetFolderName}"`, { stdio: 'inherit' });

  // Cleanup staging
  fs.rmSync(appPackageDir, { recursive: true, force: true });

  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
    success(`✅ Linux Build: ${zipName} (${sizeMb} MB)`);
  }

  return {
    platform: 'Linux x64',
    format: 'Portable Folder (.zip)',
    executable: zipPath
  };
}

// ──────────────────────────────────────────────
//  CLEANUP HELPERS
// ──────────────────────────────────────────────

function removeUnusedLocales(appPackageDir) {
  const localesDir = path.join(appPackageDir, 'locales');
  if (!fs.existsSync(localesDir)) return;

  const keepLocales = new Set(['en-US.pak', 'en-GB.pak', 'ta.pak']);
  const files = fs.readdirSync(localesDir);
  let removed = 0;
  for (const file of files) {
    if (!keepLocales.has(file)) {
      fs.unlinkSync(path.join(localesDir, file));
      removed++;
    }
  }
  success(`Removed ${removed} unused Chromium locale files`);
}

function removeUnnecessaryElectronFiles(appPackageDir) {
  // Remove large files that aren't strictly needed
  const filesToRemove = [
    'LICENSES.chromium.html',   // ~20MB license text
    'LICENSE',
    'version',
  ];

  let removed = 0;
  for (const f of filesToRemove) {
    const fPath = path.join(appPackageDir, f);
    if (fs.existsSync(fPath)) {
      fs.unlinkSync(fPath);
      removed++;
    }
  }
  if (removed > 0) {
    success(`Removed ${removed} unnecessary Electron files (~20MB saved)`);
  }
}

// ──────────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────────

async function run() {
  console.log('\n=============================================================');
  console.log('   DURGAS POS - OPTIMIZED ELECTRON RELEASE BUILDER');
  console.log('=============================================================\n');

  const args = process.argv.slice(2);
  const isWin = process.platform === 'win32';
  const winOnly = args.includes('--win-only') || (isWin && !args.includes('--all') && !args.includes('--linux-only'));
  const linuxOnly = args.includes('--linux-only');

  const targetWindows = !linuxOnly;
  const targetLinux = !winOnly;

  // 1. Determine Version
  const { version, folderName, isFirst, previous } = determineNextVersion();

  if (isFirst) {
    log('🚀', `Initial release: ${folderName}`);
  } else {
    log('🔄', `Previous: ${previous} → New: \x1b[32m${folderName}\x1b[0m`);
  }

  const releaseVersionDir = path.join(RELEASES_DIR, folderName);
  log('📁', `Output: ${releaseVersionDir}`);

  if (fs.existsSync(releaseVersionDir)) {
    fs.rmSync(releaseVersionDir, { recursive: true, force: true });
  }
  fs.mkdirSync(releaseVersionDir, { recursive: true });

  // 2. Update package.json version
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    pkg.version = version;
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n');
    success(`Updated package.json to v${version}`);
  } catch (err) {
    warn(`Could not update package.json: ${err.message}`);
  }

  // 3. Build Frontend
  log('⚡', 'Building production frontend (Vite)...');
  execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
  success('Frontend build complete');

  const outputs = [];

  // 4. Build targets
  if (targetWindows) {
    console.log('\n─── WINDOWS BUILD ─────────────────────────────────────────\n');
    const result = buildWindowsPackage(releaseVersionDir, version);
    if (result.executable) outputs.push(result);
  }

  if (targetLinux) {
    console.log('\n─── LINUX BUILD ───────────────────────────────────────────\n');
    const result = buildLinuxPackage(releaseVersionDir, version);
    if (result.executable) outputs.push(result);
  }

  // 5. Create Release Manifest
  const manifest = {
    appName: DISPLAY_NAME,
    version: version,
    previousVersion: previous,
    buildDate: new Date().toISOString(),
    outputs: outputs.map(o => ({
      platform: o.platform,
      format: o.format,
      file: path.basename(o.executable),
      size: `${(fs.statSync(o.executable).size / (1024 * 1024)).toFixed(1)} MB`
    })),
    instructions: {
      windows: 'Extract ZIP → Double-click Durgas-Billing.exe',
      linux: 'Extract ZIP → chmod +x Durgas-Billing → ./Durgas-Billing'
    }
  };

  fs.writeFileSync(
    path.join(releaseVersionDir, 'release-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Summary
  console.log('\n=============================================================');
  console.log(`✨ BUILD COMPLETED: \x1b[32m${folderName}\x1b[0m`);
  console.log('=============================================================');
  console.log(`📁 ${releaseVersionDir}\n`);
  for (const out of outputs) {
    const size = `${(fs.statSync(out.executable).size / (1024 * 1024)).toFixed(1)} MB`;
    console.log(`  ${out.platform}: ${path.basename(out.executable)} (${size})`);
  }
  console.log('\n=============================================================\n');
}

run().catch((err) => {
  error(`Build failed: ${err.stack || err.message}`);
  process.exit(1);
});
