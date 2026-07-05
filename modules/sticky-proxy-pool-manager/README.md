# Sticky Proxy Pool Manager

Pool-based proxy management with sticky affinity. Ensures each entity (account/bot) consistently uses the same proxy IP across requests.

## Principles
- **1:1 Binding**: Each entity assigned exactly one proxy; doesn't change unless proxy dies.
- **Rotation**: Across entities only — never rotate IPs for same entity.
- **Multi-type**: Support residential, datacenter, VPN, or custom proxy types.
- **Fallback**: If proxy becomes unavailable, reassign from pool; original proxy re-enabled → re-bind.

## Usage
```python
from index import ProxyManager

pm = ProxyManager(storage_dir="storage/proxies")

# Add proxies to pool
pm.add_proxy("http://residential-1.proxy:8080", kind="residential", country="US")
pm.add_proxy("http://datacenter-1.proxy:8080", kind="datacenter", country="SG")

# Get sticky proxy for entity
url = pm.for_entity("acct_001")  # Returns same URL every call (unless proxy disabled)
# → http://residential-1.proxy:8080

# Check status
print(pm.status())
# {
#   "total_proxies": 2,
#   "enabled": 2,
#   "assigned_entities": 1,
#   "free_proxies": 1,
#   "utilization": "1/2"
# }

# List all bindings
bindings = pm.bindings()  # {"acct_001": "px_abc123", ...}

# Disable a proxy (e.g., IP blocked)
pm.set_enabled("px_abc123", False)
# Next call to for_entity() will reassign to another proxy

# Remove proxy entirely
pm.remove_proxy("px_abc123")

# Clear entity binding (e.g., account reset)
pm.unbind("acct_001")
```

## Storage
- `pool.json`: All available proxies with metadata.
- `bindings.json`: Entity ID → Proxy ID map.

Both auto-create on first write; survive restarts.

*Open source — use it wisely.*
