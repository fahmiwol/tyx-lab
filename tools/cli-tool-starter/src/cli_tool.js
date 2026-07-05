#!/usr/bin/env node
/**
 * CLI Tool Skeleton
 * Minimal command-line interface template
 * 
 * Usage:
 *   node cli_tool.js --help
 *   node cli_tool.js fetch --resource users
 *   node cli_tool.js action --action create --id item-1 --data '{"name":"Item"}'
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Config & State
// ============================================

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.config', 'my-cli');
const DATA_FILE = path.join(CONFIG_DIR, 'data.json');

function ensureConfig() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadData() {
  ensureConfig();
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return { version: '1.0.0', items: [] };
}

function saveData(data) {
  ensureConfig();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ============================================
// Commands
// ============================================

async function cmdFetch(args) {
  const resource = args.resource || 'unknown';
  console.log(`Fetching ${resource}...`);
  // Replace with actual API call
  return { ok: true, resource, data: { sample: true } };
}

async function cmdAction(args) {
  const { action, id, data } = args;
  console.log(`Running action: ${action} on ${id || 'new'}...`);
  const payload = data ? JSON.parse(typeof data === 'string' ? data : JSON.stringify(data)) : {};
  return { ok: true, action, id: id || 'new-' + Date.now(), result: payload };
}

async function cmdList(args) {
  const db = loadData();
  console.log(JSON.stringify(db.items, null, 2));
}

async function cmdAdd(args) {
  const { name, value } = args;
  const db = loadData();
  db.items.push({ id: 'item-' + Date.now(), name, value });
  saveData(db);
  console.log(`Added: ${name}`);
}

async function cmdHelp() {
  console.log(`
CLI Tool Skeleton v1.0.0

Commands:
  fetch              Fetch a resource
    --resource STR   Resource ID/name
  
  action             Perform an action
    --action STR     Action type (create/update/delete)
    --id STR         Resource ID
    --data JSON      Action payload
  
  list               List all items
  
  add                Add an item
    --name STR       Item name
    --value STR      Item value
  
  help               Show this message

Environment:
  Config stored in: ${DATA_FILE}

Examples:
  node cli_tool.js fetch --resource users
  node cli_tool.js action --action create --id item-1 --data '{"name":"Test"}'
  node cli_tool.js add --name "my-item" --value "example"
  node cli_tool.js list
`);
}

// ============================================
// Argument Parser
// ============================================

function parseArgs(argv) {
  const args = argv.slice(2);
  const cmd = args[0] || 'help';
  const opts = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      opts[key] = args[i + 1] || true;
      i++;
    }
  }

  return { cmd, opts };
}

// ============================================
// Main
// ============================================

async function main() {
  const { cmd, opts } = parseArgs(process.argv);

  try {
    let result;

    switch (cmd) {
      case 'fetch':
        result = await cmdFetch(opts);
        break;
      case 'action':
        result = await cmdAction(opts);
        break;
      case 'list':
        result = await cmdList(opts);
        break;
      case 'add':
        result = await cmdAdd(opts);
        break;
      case 'help':
      default:
        await cmdHelp();
        process.exit(0);
    }

    if (result && !result.ok) {
      console.error(`Error: ${result.error || 'Unknown error'}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`Unexpected error: ${e.message || e}`);
    process.exit(1);
  }
}

main();
