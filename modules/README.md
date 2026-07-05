# modules/ — Atomic Code

Each module does exactly **one job** and can be lifted into a completely different
project without the rest of this repo.

```
modules/{slug}/
├── README.md      # what it is, input, output, dependencies
├── LOGIC.md       # WHY it is built this way (the reasoning — mandatory)
├── USAGE.md       # standalone usage with a complete example
├── module.json    # machine-readable metadata
├── src/           # the code
└── examples/      # real examples, anonymized
```

Read `LOGIC.md` first — that is where the judgment lives.
