# AlmanacForecast V2

This repository is a public registry system: records are submitted with sources, normalized on-chain, and exposed through a clean frontend for review.

A re-checkable, consensus-verified registry of forecasts/facts.

## AlmanacForecast Brief

This repo is organized for review: the app can be opened locally, the contract source is present, and the deployed Studionet address is pinned in `deployment.json`.

- Folder: `projects/17-almanac`
- Frontend shape: static browser app
- Contract source: `contracts/almanac_v2.py`
- Build status: Schema-valid (37931 bytes, 15 write + 21 view); deployed + 11 write smoke txs finalized incl 2 GenLayer reasoning calls; 27/27 read tests passed; legacy backward-compat verified; frontend repointed (no redesign).

## Registry Mechanics

AlmanacForecast V2 (# v0.2.16), 37931 bytes, 15 write + 21 view.

- Primary source: `contracts/almanac_v2.py` (37,931 bytes)
- Public write/action methods: 16
- Read methods: 20
- GenLayer features: live web rendering, LLM adjudication, validator-comparative consensus, indexed storage, append-only collections

Typical flow: `create_forecast` -> `open_review` -> `submit_challenge` -> `resolve_challenge_with_genlayer` -> `open_challenge_window` -> `submit_appeal` -> `archive_forecast`

Useful reads: `get_forecast`, `get_forecast_count`, `get_recent_forecasts`, `get_forecasts_by_status`, `get_forecasts_by_author`, `get_signal`, `get_forecast_signals`, `get_updates`

## Deployment Evidence

- Network: studionet (61999)
- Contract: [0xd28b9261B0E939035996519B594d09744051681e](https://explorer-studio.genlayer.com/contracts/0xd28b9261B0E939035996519B594d09744051681e)
- Deploy tx: [0xdd93b5a8...f15396](https://explorer-studio.genlayer.com/tx/0xdd93b5a888381059da4fc12e0aef17de3202f9d4fd5c64f5a301a57e64f15396)
- Deployed at: 2026-06-22T22:03:37.847Z
- Smoke writes recorded: 11

Smoke coverage:

- create_forecast: [0xccceaea9...665cdf](https://explorer-studio.genlayer.com/tx/0xccceaea97fc469b5a2771eb82dfff8486f1b1c7912afc6261110335ba7665cdf)
- add_signal: [0x336b40e3...bdd5d1](https://explorer-studio.genlayer.com/tx/0x336b40e347ee090b4821847393a0896c8d8872de358480a90c69c09924bdd5d1)
- add_update: [0x82e4cc9c...7d994a](https://explorer-studio.genlayer.com/tx/0x82e4cc9c74f13ff842b60d43c5005d50352ed8b9c4e3152fdd60a9b5097d994a)
- open_review: [0xcb09e4d2...fa223b](https://explorer-studio.genlayer.com/tx/0xcb09e4d209e07c9c6c3ad6ff0e6a63d2aed98d0dc1a564974af9e249befa223b)
- verify_with_genlayer: [0xb32a98dc...2027f0](https://explorer-studio.genlayer.com/tx/0xb32a98dc1b97689aeb3fb07763c62735cfe87c1f7a58056eab9dda16232027f0)
- open_challenge_window: [0x23c8203d...a1adce](https://explorer-studio.genlayer.com/tx/0x23c8203d66bbe24830594fda5a0dca60d0e06b80ead132bbebd1fd1ce6a1adce)

## Run AlmanacForecast Locally

```powershell
cd <private-workspace-root>
npm run preview:start
npm run preview:project -- 17-almanac
```

Open http://localhost:8080/17-almanac/.

## Publish AlmanacForecast

```powershell
cd <private-workspace-root>
npm run publish:project -- -Project 17-almanac -Repo https://github.com/aspro45/<repo-name>.git
```

## Keys And Boundaries

The repo is designed for public GitHub/Vercel release. Keep `.env`, `.vercel/`, wallet vaults, private keys and local dashboard state out of git. The publisher script enforces these ignore rules before it pushes.
