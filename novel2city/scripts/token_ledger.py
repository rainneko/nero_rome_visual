"""Build a token ledger from Claude Code session transcripts.

Usage: python3 token_ledger.py <session.jsonl> <out_dir>
Reads <session.jsonl> (the lead session) and <session>/subagents/agent-*.jsonl (every worker), sums the exact
`usage` of each API call (deduplicated by message id) and writes:
  agents.csv  one row per agent: model, description, calls, cache_read, cache_write, uncached_input, output, total
  phases.csv  the same, split at every new instruction the agent received (resumed agents = several phases)
"total" = every token the model processed (cache reads included). Cache reads are billed at a small fraction of
normal input, so "fresh" (cache_write + uncached_input + output) is the better rough guide to cost.
"""
import json, os, sys, glob, csv

def calls(path):
    seen, seg, segs = set(), None, []
    for line in open(path, encoding='utf-8'):
        try: d = json.loads(line)
        except ValueError: continue
        m = d.get('message', {})
        if d.get('type') == 'user':
            c = m.get('content')
            if isinstance(c, list):
                c = None if any(isinstance(x, dict) and x.get('type') == 'tool_result' for x in c) else \
                    ' '.join(x.get('text', '') for x in c if isinstance(x, dict) and x.get('type') == 'text')
            if isinstance(c, str) and len(c) > 40:
                seg = dict(start=d.get('timestamp'), prompt=c[:160].replace('\n', ' '), rows=[]); segs.append(seg)
        elif d.get('type') == 'assistant' and m.get('usage'):
            if m.get('id') in seen: continue
            seen.add(m.get('id'))
            if seg is None: seg = dict(start=d.get('timestamp'), prompt='', rows=[]); segs.append(seg)
            seg['rows'].append((m.get('model'), m['usage'], d.get('timestamp')))
    return segs

def total(rows):
    t = dict(calls=len(rows), cache_read=0, cache_write=0, uncached_input=0, output=0, max_context=0)
    for _, u, _ in rows:
        t['cache_read'] += u.get('cache_read_input_tokens', 0); t['cache_write'] += u.get('cache_creation_input_tokens', 0)
        t['uncached_input'] += u.get('input_tokens', 0); t['output'] += u.get('output_tokens', 0)
        t['max_context'] = max(t['max_context'], u.get('input_tokens', 0) + u.get('cache_creation_input_tokens', 0) + u.get('cache_read_input_tokens', 0))
    t['total'] = t['cache_read'] + t['cache_write'] + t['uncached_input'] + t['output']
    t['fresh'] = t['cache_write'] + t['uncached_input'] + t['output']
    return t

def main(session, out):
    os.makedirs(out, exist_ok=True)
    agents = [('lead', 'lead session', session)]
    for f in sorted(glob.glob(os.path.join(session[:-6], 'subagents', 'agent-*.jsonl'))):
        meta = f[:-6] + '.meta.json'
        desc = json.load(open(meta)).get('description', '') if os.path.exists(meta) else ''
        agents.append((os.path.basename(f)[6:-6], desc, f))
    A, P = [], []
    for aid, desc, f in agents:
        segs = calls(f); rows = [r for s in segs for r in s['rows']]
        if not rows: continue
        model = max(set(r[0] for r in rows), key=[r[0] for r in rows].count)
        A.append(dict(agent=aid, model=model, description=desc, start=rows[0][2], end=rows[-1][2], **total(rows)))
        for i, s in enumerate(x for x in segs if x['rows']):
            P.append(dict(agent=aid, phase=i + 1, model=model, description=desc, start=s['start'], prompt=s['prompt'], **total(s['rows'])))
    for name, data in (('agents.csv', A), ('phases.csv', P)):
        with open(os.path.join(out, name), 'w', newline='', encoding='utf-8') as fh:
            w = csv.DictWriter(fh, fieldnames=list(data[0].keys())); w.writeheader(); w.writerows(data)
    print(len(A), 'agents,', len(P), 'phases ->', out)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
