import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const viteEntry = resolve(root, "node_modules", "vite", "bin", "vite.js");
const processes = [
  spawn(process.execPath, ["server.js"], { cwd: root, stdio: "inherit" }),
  spawn(process.execPath, [viteEntry], { cwd: root, stdio: "inherit" }),
];
let stopping = false;

function stopAll(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of processes) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
}

for (const child of processes) {
  child.on("error", (error) => {
    console.error("Could not start a development process:", error);
    stopAll(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      console.error(`A development process stopped (${signal ?? code ?? "unknown"}).`);
      stopAll(code ?? 1);
    }
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
