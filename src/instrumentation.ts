export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logEnvDetection } = await import("./lib/system-status");
    logEnvDetection();
  }
}
