"""Optional image audit after construction-stages.mjs (requires Pillow and NumPy)."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
root = Path(__file__).resolve().parents[2] / 'renders/construction'
audit = json.loads((root / 'audit.json').read_text())
checks = []
for asset in ('furnaceA', 'chem'):
    for camera in ('three', 'plan'):
        frames = [f for f in audit['frames'] if f['asset'] == asset and f['camera'] == camera]
        ref = next(f for f in frames if f['stage'] == 'K4')
        baseline = np.array(Image.open(root / ref['file']).convert('RGB'), dtype=np.int16)
        for frame in frames:
            if frame['stage'] in ('K4', 'K5'):
                continue  # K5 smoke is allowed beyond the building footprint.
            current = np.array(Image.open(root / frame['file']).convert('RGB'), dtype=np.int16)
            assert current.shape == baseline.shape == (1080, 1920, 3)
            x0, y0, x1, y1 = frame['siteRect']
            mask = np.ones(current.shape[:2], bool)
            mask[y0:y1, x0:x1] = False
            delta = np.abs(current - baseline).max(2)
            count = int(mask.sum())
            changed = int(((delta > 4) & mask).sum())
            maximum = int(delta[mask].max()) if count else 255
            checks.append(dict(asset=asset, camera=camera, stage=frame['stage'],
                               outsidePixels=count, outsideChangedOver4=changed,
                               outsideMax=maximum, rect=frame['siteRect'],
                               passed=count > 100000 and changed / count < .0001 and maximum <= 8))
report = {'definition': 'Outside conservative projected work bounds plus 50px halo; compare native K4, excluding K5 smoke. Allow tiny nonlocal bloom differences: max channel delta 8, less than 0.01% of pixels over delta 4.',
          'passed': all(c['passed'] for c in checks), 'checks': checks}
(root / 'background-audit.json').write_text(json.dumps(report, indent=2))
assert report['passed'], 'Construction changes leaked into background; see background-audit.json'
print(f'PASS {len(checks)} background checks; maximum {max(c["outsideMax"] for c in checks)} / 255')
