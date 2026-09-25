# 🌐 Cloudflare CDN & Edge Security Setup Guide
### Project: यदुवंशी दुर्गा पूजा कपूरिपुर (Yaduvashi Durga Puja Kapooripur)

This document provides a step-by-step setup guide for deploying **Cloudflare CDN, Edge DDoS Protection, Caching Rules, and SSL/TLS** for the frontend (Vercel) and backend (Render) infrastructure.

---

## 1. 📌 Add Domain to Cloudflare & Update Nameservers

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Click **"Add a Domain"** (e.g. `yaduvashidurgapujakapooripur.online`).
3. Select the **Free Plan** (Free tier provides DDoS mitigation, Global CDN, Unlimited Bandwidth, and Edge SSL).
4. Cloudflare will scan existing DNS records.
5. In your domain registrar (where you purchased the domain, e.g., Hostinger, GoDaddy, Namecheap):
   - Replace the default nameservers with Cloudflare's 2 assigned nameservers (e.g., `ash.ns.cloudflare.com` & `walt.ns.cloudflare.com`).
   - Wait 5–15 minutes for global DNS propagation.

---

## 2. 🔀 DNS Records Configuration (Proxy Status: "Proxied")

Set up the following DNS records in **Cloudflare -> DNS -> Records**:

| Type | Name / Host | Target / Value | Proxy Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `@` (root) | `cname.vercel-dns.com` | 🟠 **Proxied** | Vercel Frontend (Production) |
| **CNAME** | `www` | `cname.vercel-dns.com` | 🟠 **Proxied** | WWW Redirect / Alias |
| **CNAME** | `api` | `<your-render-app>.onrender.com` | 🟠 **Proxied** | Render Express Backend |

> [!IMPORTANT]
> Always ensure the **Orange Cloud (Proxied)** icon is enabled. If set to "DNS Only" (Grey Cloud), DDoS protection, edge caching, and firewall rules will NOT be active.

---

## 3. 🔒 SSL / TLS Configuration

Navigate to **Cloudflare -> SSL/TLS -> Overview**:

1. Set encryption mode to **"Full (strict)"** (Ensures end-to-end HTTPS encryption from Browser -> Cloudflare Edge -> Vercel/Render Origin).
2. Under **SSL/TLS -> Edge Certificates**:
   - Enable **Always Use HTTPS** (`ON`).
   - Enable **Automatic HTTPS Rewrites** (`ON`).
   - Minimum TLS Version: **TLS 1.2**.

---

## 4. ⚡ Caching Rules & Page Rules (High Traffic Optimization)

Navigate to **Cloudflare -> Caching -> Cache Rules** (or Page Rules):

### Rule A: Static Uploads & Media (Aggressive Cache)
- **If incoming request matches**:
  - URI Path starts with `/uploads/` OR URI Path Extension is in `{"webp", "png", "jpg", "jpeg", "svg", "css", "js", "woff2"}`
- **Then Cache Eligibility**: **Eligible for cache**
- **Edge Cache TTL**: **7 days (or 1 month)**
- **Browser Cache TTL**: **7 days**

### Rule B: Dynamic API & Auth (Bypass Cache)
- **If incoming request matches**:
  - URI Path starts with `/api/` OR URI Path starts with `/socket.io/`
- **Then Cache Eligibility**: **Bypass Cache** (Never cache dynamic database responses or live session events)

---

## 5. 🛡️ Cloudflare Web Application Firewall (WAF) & Rate Limiting

Navigate to **Cloudflare -> Security -> WAF -> Rate Limiting Rules** (Free tier includes free custom rate limit rules):

### Rule 1: Login Brute-Force Protection
- **Rule Name**: `Protect-Auth-Login`
- **Matching Criteria**: `(http.request.uri.path eq "/api/auth/login" and http.request.method eq "POST")`
- **Rate Limit**: Max **10 requests per 1 minute** per IP.
- **Action**: Block for 15 minutes or Managed Challenge (Captcha).

### Rule 2: Payment Spammer Protection
- **Rule Name**: `Protect-Donation-Order`
- **Matching Criteria**: `(http.request.uri.path eq "/api/donations/create-order" and http.request.method eq "POST")`
- **Rate Limit**: Max **5 requests per 1 minute** per IP.
- **Action**: Managed Challenge.

### Rule 3: Webhook Whitelist
- **Rule Name**: `Allow-Razorpay-Webhook`
- **Matching Criteria**: `(http.request.uri.path eq "/api/donations/webhook")`
- **Action**: Bypass WAF / Rate Limiting (ensures Razorpay IP deliveries are never blocked).

---

## 6. 📡 WebSockets & LiveKit WebRTC Traffic Architecture

1. **Socket.io (Live Ephemeral Chat & Donation Popups)**:
   - Cloudflare automatically proxies WebSocket connections (`wss://api.kapooripur.online/socket.io/`).
   - In Cloudflare dashboard, verify **Network -> WebSockets** is toggled to **`ON`**.
2. **LiveKit WebRTC Video Streaming**:
   - WebRTC video streams bypass standard HTTP proxies and connect directly to the LiveKit SFU (via WebRTC UDP/TCP ports).
   - LiveKit URL (`LIVEKIT_URL` in `.env`) should remain pointed directly to your LiveKit Cloud or standalone SFU node instance.

---

## 7. 💻 Code-Side Architecture Verification

### Express Trust Proxy
The backend application has been configured in `server/src/app.ts`:
```ts
// Enable Trust Proxy for accurate client IP extraction behind Cloudflare & Render edge proxies
app.set('trust proxy', 1);
```
With `trust proxy` enabled:
- `req.ip` correctly extracts the real client IP passed by Cloudflare via the `CF-Connecting-IP` / `X-Forwarded-For` headers.
- `express-rate-limit` rate-limits users based on their actual IP rather than Cloudflare's shared proxy IP addresses.

---

## 8. 🗄️ Cloudflare R2 Object Storage Setup (Image Storage Migration)

Cloudflare R2 provides S3-compatible, ultra-fast, zero-egress fee object storage.

### Step 8.1: Create R2 Bucket
1. Go to **Cloudflare Dashboard -> R2 -> Overview -> Create bucket**.
2. **Bucket name**: `kapooripur-media` (or any unique name of your choice).
3. **Location**: `Automatic` (Default). Click **Create bucket**.

### Step 8.2: Connect Custom Domain to R2 (Recommended for Permanent URLs)
1. Inside your bucket (`kapooripur-media`) -> Go to **Settings -> Custom Domains**.
2. Click **Connect Domain**.
3. Enter your custom subdomain (e.g. `media.yaduvashidurgapujakapooripur.online`).
4. Click **Continue -> Connect Domain** (Cloudflare will automatically configure the DNS CNAME record and SSL certificate for your media domain).

### Step 8.3: Generate R2 API Tokens
1. Go to **Cloudflare Dashboard -> R2 -> Manage R2 API Tokens** (on the right sidebar).
2. Click **Create API token**.
3. **Token name**: `kapooripur-backend-uploader`.
4. **Permissions**: Select **Object Read & Write**.
5. **Specify bucket**: Select `kapooripur-media` (or All buckets).
6. Click **Create API Token**.
7. Copy the following credentials to your `server/.env`:
   - **Account ID** (found on R2 overview page) -> `R2_ACCOUNT_ID=`
   - **Access Key ID** -> `R2_ACCESS_KEY_ID=`
   - **Secret Access Key** -> `R2_SECRET_ACCESS_KEY=`
   - `R2_BUCKET_NAME=kapooripur-media`
   - `R2_PUBLIC_URL=https://media.yaduvashidurgapujakapooripur.online`

### Step 8.4: Run One-Time Migration Script
To migrate existing images from `server/uploads/` to your Cloudflare R2 bucket and update MongoDB records:
```bash
cd server
npm run migrate:r2
```

