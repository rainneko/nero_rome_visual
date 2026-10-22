"""ant_walltower · the tower module for the curtain walls along the cliffs of Antium.

8 x 8 m body, walls 14 m high (eaves), slit windows, red band, cornice, pyramid tiled roof.
Foundation down to z = -20 because it stands on uneven cliff tops. Front: any (+X used here).
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_kit import *

reset()

# walls 14 m to the eaves, pyramid roof on top; three slit rows (the top one sits below the red band)
square_tower(None, 0, 0, 8.0, 14.0, wall_mat='stone', roof='pyramid', pitch=30.0, slit_rows=3,
             foundation=20.0, cornice_mat='marble', band_mat='red')

# scale figure (preview only)
human(None, 6, -6)

finish('ant_walltower', front='+X')
