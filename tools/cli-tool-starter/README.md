# CLI Tool Template

Minimal command-line interface (CLI) template with argument parsing, config storage, and example commands. Use as a foundation for building domain-specific CLI tools.

## Features

- **Simple argument parser**: `--flag value` style arguments
- **Config storage**: Persists user data to `~/.config/my-cli/data.json`
- **Example commands**: Fetch, action, list, add — replace with your domain
- **Error handling**: Graceful exit codes and error messages
- **Portable**: Works on Linux, macOS, Windows

## Installation

```bash
# Copy the template
cp -r cli-tool-starter ~/my-cli
cd ~/my-cli

# Make executable
chmod +x src/cli_tool.js
```

## Usage

```bash
# Help
node src/cli_tool.js help

# Fetch a resource
node src/cli_tool.js fetch --resource users

# Perform an action
node src/cli_tool.js action --action create --id item-1 --data '{"name":"Item"}'

# List all items
node src/cli_tool.js list

# Add an item
node src/cli_tool.js add --name "my-item" --value "example"
```

## Directory Structure

```
cli-tool-starter/
├── tool.json           # Metadata & registration
├── src/
│   └── cli_tool.js     # Main CLI implementation
└── README.md           # This file
```

## Customization

### Add a New Command

1. **Define the command function** in `cli_tool.js`:

```javascript
async function cmdMyCommand(args) {
  const { param1, param2 } = args;
  console.log(`Running with ${param1} and ${param2}...`);
  return { ok: true, result: 'success' };
}
```

2. **Add a case** in the `main()` switch:

```javascript
case 'mycommand':
  result = await cmdMyCommand(opts);
  break;
```

3. **Update help text**:

```javascript
  mycommand          Description of my command
    --param1 STR     Parameter 1
    --param2 STR     Parameter 2
```

### Change Config Location

Edit the `CONFIG_DIR` constant:

```javascript
const CONFIG_DIR = path.join('/custom/path', 'my-cli');
```

### Add Config File Format

Modify `loadData()` and `saveData()` to use INI, YAML, or TOML instead of JSON.

## Argument Parsing

The parser handles:

```bash
# Key-value pairs
node cli_tool.js fetch --resource users --format json

# Boolean flags (value = true)
node cli_tool.js action --force

# JSON strings
node cli_tool.js action --data '{"key":"value"}'
```

Parsed into:

```javascript
{
  cmd: 'fetch',
  opts: { resource: 'users', format: 'json' }
}
```

## Error Handling

All commands should return an object with `ok` property:

```javascript
async function myCommand(args) {
  if (!args.required_param) {
    return { ok: false, error: 'Missing required parameter' };
  }
  try {
    const result = await doSomething();
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
```

The main loop handles errors:

```javascript
if (result && !result.ok) {
  console.error(`Error: ${result.error}`);
  process.exit(1);
}
```

## Configuration File Example

Default stored config:

```json
{
  "version": "1.0.0",
  "items": [
    {
      "id": "item-1234567890",
      "name": "my-item",
      "value": "example"
    }
  ]
}
```

Edit or delete to reset state.

## Integration with Scripts

Use in shell scripts or automation:

```bash
#!/bin/bash

# Create items
node cli_tool.js add --name "item-1" --value "value-1"
node cli_tool.js add --name "item-2" --value "value-2"

# List all
node cli_tool.js list | jq '.[]'

# Get exit code
node cli_tool.js fetch --resource missing
if [ $? -ne 0 ]; then
  echo "Fetch failed"
fi
```

## Debugging

Enable verbose output by adding logging:

```javascript
function parseArgs(argv) {
  const args = argv.slice(2);
  if (process.env.DEBUG) console.error('Args:', args);
  // ... rest of function
}
```

Run with:

```bash
DEBUG=1 node src/cli_tool.js fetch --resource test
```

## See Also

- [Commander.js](https://github.com/tj/commander.js/) — Full-featured CLI framework
- [Yargs](https://github.com/yargs/yargs) — Argument parsing library
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) — Interactive prompts

## License

MIT — Open source, use it wisely.
