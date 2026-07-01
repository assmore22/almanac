"""Tests for ALMANAC (direct runner). AI verify() validated live on studionet."""
from pathlib import Path

CONTRACT = str(Path(__file__).resolve().parents[1] / "contracts" / "almanac.py")
F_PENDING = 0; F_VERIFIED = 1; F_DISPUTED = 2


def _submit(a, vm, who, stmt="Water boils at 100C at sea level", url="https://example.com"):
    vm.sender = who
    return a.submit_fact(stmt, url)


def test_submit_fact(deploy, direct_vm, direct_alice):
    a = deploy(CONTRACT)
    fid = _submit(a, direct_vm, direct_alice)
    assert fid == 0
    f = a.get_fact(0)
    assert f["status"] == F_PENDING
    assert f["checks"] == 0
    assert f["statement"] == "Water boils at 100C at sea level"


def test_submit_requires_statement(deploy, direct_vm, direct_alice):
    a = deploy(CONTRACT)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("a statement is required"):
        a.submit_fact("", "https://x.com")


def test_submit_requires_source(deploy, direct_vm, direct_alice):
    a = deploy(CONTRACT)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("a source URL is required"):
        a.submit_fact("stmt", "")


def test_verify_bad_id(deploy, direct_vm, direct_alice):
    a = deploy(CONTRACT)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("no such fact"):
        a.verify(0)


def test_verified_count_zero(deploy, direct_vm, direct_alice):
    a = deploy(CONTRACT)
    _submit(a, direct_vm, direct_alice)
    assert a.verified_count() == 0


def test_multiple(deploy, direct_vm, direct_alice):
    a = deploy(CONTRACT)
    _submit(a, direct_vm, direct_alice, stmt="Fact A")
    _submit(a, direct_vm, direct_alice, stmt="Fact B")
    assert a.get_fact_count() == 2
    assert a.get_fact(1)["statement"] == "Fact B"
