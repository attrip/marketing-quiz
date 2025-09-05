MCP-style Demo (Local)
======================

What this is
------------
- A minimal, local demo loosely modeling the Model Context Protocol (MCP).
- Implements initialize, tools/list, tools/call over newline-delimited JSON via stdio.
- Includes two tools: echo, sum.

Prerequisites
-------------
- Python 3.9+
- (Optional) pytest, black, ruff for test/format/lint.

Run
---
1. Run the demo client:

   make run

   This starts the server and performs: initialize -> tools/list -> tools/call (echo, sum) -> shutdown.

2. Run tests:

   make test

Notes
-----
- This is a simplified educational mock; real MCP uses a more formal framing (e.g., headers + streams) and a richer schema (resources, prompts, tools, permissions).
- You can extend `src/mcp_demo/server.py` by adding functions and registering them in `TOOLS`.

