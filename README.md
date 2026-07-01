# Almanac

Forecast records with evidence, revision windows and validator review.

Almanac keeps forecasts honest after they are published. A forecaster can open a record, attach sources, update assumptions and send the claim through GenLayer review so the final state has a readable trail instead of a bare prediction.

## Review Links

| Surface | Link |
| --- | --- |
| Live app | https://assmore22-almanac.vercel.app |
| GitHub | https://github.com/assmore22/almanac |
| Contract | https://explorer-bradbury.genlayer.com/address/0xe113fF6B307F8EbB1977Ba51747CE73CD6fF9dA8 |

## Chain Record

- Network: GenLayer Bradbury
- Chain ID: 4221
- Contract: `0xe113fF6B307F8EbB1977Ba51747CE73CD6fF9dA8`
- Deploy transaction: [0xe6316779...eb6301](https://explorer-bradbury.genlayer.com/tx/0xe6316779ac765a5b56cf2b568ee4cb096930bda889d6fdc847b09da6ceeb6301)
- Deployed: `2026-07-01T15:37:16.000Z`
- Source: `contracts/almanac_v2.py` (37,697 bytes)

## Protocol Path

1. Set the forecast standard.
2. Open a dated forecast record.
3. Attach source evidence and assumptions.
4. Ask GenLayer validators to review the claim.
5. Resolve challenge and reputation updates.

The frontend reads forecast counts, recent records, source lists, challenge state and reputation views. Contract state is public; write actions still require a connected wallet on GenLayer Bradbury.

## Bradbury Smoke

| Action | Transaction |
| --- | --- |
| `create_forecast` | [0x05b335c2...aaaf35](https://explorer-bradbury.genlayer.com/tx/0x05b335c262e392b451359ac7c77c0653a53dc8eb7c93d84e05ce3e6b47aaaf35) |

Read verification passed on Bradbury after deploy. The public app points at this contract address and reads accepted state.

## Local Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Release Hygiene

The public package is static and has no install step. Vercel receives only frontend, contract source and public deployment metadata.

Keep wallet private keys, vault exports, `.env` files, Vercel project state and dashboard data out of Git. This repository is for public source, UI, tests and deployment receipts only.
