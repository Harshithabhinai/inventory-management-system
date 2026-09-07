import "dotenv/config";
import { seedDatabase } from "./seed";
import { pool } from "./index";

async function main() {
  console.log("Seeding database...");
  try {
    const res = await seedDatabase();
    console.log("Seeding finished successfully:", res);
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  } finally {
    try {
      if (pool && typeof pool.end === "function") await pool.end();
    } catch (e) {
      // ignore
    }
  }
}

main();
