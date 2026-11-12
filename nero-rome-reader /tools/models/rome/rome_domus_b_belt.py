"""rome_domus_b_belt · terrace house B (see rome_domus_b.py: 'plaster3' walls, belvedere tower, roof terrace) cut down
for a plot on the Palatine's terraced belt: house(..., cut=True), as rome_domus_a_belt.py."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rome_domus_a import house

house('rome_domus_b_belt', 'plaster3', belvedere_on=True, cut=True)
