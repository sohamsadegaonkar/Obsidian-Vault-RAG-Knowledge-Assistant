declare namespace Cloudflare {
  interface Env {
    GEMINI_API_KEY?: string;
    // Optional starter binding. VaultMind does not use a database.
    DB?: D1Database;
  }
}
