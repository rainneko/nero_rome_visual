# 章节读者计数 · Chapter reader counter

GitHub Pages only serves static files, so counting "how many different people opened chapter N" needs a tiny
service. This one is a Cloudflare Worker with a D1 (SQLite) database, free tier.

* It counts different visitors per chapter by a **salted hash of the IP address** (SHA-256 with a secret salt).
  Raw IP addresses are never stored, and the hashes cannot be turned back into addresses without the salt.
* People behind the same router (one household, one school, one company) share an IP, so they count once;
  the same person on phone data and on home Wi-Fi counts twice. It is a good estimate, not an exact head count.
* The page calls it only in full-text mode (目录 → a chapter). Without a counter URL the counts are simply hidden.

## Set up (about 10 minutes, needs a free Cloudflare account and Node.js)

```bash
cd server/visit-counter
npx wrangler login
npx wrangler d1 create nero-visits          # copy the database_id it prints into wrangler.toml
npx wrangler d1 execute nero-visits --remote --file=schema.sql
npx wrangler secret put SALT                # type any long random string; keep it secret
npx wrangler deploy                         # prints the URL, e.g. https://nero-visits.<you>.workers.dev
```

Then put that URL in `build.config.json` (`"counter": "https://nero-visits.<you>.workers.dev"`), build and push.
Check it: `curl -X POST "https://…/hit?ch=1"` then `curl "https://…/counts"`.

**Readers in mainland China:** `*.workers.dev` addresses are often unreachable there. Add a custom domain to the
worker (Cloudflare dashboard → the worker → Settings → Domains & Routes) and use that URL instead.

## Privacy note for the site

Add a line to the site's notice, for example: 本站统计章节读者数时只保存加盐哈希后的 IP 摘要，不保存原始 IP。
