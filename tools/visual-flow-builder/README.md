# Visual Flow Builder

Browser-based visual flow builder for composing multi-step workflows. Drag-and-drop steps, configure parameters, save as JSON, and execute flows. No backend required — everything runs in the browser.

## Features

- **Visual interface**: Drag-drop workflow builder with live preview
- **Step types**: Fetch, Transform, Action, Condition, Delay — extend as needed
- **Parameter editing**: JSON input for each step
- **Save workflows**: Export as JSON for storage or integration
- **Execute flows**: Run workflows directly or via API integration
- **Dark theme**: Professional dark UI with accessibility features
- **No backend**: Pure HTML/CSS/JavaScript — no server dependency

## Quick Start

1. **Open in browser**:
   ```bash
   # Option 1: Direct file open
   open index.html

   # Option 2: Serve locally
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **Build a workflow**:
   - Enter workflow name
   - Select a step type from dropdown
   - Enter step parameters as JSON
   - Click "Add Step"
   - Repeat for additional steps

3. **Save workflow**:
   - Click "Save Workflow"
   - Browser downloads JSON file

4. **Run workflow**:
   - Click "Run Workflow"
   - (Currently shows preview; extend with backend integration)

## Workflow JSON Format

Saved workflows are plain JSON:

```json
{
  "name": "My Workflow",
  "steps": [
    {
      "id": "step-1234567890",
      "type": "fetch",
      "params": {
        "url": "https://api.example.com/data",
        "method": "GET"
      }
    },
    {
      "id": "step-1234567891",
      "type": "transform",
      "params": {
        "operation": "map",
        "field": "items"
      }
    },
    {
      "id": "step-1234567892",
      "type": "action",
      "params": {
        "action": "save_to_database",
        "table": "results"
      }
    }
  ]
}
```

## Step Types

### Fetch
Retrieve data from an external API or service.

```json
{
  "url": "https://...",
  "method": "GET",
  "headers": { "Authorization": "Bearer token" },
  "timeout": 30000
}
```

### Transform
Apply transformations to data (map, filter, reduce, etc.).

```json
{
  "operation": "map",
  "field": "items",
  "selector": ".name"
}
```

### Action
Execute an external action (send email, create record, etc.).

```json
{
  "action": "send_email",
  "to": "user@example.com",
  "subject": "Workflow Complete"
}
```

### Condition
Branch workflow based on criteria.

```json
{
  "if": "status == 'complete'",
  "then": "step_id_1",
  "else": "step_id_2"
}
```

### Delay
Pause execution for a specified duration.

```json
{
  "duration_ms": 5000
}
```

## Customization

### Add a New Step Type

1. **Update the step dropdown** in `index.html`:
   ```javascript
   <option value="my_step">My Custom Step</option>
   ```

2. **Add step handler** in backend/integration:
   ```javascript
   if (step.type === 'my_step') {
     result = await handleCustomStep(step.params);
   }
   ```

3. **Document in workflow schema**

### Change UI Theme

Edit CSS variables in `<style>`:

```css
:root {
  --ground: #0A0C16;
  --accent: #FF7A1A;
  --good: #34D399;
  /* ... etc */
}
```

### Integrate with Backend

To execute workflows, connect to a backend API:

```javascript
async function runFlow() {
  const response = await fetch('https://your-api.com/workflows/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flow)
  });
  const result = await response.json();
  alert('Workflow executed: ' + JSON.stringify(result));
}
```

## Implementation Guide

### Connect to Node.js Backend

Use with an MCP server or custom backend:

```javascript
// In runFlow()
const response = await fetch('http://localhost:3000/run-flow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(flow)
});
```

Backend (Node.js Express):

```javascript
app.post('/run-flow', async (req, res) => {
  const { name, steps } = req.body;
  const results = [];

  for (const step of steps) {
    let result;
    switch (step.type) {
      case 'fetch':
        result = await fetch(step.params.url).then(r => r.json());
        break;
      case 'action':
        result = await performAction(step.params);
        break;
      // ... handle other step types
    }
    results.push({ step_id: step.id, result });
  }

  res.json({ ok: true, results });
});
```

### Connect to Python Backend

```python
from flask import Flask, request
app = Flask(__name__)

@app.route('/run-flow', methods=['POST'])
def run_flow():
    flow = request.json
    results = []
    for step in flow['steps']:
        if step['type'] == 'fetch':
            result = fetch_data(step['params'])
        elif step['type'] == 'action':
            result = perform_action(step['params'])
        # ... etc
        results.append({'step_id': step['id'], 'result': result})
    return {'ok': True, 'results': results}
```

## Deployment

### As a Static Site

```bash
# GitHub Pages
git add index.html
git commit -m "Deploy flow builder"
git push

# Access via https://username.github.io/repo/index.html
```

### Via HTTP Server

```bash
# Python 3
python3 -m http.server 8000

# Node.js http-server
npx http-server -p 8000

# Ruby
ruby -run -ehttpd . -p 8000
```

### In an Electron App

Embed in an Electron window:

```javascript
mainWindow.loadFile('index.html');
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## See Also

- [Apache Airflow](https://airflow.apache.org/) — Production workflow orchestrator
- [Node-RED](https://nodered.org/) — Low-code visual programming
- [Zapier](https://zapier.com/) — Automation platform
- [Make](https://www.make.com/) — Visual integration platform

## License

MIT — Open source, use it wisely.
