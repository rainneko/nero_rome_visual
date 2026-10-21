# Asset pipeline

Large detailed buildings are separate GLB files in `assets/models/`. The build inlines them; the page loads them with
`GLTFLoader` and falls back to the procedural version if a model fails.

## Conventions
* Metres, Y up, origin at the centre of the footprint at ground level. Match the existing models and
  `tools/models/export_any.py` for orientation and material names (palette: plaster, marble, tile, bronze, brick…).
* Roofs are terracotta. No buildings later than Nero.
* Keep each model under ~40k triangles.

## Generators
`tools/models/*.py` are Python (trimesh) scripts that wrote the current GLB files.

## Blender + Claude
With the Blender MCP server, Claude can build and render models in Blender directly.
A leader/worker loop runs in **Claude Code** (subagents are a Claude Code feature):
the main session (leader) gives each worker a brief from `briefs/`, the worker (`.claude/agents/blender-modeler.md`,
model `haiku`) builds the asset and renders fixed preview cameras, the leader compares the renders with the brief and
history and sends a numbered fix list, until the asset passes the brief's checklist.
Docs: https://code.claude.com/docs/en/sub-agents (subagents) and the Claude Code MCP documentation
(Claude Code can import servers configured in Claude Desktop).
