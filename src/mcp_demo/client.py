"""
Simple client that launches the demo server and performs a few MCP-style calls.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict

from .protocol import Request, encode_request


def _send(proc: subprocess.Popen, payload: Dict[str, Any]) -> Dict[str, Any]:
    line = json.dumps(payload) + "\n"
    assert proc.stdin is not None
    proc.stdin.write(line.encode("utf-8"))
    proc.stdin.flush()

    assert proc.stdout is not None
    out = proc.stdout.readline().decode("utf-8").strip()
    return json.loads(out)


def run_demo() -> int:
    # Launch as a module so PYTHONPATH=src works
    cmd = [sys.executable, "-u", "-m", "mcp_demo.server"]
    env = dict(**os_environ_with_src())
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
    )

    try:
        # initialize
        res = _send(proc, json.loads(encode_request(Request(1, "initialize"))))
        print("initialize:", json.dumps(res["result"]))

        # list tools
        res = _send(proc, json.loads(encode_request(Request(2, "tools/list"))))
        print("tools:", json.dumps(res["result"]))

        # call echo
        res = _send(
            proc,
            json.loads(
                encode_request(
                    Request(3, "tools/call", {"name": "echo", "arguments": {"text": "hello MCP"}})
                )
            ),
        )
        print("echo:", json.dumps(res["result"]))

        # call sum
        res = _send(
            proc,
            json.loads(
                encode_request(
                    Request(4, "tools/call", {"name": "sum", "arguments": {"numbers": [1, 2.5, 3]}})
                )
            ),
        )
        print("sum:", json.dumps(res["result"]))

        # shutdown
        res = _send(proc, json.loads(encode_request(Request(5, "shutdown"))))
        print("shutdown:", json.dumps(res["result"]))
        return 0
    finally:
        # Graceful shutdown: close stdin so server exits its read loop, then wait
        if proc.stdin:
            try:
                proc.stdin.close()
            except Exception:
                pass
        try:
            proc.wait(timeout=2)
        except Exception:
            # In restricted sandboxes, signals may be blocked; best-effort only
            pass


def os_environ_with_src() -> Dict[str, str]:
    import os

    env = os.environ.copy()
    src = str(Path(__file__).resolve().parents[1])
    # Prepend src to PYTHONPATH to allow -m mcp_demo.server
    env["PYTHONPATH"] = src + (":" + env["PYTHONPATH"] if env.get("PYTHONPATH") else "")
    return env


if __name__ == "__main__":
    raise SystemExit(run_demo())
