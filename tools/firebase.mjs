// Firebase-CLI (emulator) starten met Java: gebruikt JAVA_HOME of de losse Java in ~/tools/java als die er is.
// Gebruik: node tools/firebase.mjs <firebase-argumenten>   (bv. emulators:start, emulators:exec "…")
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const env = { ...process.env };
const losseJava = path.join(homedir(), 'tools', 'java');
if (!env.JAVA_HOME && existsSync(path.join(losseJava, 'bin'))) {
  env.JAVA_HOME = losseJava;
  env.PATH = `${path.join(losseJava, 'bin')}${path.delimiter}${env.PATH ?? env.Path ?? ''}`;
  env.Path = env.PATH;
}
// Rechtstreeks (zonder shell), zodat argumenten met spaties heel blijven.
const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
const kind = spawn(process.execPath, [cli, ...process.argv.slice(2)], { stdio: 'inherit', env });
kind.on('exit', (code) => process.exit(code ?? 1));
