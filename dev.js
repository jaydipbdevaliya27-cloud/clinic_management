/**
 * dev.js — Starts both backend and frontend concurrently with prefixed console output.
 */
const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function run(name, cmd, args, cwd, color) {
    const proc = spawn(cmd, args, { cwd, shell: isWin, stdio: ['inherit', 'pipe', 'pipe'] });

    const prefix = `${color}[${name}]\x1b[0m `;

    proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(l => {
            if (l.trim()) console.log(prefix + l);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(l => {
            if (l.trim()) console.error(prefix + l);
        });
    });

    proc.on('close', (code) => {
        console.log(`${prefix}exited with code ${code}`);
    });

    return proc;
}

console.log('\x1b[36m🚀 Starting Clinic Management System (Backend + Frontend)...\x1b[0m\n');

const backend = run('backend', 'node', ['server.js'], path.join(__dirname, 'backend'), '\x1b[32m');
const frontend = run('frontend', npmCmd, ['run', 'dev'], path.join(__dirname, 'frontend'), '\x1b[35m');

process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
});

