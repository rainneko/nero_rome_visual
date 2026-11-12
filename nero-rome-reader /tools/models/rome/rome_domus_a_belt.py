"""rome_domus_a_belt · terrace house A (see rome_domus_a.py) cut down for a plot on the Palatine's terraced belt:
house(..., cut=True). House level z 0 (the belt floor surrounds it), garden T1 z -6 with box-hedge beds, paved strip T2
z -12 (the lowest level; the scene builds the wall on its outer edge at y -20.5), two stair flights."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rome_domus_a import house

house('rome_domus_a_belt', 'plaster2', belvedere_on=False, cut=True)
