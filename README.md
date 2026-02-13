# VPM Starter Feature: Project Register

This starter feature is a lightweight front-end module for maintaining project records.

## Included capabilities

- Add a project with:
  - Project name
  - Client name
  - Project lead (internal)
  - Client contact
  - Start date
  - End date
- Edit existing projects
- Delete projects
- Basic date validation (start date cannot be after end date)

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tech choice

This uses **Materialize CSS** (a Material Design-like UI framework) via CDN for a clean visual style without a build setup.
