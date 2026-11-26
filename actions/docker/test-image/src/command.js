import { spawn } from "node:child_process";
import { closeSync, openSync, writeSync } from "node:fs";

export class Command {
	constructor({ signal, timeout = 300_000 } = {}) {
		this.signal = signal;
		this.deadline = Date.now() + timeout;
	}

	async run(
		file,
		args,
		{ cwd, env, log, stdoutFile, quiet = true, allowFailure = false } = {},
	) {
		const remaining = this.deadline - Date.now();
		if (remaining <= 0 || this.signal?.aborted)
			throw new Error("Container test execution timed out or was cancelled.");
		const output = log ? openSync(log, "a", 0o600) : undefined;
		const report = stdoutFile ? openSync(stdoutFile, "w", 0o600) : undefined;
		try {
			return await new Promise((resolve, reject) => {
				const child = spawn(file, args, {
					cwd,
					env: { ...process.env, ...env },
					detached: true,
					stdio: ["ignore", "pipe", "pipe"],
				});
				let text = "";
				let interrupted = false;
				let force;
				const kill = (signal) => {
					if (!child.pid) return;
					try {
						process.kill(-child.pid, signal);
					} catch (error) {
						if (error.code !== "ESRCH") reject(error);
					}
				};
				const terminate = () => {
					interrupted = true;
					if (!child.pid) return;
					kill("SIGTERM");
					force = setTimeout(() => kill("SIGKILL"), 5_000);
					force.unref();
				};
				const timer = setTimeout(terminate, remaining);
				timer.unref();
				this.signal?.addEventListener("abort", terminate, { once: true });
				const capture = (data, stderr) => {
					if (output !== undefined) writeSync(output, data);
					if (report !== undefined && !stderr) writeSync(report, data);
					if (!quiet && (stderr || report === undefined))
						(stderr ? process.stderr : process.stdout).write(data);
					if (!stderr && text.length < 2_000_000) text += data.toString();
				};
				child.stdout.on("data", (data) => capture(data, false));
				child.stderr.on("data", (data) => capture(data, true));
				child.on("error", reject);
				child.on("close", (code, signal) => {
					clearTimeout(timer);
					clearTimeout(force);
					this.signal?.removeEventListener("abort", terminate);
					if (interrupted) kill("SIGKILL");
					if (interrupted)
						return reject(
							new Error("Container test execution timed out or was cancelled."),
						);
					if (code !== 0 && !allowFailure)
						return reject(
							new Error(
								`${file} exited with ${code ?? signal}. See the engine log for diagnostics.`,
							),
						);
					resolve({ code, stdout: text });
				});
			});
		} finally {
			if (output !== undefined) closeSync(output);
			if (report !== undefined) closeSync(report);
		}
	}
}
