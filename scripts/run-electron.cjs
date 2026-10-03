const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const electronPath = require('electron');

const env = { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' };
const extraArgs = process.argv.slice(2);
const args = ['.', ...extraArgs];

if (process.platform === 'linux') {
  env.ELECTRON_DISABLE_SANDBOX = '1';
  if (!args.includes('--no-sandbox')) {
    args.push('--no-sandbox');
  }

  // Detect phantom WAYLAND_DISPLAY (e.g. env var exists but socket doesn't)
  const waylandDisplay = env.WAYLAND_DISPLAY;
  if (waylandDisplay) {
    const xdgRuntimeDir = env.XDG_RUNTIME_DIR || `/run/user/${process.getuid ? process.getuid() : 1000}`;
    const waylandSocket = path.join(xdgRuntimeDir, waylandDisplay);
    if (!fs.existsSync(waylandSocket)) {
      delete env.WAYLAND_DISPLAY;
      if (!args.some(a => a.startsWith('--ozone-platform='))) {
        args.push('--ozone-platform=x11');
      }
    }
  }
}

const child = spawn(electronPath, args, {
  stdio: 'inherit',
  env
});

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
