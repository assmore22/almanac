# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""
ALMANAC - Consensus-Verified Fact Registry
==========================================
A public, append-only registry of factual statements. Anyone submits a statement
backed by a public source URL. The contract reads the source and a validator set
agrees (Equivalence Principle) whether it supports the statement: verified facts
join the canon, unsupported ones are marked disputed. Because the world changes,
any entry can be re-checked at any time - the registry stays honest over time,
and every check is recorded on-chain.

Status:  PENDING(0) -> VERIFIED(1) | DISPUTED(2)   (re-checkable either way)
"""

from genlayer import *
from dataclasses import dataclass
import json
import typing


F_PENDING = 0
F_VERIFIED = 1
F_DISPUTED = 2


@allow_storage
@dataclass
class Fact:
    author: Address
    statement: str
    source_url: str
    status: u8
    rationale: str
    checks: u256


class Almanac(gl.Contract):
    facts: DynArray[Fact]

    def __init__(self) -> None:
        pass

    @gl.public.write
    def submit_fact(self, statement: str, source_url: str) -> int:
        if len(statement.strip()) == 0:
            raise gl.vm.UserError("a statement is required")
        if len(source_url.strip()) == 0:
            raise gl.vm.UserError("a source URL is required")
        f = self.facts.append_new_get()
        f.author = gl.message.sender_address
        f.statement = statement
        f.source_url = source_url
        f.status = u8(F_PENDING)
        f.rationale = ""
        f.checks = u256(0)
        return len(self.facts) - 1

    @gl.public.write
    def verify(self, fact_id: int) -> None:
        """Read the source and let validators agree whether it supports the
        statement. Works on a pending fact or re-checks a settled one."""
        f = self._get(fact_id)
        statement = f.statement
        url = f.source_url

        def leader_fn() -> str:
            page = ""
            try:
                page = gl.nondet.web.get(url).body.decode("utf-8")[:6000]
            except Exception:
                page = "(source page unreachable)"
            prompt = (
                f"Statement to fact-check: {statement}\n\n"
                f"Cited source page content:\n{page}\n\n"
                "Judge strictly on what the source actually says. Does the source "
                "SUPPORT the statement? Reply with ONLY JSON: {\"supported\": true} "
                "if the source backs the statement, {\"supported\": false} if it "
                "does not, plus a short \"reason\"."
            )
            return gl.nondet.exec_prompt(prompt)

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            return self._decision_of(leader_res.calldata)[0] == self._decision_of(leader_fn())[0]

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        supported, reason = self._decision_of(result)
        f.checks = f.checks + u256(1)
        f.rationale = reason[:300]
        f.status = u8(F_VERIFIED if supported else F_DISPUTED)

    # ------------------------------------------------------------------ views
    @gl.public.view
    def get_fact_count(self) -> int:
        return len(self.facts)

    @gl.public.view
    def get_fact(self, fact_id: int) -> dict:
        f = self._get(fact_id)
        return {
            "author": f.author.as_hex,
            "statement": f.statement,
            "source_url": f.source_url,
            "status": int(f.status),
            "rationale": f.rationale,
            "checks": int(f.checks),
        }

    @gl.public.view
    def verified_count(self) -> int:
        n = 0
        for i in range(len(self.facts)):
            if int(self.facts[i].status) == F_VERIFIED:
                n += 1
        return n

    # -------------------------------------------------------------- internals
    def _get(self, fact_id: int) -> Fact:
        if fact_id < 0 or fact_id >= len(self.facts):
            raise gl.vm.UserError("no such fact")
        return self.facts[fact_id]

    def _decision_of(self, result: typing.Any) -> tuple:
        data = result
        if isinstance(data, str):
            data = self._extract_json(data)
        if not isinstance(data, dict):
            return (False, "")
        raw = data.get("supported", None)
        reason = str(data.get("reason", ""))
        if isinstance(raw, bool):
            return (raw, reason)
        if isinstance(raw, str):
            return (raw.strip().lower() == "true", reason)
        return (False, reason)

    def _extract_json(self, text: str) -> typing.Any:
        try:
            return json.loads(text)
        except (ValueError, TypeError):
            pass
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except (ValueError, TypeError):
                return None
        return None
