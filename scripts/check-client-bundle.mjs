// Builds the app with a made-up API key, then fails if that key or the variable's name shows
// up in anything sent to the browser: client JavaScript (.next/static) and prerendered pages
// (HTML and RSC payloads under .next/server/app). Run: pnpm check:key
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const sentinel = `llk_bundle_check_${randomBytes(12).toString("hex")}`;
execFileSync("pnpm", ["exec", "next", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    LOOM_LOYALTY_API_URL: "https://api.example.com",
    LOOM_LOYALTY_API_KEY: sentinel,
    LOOM_LOYALTY_DEMO_CUSTOMER_EXTERNAL_ID: "bundle-check",
  },
});

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else yield path;
  }
}

const needles = [sentinel, "LOOM_LOYALTY_API_KEY"];
let scanned = 0;
const leaks = [];
const sentToBrowser = [
  ...files(".next/static"),
  ...[...files(".next/server/app")].filter((p) => /\.(html|rsc|body)$/.test(p)),
];
for (const path of sentToBrowser) {
  scanned += 1;
  const text = readFileSync(path, "latin1");
  for (const needle of needles) if (text.includes(needle)) leaks.push(`${path}: ${needle}`);
}

if (scanned === 0) {
  console.error("No files in .next/static; the check proved nothing.");
  process.exit(1);
}
if (leaks.length > 0) {
  console.error(`API key found in client files:\n${leaks.join("\n")}`);
  process.exit(1);
}
console.log(`OK: scanned ${scanned} client files; no API key or key variable name.`);
