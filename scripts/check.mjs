import fs from 'node:fs';
const required = ['README.md','package.json','bin/pm-ai.js','lib/core.js','lib/registry.js','AGENTS.md','docs/getting-started.md','skills/principal-pm/skill.md','templates/prd.md'];
let ok = true;
for (const file of required) { if (!fs.existsSync(file)) { console.error("missing: " + file); ok = false; } }
if (!ok) process.exit(1);
console.log("repository structure ok");
