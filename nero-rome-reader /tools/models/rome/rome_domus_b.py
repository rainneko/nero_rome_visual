"""rome_domus_b · aristocratic terrace house B: the plan of house A (see rome_domus_a.py), with 'plaster3' walls,
a three-storey belvedere tower 8 x 8 m on the north-east corner (open loggia on top) and a roof terrace with a
pergola over the west range."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rome_domus_a import house

house('rome_domus_b', 'plaster3', belvedere_on=True)
