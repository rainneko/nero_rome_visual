// Chapter reader counter for the Nero Rome Reader (Cloudflare Worker + D1).
// Counts different visitors per chapter by a salted SHA-256 hash of the visitor's IP. Raw IPs are never stored.
//   POST /hit?ch=12   record this visitor for chapter 12, reply {"ch":12,"n":<different visitors>}
//   GET  /counts      reply {"1":34,"2":30,...,"_all":<different visitors to any chapter>}
export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('Origin') || '';
    const allow = (env.ALLOW_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
    const cors = {
      'Access-Control-Allow-Origin': allow.includes('*') ? '*' : (allow.includes(origin) ? origin : allow[0] || ''),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

    if (url.pathname === '/hit' && req.method === 'POST') {
      const ch = Number.parseInt(url.searchParams.get('ch') || '', 10);
      if (!(ch >= 0 && ch < 10000)) return json({ error: 'bad chapter' }, 400);
      const ip = req.headers.get('CF-Connecting-IP') || '';
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((env.SALT || '') + '|' + ip));
      const h = [...new Uint8Array(digest)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
      await env.DB.prepare('INSERT OR IGNORE INTO hits (ch, h) VALUES (?1, ?2)').bind(ch, h).run();
      const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM hits WHERE ch = ?1').bind(ch).first();
      return json({ ch, n: row ? row.n : 0 });
    }
    if (url.pathname === '/counts' && req.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT ch, COUNT(*) AS n FROM hits GROUP BY ch').all();
      const out = {};
      for (const r of results) out[r.ch] = r.n;
      const all = await env.DB.prepare('SELECT COUNT(DISTINCT h) AS n FROM hits').first();
      out._all = all ? all.n : 0;
      return json(out);
    }
    return json({ error: 'not found' }, 404);
  }
};
