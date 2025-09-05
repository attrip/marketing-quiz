import json
from dataclasses import dataclass
from typing import Any, Dict, Optional


JSONRPC_VERSION = "2.0"


@dataclass
class Request:
    id: int
    method: str
    params: Optional[Dict[str, Any]] = None


@dataclass
class Response:
    id: int
    result: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None


def encode_request(req: Request) -> str:
    payload = {
        "jsonrpc": JSONRPC_VERSION,
        "id": req.id,
        "method": req.method,
    }
    if req.params is not None:
        payload["params"] = req.params
    return json.dumps(payload)


def encode_response(res: Response) -> str:
    payload = {
        "jsonrpc": JSONRPC_VERSION,
        "id": res.id,
    }
    if res.error is not None:
        payload["error"] = res.error
    else:
        payload["result"] = res.result
    return json.dumps(payload)


def decode_message(line: str) -> Dict[str, Any]:
    return json.loads(line)

