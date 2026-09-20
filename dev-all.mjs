// Runs the Vite dev server and the backend together with one command,
// using only Node's built-in child_process — no extra dependency needed.
import { spawn } from 'node:child_process';

function run(name, command, args) {
  const shouldUseShell = process.platform === 'win32' && (command.endsWith('.cmd') || command.endsWith('.bat') || command.endsWith('.ps1'));
  const child = spawn(command, args, {
    stdio: 'pipe',
    shell: shouldUseShell,
    cwd: process.cwd(),
  });

  child.stdout.on('data', (d) => process.stdout.write(`[${name}] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[${name}] ${d}`));
  child.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
    process.exit(code || 0);
  });
  return child;
}

const backend = run('server', process.execPath, ['server/server.js']);
const frontend = run('vite', process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite']);

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
