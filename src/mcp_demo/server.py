"""
Minimal, MCP-style JSON-RPC server over stdio.

Notes:
- This is a simplified demo loosely modeling MCP concepts (initialize, tools/list, tools/call).
- Messages are newline-delimited JSON (NDJSON) for simplicity.
"""

from __future__ import annotations

import sys
from typing import Any, Dict, List

from .protocol import Request, Response, decode_message, encode_response


def tool_echo(text: str) -> Dict[str, Any]:
    return {"content": text}


def tool_sum(numbers: List[float]) -> Dict[str, Any]:
    try:
        total = float(sum(numbers))
    except Exception as e:  # noqa: BLE001 - simple demo
        raise ValueError(f"invalid numbers: {e}")
    return {"total": total}


TOOLS = {
    "echo": {
        "name": "echo",
        "description": "Echo back the provided text.",
        "parameters": {"type": "object", "properties": {"text": {"type": "string"}}, "required": ["text"]},
        "impl": tool_echo,  # not serialized
    },
    "sum": {
        "name": "sum",
        "description": "Sum a list of numbers.",
        "parameters": {
            "type": "object",
            "properties": {"numbers": {"type": "array", "items": {"type": "number"}}},
            "required": ["numbers"],
        },
        "impl": tool_sum,
    },
}


def _list_tools() -> List[Dict[str, Any]]:
    # Drop non-serializable entries like function refs
    safe = []
    for t in TOOLS.values():
        safe.append({k: v for k, v in t.items() if k != "impl"})
    return safe


def _call_tool(name: str, arguments: Dict[str, Any]) -> Any:
    if name not in TOOLS:
        raise ValueError(f"unknown tool: {name}")
    impl = TOOLS[name]["impl"]
    if not callable(impl):
        raise ValueError("tool has no implementation")
    return impl(**arguments)


def handle_request(msg: Dict[str, Any]) -> Response:
    req_id = msg.get("id")
    method = msg.get("method")
    params = msg.get("params", {}) or {}

    try:
        if method == "initialize":
            result = {"protocolVersion": "demo-0.1", "serverName": "mcp-demo"}
        elif method == "tools/list":
            result = {"tools": _list_tools()}
        elif method == "tools/call":
            name = params.get("name")
            arguments = params.get("arguments", {})
            result = {"content": _call_tool(name, arguments)}
        elif method == "shutdown":
            result = {"ok": True}
        else:
            raise ValueError(f"unknown method: {method}")
        return Response(id=req_id, result=result)
    except Exception as e:  # noqa: BLE001 - simple demo
        return Response(id=req_id, error={"code": -32000, "message": str(e)})


def run_server() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = decode_message(line)
            res = handle_request(msg)
            sys.stdout.write(encode_response(res) + "\n")
            sys.stdout.flush()
        except Exception as e:  # noqa: BLE001
            # Protocol error: print a generic JSON-RPC error with id null
            sys.stdout.write(
                encode_response(
                    Response(id=None, error={"code": -32700, "message": f"parse/dispatch error: {e}"})
                )
                + "\n"
            )
            sys.stdout.flush()


if __name__ == "__main__":
    run_server()

