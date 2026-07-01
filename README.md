# Almanac

Forecast records with evidence, revision windows and validator review.

Almanac keeps forecasts honest after they are published. A forecaster can open a record, attach sources, update assumptions and send the claim through GenLayer review so the final state has a readable trail instead of a bare prediction.

## Review Links

| Surface | Link |
| --- | --- |
| Live app | https://assmore22-almanac.vercel.app |
| GitHub | https://github.com/assmore22/almanac |
| Contract | https://explorer-studio.genlayer.com/contracts/0xd28b9261B0E939035996519B594d09744051681e |

## Chain Record

- Network: GenLayer Studionet
- Chain ID: 61999
- Contract: `0xd28b9261B0E939035996519B594d09744051681e`
- Deploy transaction: [0xdd93b5a8...f15396](https://explorer-studio.genlayer.com/tx/0xdd93b5a888381059da4fc12e0aef17de3202f9d4fd5c64f5a301a57e64f15396)
- Deployed: `2026-06-22T22:03:37.847Z`
- Source: `contracts/almanac_v2.py` (37,931 bytes)

## Protocol Path

1. Set the forecast standard.
2. Open a dated forecast record.
3. Attach source evidence and assumptions.
4. Ask GenLayer validators to review the claim.
5. Resolve challenge and reputation updates.

The frontend reads forecast counts, recent records, source lists, challenge state and reputation views. Contract state is public; write actions still require a connected wallet on GenLayer Studionet.

## Finalized Smoke

| Action | Transaction |
| --- | --- |
| `create_forecast` | [0xccceaea9...665cdf](https://explorer-studio.genlayer.com/tx/0xccceaea97fc469b5a2771eb82dfff8486f1b1c7912afc6261110335ba7665cdf) |
| `add_signal` | [0x336b40e3...bdd5d1](https://explorer-studio.genlayer.com/tx/0x336b40e347ee090b4821847393a0896c8d8872de358480a90c69c09924bdd5d1) |
| `add_update` | [0x82e4cc9c...7d994a](https://explorer-studio.genlayer.com/tx/0x82e4cc9c74f13ff842b60d43c5005d50352ed8b9c4e3152fdd60a9b5097d994a) |
| `open_review` | [0xcb09e4d2...fa223b](https://explorer-studio.genlayer.com/tx/0xcb09e4d209e07c9c6c3ad6ff0e6a63d2aed98d0dc1a564974af9e249befa223b) |
| `verify_with_genlayer` | [0xb32a98dc...2027f0](https://explorer-studio.genlayer.com/tx/0xb32a98dc1b97689aeb3fb07763c62735cfe87c1f7a58056eab9dda16232027f0) |
| `open_challenge_window` | [0x23c8203d...a1adce](https://explorer-studio.genlayer.com/tx/0x23c8203d66bbe24830594fda5a0dca60d0e06b80ead132bbebd1fd1ce6a1adce) |

## Local Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Release Hygiene

The public package is static and has no install step. Vercel receives only frontend, contract source and public deployment metadata.

Keep wallet private keys, vault exports, `.env` files, Vercel project state and dashboard data out of Git. This repository is for public source, UI, tests and deployment receipts only.
