# tyx-lab as a Knowledge Path (RAG / agent memory)

tyx-lab is designed to be **consumed by agents** as a searchable knowledge base. Three access
layers, simplest to richest:

## 1. index.json — the machine-readable map
Every atom with `id`, `name`, `lane`, `category`, `path`, `status`. Fetch raw and filter in code:
`https://raw.githubusercontent.com/fahmiwol/tyx-lab/main/index.json`

## 2. llms.txt — the LLM ingestion file
A flat plain-text listing of every atom (name + one-line + path), following the `llms.txt`
convention. Drop it into any RAG pipeline or paste into model context:
`https://raw.githubusercontent.com/fahmiwol/tyx-lab/main/llms.txt`

## 3. tools/tyx-lab-mcp — the live MCP server (the "brain")
An MCP server any client (Claude, an IDE, an agent) can call to search and fetch atoms on
demand: `search_atoms(query)`, `get_atom(id)`, `list_categories()`. This turns the library
into a live knowledge path / system memory an agent queries while it works.

## Suggested agent loop
need a capability -> search_atoms("rate limit redis") -> get_atom(top hit) -> lift the src/ or method -> cite the atom path

*Open source — use it wisely.*