import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function run(args) { return spawnSync(process.execPath, ['./bin/pm-ai.js', ...args], { encoding: 'utf8' }); }

test('help works', () => { const result = run(['--help']); assert.equal(result.status, 0); assert.match(result.stdout, /Product Management AI CLI/); });
test('skills list works', () => { const result = run(['skills']); assert.equal(result.status, 0); assert.match(result.stdout, /principal-pm/); });
test('diagnose works', () => { const result = run(['diagnose','--input','examples/sample-brief.md']); assert.equal(result.status, 0); assert.match(result.stdout, /Diagnóstico Product Management AI/); });
test('doctor works', () => { const result = run(['doctor']); assert.equal(result.status, 0); assert.match(result.stdout, /Status: \*\*OK\*\*/); });


test('analyze-repo works', () => { const result = run(['analyze-repo','--path','examples','--output','.pm-ai/outputs/test-analysis.json','--report','.pm-ai/outputs/test-analysis.md','--visual','.pm-ai/outputs/test-analysis.html']); assert.equal(result.status, 0); assert.match(result.stdout, /\"ok\": true/); });
