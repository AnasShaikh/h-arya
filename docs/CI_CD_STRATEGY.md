# H-Arya Production CI/CD & Testing Strategy

## 🎯 Objective
Move from "manual deployments" to a robust, automated pipeline that ensures code quality, prevents bad deployments, and manages database migrations safely.

## 1. The Pipeline Architecture (GitHub Actions)

We should split the pipeline into two stages: **Integration (CI)** and **Deployment (CD)**.

### Stage A: Continuous Integration (On Pull Request)
Triggers when you push to `dev` or open a PR to `main`.
1.  **Lint & Type Check:** Run `eslint` and `tsc` to catch syntax errors.
2.  **Unit Tests:** Run `jest` (needs to be set up) for logic verification.
3.  **Build Check:** Run `next build` to ensure the app actually compiles.
    *   *Why?* This prevents broken builds from ever reaching the server.

### Stage B: Continuous Deployment (On Push to Main)
Triggers *only* when Stage A passes and code merges to `main`.

#### Option 1: The "Builder" Pattern (Recommended for VPS)
Instead of building *on* the VPS (which eats CPU/RAM and caused our timeout issues), we build on GitHub.
1.  **Build Docker Image:** GitHub Actions builds the image.
2.  **Push to Registry:** Push image to GitHub Container Registry (ghcr.io).
3.  **SSH Trigger:** GitHub logs into VPS via SSH and runs a "pull & restart" script.

#### Option 2: The "Pull" Pattern (Current, but optimized)
1.  **SSH into VPS.**
2.  **Git Pull.**
3.  **Docker Compose Build.**
    *   *Pros:* Simpler, no registry needed.
    *   *Cons:* Uses VPS resources. We must limit concurrency to prevent "API Limit" timeouts on other services.

## 2. Safe Database Migrations

Database changes are the most dangerous part of deployment.

**Strategy:**
1.  **Backup Pre-Deploy:** The pipeline should dump the current DB before touching it.
    ```bash
    pg_dump -U postgres h_arya > backup_$(date +%s).sql
    ```
2.  **Migration Lock:** Ensure only one deployment runs migrations at a time.
3.  **Deploy Command:** Use `prisma migrate deploy` (strict) instead of `db push` (loose) for production.

## 3. The "Zero-Downtime" Goal

Currently, we have a brief outage during restart. To fix this:
1.  **Blue/Green Deployment:**
    *   Spin up `h-arya-green` container on port 3001.
    *   Wait for it to be "Healthy".
    *   Switch Caddy to point to 3001.
    *   Kill `h-arya-blue` (port 3000).

## 4. Immediate Action Items

1.  [ ] Create `.github/workflows/ci.yml` for Lint/Build checks.
2.  [ ] Set up **GHCR** (GitHub Container Registry) access tokens.
3.  [ ] Write a `deploy.sh` script on the VPS that handles the backup + pull + restart logic.
4.  [ ] Configure **Caddy** to support health checks.

---
*Research by Coda 🔧 - Feb 23, 2026*
