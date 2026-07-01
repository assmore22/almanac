"""Seed ALMANAC with real on-chain data on studionet."""
from pathlib import Path

from gltest_cli.config.general import get_general_config
from gltest_cli.config.user import load_user_config
from gltest import get_contract_factory, get_default_account

ROOT = Path(__file__).resolve().parents[1]
ADDR = "0x2315fACbFFF26e5425144f6146574004348358e8"
URL = "https://example.com"

cfg = load_user_config(str(ROOT / "gltest.config.yaml"))
get_general_config().user_config = cfg
c = get_contract_factory(contract_file_path=str(ROOT / "contracts" / "almanac.py")).build_contract(
    ADDR, account=get_default_account())

FACTS = [
    "The example.com page states the domain is for use in illustrative examples in documents.",
    "The example.com page links out to more information at the IANA website.",
    "The example.com page displays the current live price of Bitcoin in US dollars.",
]


def main():
    if c.get_fact_count().call() == 0:
        for stmt in FACTS:
            c.submit_fact(args=[stmt, URL]).transact()
            print("submitted:", stmt[:48])
    for fid in range(c.get_fact_count().call()):
        f = c.get_fact(args=[fid]).call()
        if int(f["status"]) == 0:
            print("verifying", fid, "(AI)...")
            try:
                c.verify(args=[fid]).transact()
            except Exception as e:
                print("verify", fid, "->", e)
    for fid in range(c.get_fact_count().call()):
        f = c.get_fact(args=[fid]).call()
        print(fid, ["PENDING", "VERIFIED", "DISPUTED"][int(f["status"])], "|", (f["rationale"] or "")[:60])
    print("verified_count=", c.verified_count().call())


if __name__ == "__main__":
    main()
