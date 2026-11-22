"""Work order 10: Tiberiana banquet hall clerestory and roof.

Coordinates are local to palace (52, -6, 0) in metres. The generated hall
and side roofs meet the shell at z=7.9. Only the upper shell is exported.
"""

import argparse
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rk
import bl_kit as kit


NAME = "rome_tib_banquet_top"
ROOT = Path(__file__).resolve().parents[3]
MODEL = ROOT / "assets" / "models" / "rome" / f"{NAME}.glb"
RENDERS = ROOT / "renders" / NAME

FRAME = rk.Frame()
WIDTH, LENGTH = 9.0, 42.0
HALF_WIDTH, HALF_LENGTH = WIDTH / 2, LENGTH / 2
WALL_BOTTOM, WALL_TOP = 7.6, 13.3
THICKNESS = 0.75
SILL, SPRING = 9.0, 11.2
PILASTER_BASE = 9.2
PITCH, EAVE, RIDGE = 0.4, 14.5, 16.3
OVERHANG = 0.60
ROOF_X, ROOF_Y = HALF_WIDTH + OVERHANG, HALF_LENGTH + OVERHANG
WELL_HALF, WELL_OUTER = 1.5, 1.8
STONE = "travertine"

EAST = FRAME.sub(HALF_WIDTH, 0, rot=90)
WEST = FRAME.sub(-HALF_WIDTH, 0, rot=-90)
SOUTH = FRAME.sub(0, -HALF_LENGTH)
NORTH = FRAME.sub(0, HALF_LENGTH, rot=180)

VIEWS = {
    "front": ((55, 0, 11), (0, 0, 11), 48, 1512, 610),
    "side": ((0, -54, 11.9), (0, 0, 11.9), 14, 1032, 900),
    "three": ((48, -36, 43), (0, 0, 11.9), 49, 1512, 955),
    "top": ((0, 0, 58), None, 49, 670, 1512),
    "from_below": ((80 * math.cos(math.radians(32)), -80 * math.sin(math.radians(32)), -5),
                   (0, 0, 9), 55, 1512, 930),
    "shell_only": ((39, 52, 36), (0, 0, 11.9), 45, 1512, 955),
}


def face(material, points):
    kit.add_poly(material, points)


def outside(frame, shape, depth=0.0, material="plaster"):
    """CCW polygon in facade coordinates (horizontal, z); depth is inward."""
    face(material, [frame.p(u, depth, z) for u, z in shape])


def rectangle(frame, a, b, bottom, top, depth=0.0, material="plaster"):
    outside(frame, [(a, bottom), (b, bottom), (b, top), (a, top)], depth, material)


def bridge(frame, profile, front, back, material):
    """Visible lining of a CCW recess, from its mouth to its dark end."""
    for a, b in zip(profile, profile[1:] + profile[:1]):
        face(material, [
            frame.p(a[0], front, a[1]), frame.p(b[0], front, b[1]),
            frame.p(b[0], back, b[1]), frame.p(a[0], back, a[1]),
        ])


def arch(center, radius, segments):
    return [(center - radius, SILL), (center + radius, SILL)] + [
        (center + radius * math.cos(math.pi * i / segments),
         SPRING + radius * math.sin(math.pi * i / segments))
        for i in range(segments + 1)
    ]


def recessed_window(frame, center, inner, outer):
    # Bevel from the plaster face to the raised inner edge of the stone surround.
    for i in range(1, len(inner)):
        j = (i + 1) % len(inner)
        face(STONE, [
            frame.p(inner[j][0], -0.04, inner[j][1]),
            frame.p(inner[i][0], -0.04, inner[i][1]),
            frame.p(outer[i][0], 0, outer[i][1]),
            frame.p(outer[j][0], 0, outer[j][1]),
        ])
    bridge(frame, inner, -0.04, 0.50, "plaster")

    # A tapered raised crown merges into the arris just above the arch.
    crown = [(center - 0.095, 11.855), (center + 0.095, 11.855),
             (center + 0.14, 12.023), (center - 0.14, 12.023)]
    foot_left, foot_right = [frame.p(u, -0.045, z) for u, z in crown[:2]]
    top_right, top_left = [frame.p(u, 0, z) for u, z in crown[2:]]
    face(STONE, [foot_left, foot_right, top_right, top_left])
    left_return = frame.p(crown[0][0], -0.026, crown[0][1])
    right_return = frame.p(crown[1][0], -0.026, crown[1][1])
    face(STONE, [foot_left, top_left, left_return])
    face(STONE, [foot_right, right_return, top_right])


def window_wall(frame, half_length, centers, segments):
    rectangle(frame, -half_length, half_length, WALL_BOTTOM, SILL)
    # A continuous skin links all upper jambs. Each interval meets the surround
    # directly at its outer edge, including straight jambs and the faceted arch.
    skyline = [(-half_length, SILL)]
    for center in centers:
        inner = arch(center, 0.60, segments)
        outer = arch(center, 0.78, segments)
        skyline.extend([outer[0], *reversed(outer[1:])])
        recessed_window(frame, center, inner, outer)
    skyline += [(half_length, SILL), (half_length, WALL_TOP), (-half_length, WALL_TOP)]
    outside(frame, skyline)
    # One continuous dark plane closes the blind windows behind the solid wall.
    rectangle(frame, centers[0] - 0.60, centers[-1] + 0.60,
              SILL, 11.80, 0.50, "doorway")


def perimeter(x, y, z):
    return [(-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]


def connect(material, lower, upper, reverse=False):
    for i in range(4):
        j = (i + 1) % 4
        polygon = [lower[i], lower[j], upper[j], upper[i]]
        face(material, polygon[::-1] if reverse else polygon)


def envelope(material, outer_limits, inner_x, inner_y, cap_bottom=False, cap_top=False):
    """Four continuous corners. Optional ends close a shallow masonry course."""
    rings = [perimeter(x, y, z) for x, y, z in outer_limits]
    for lower, upper in zip(rings, rings[1:]):
        connect(material, lower, upper)
    inner_bottom = perimeter(inner_x, inner_y, outer_limits[0][2])
    inner_top = perimeter(inner_x, inner_y, outer_limits[-1][2])
    connect(material, inner_bottom, inner_top, reverse=True)
    if cap_bottom:
        connect(material, inner_bottom, rings[0])
    if cap_top:
        connect(material, rings[-1], inner_top)


def wall_inner():
    inner_x, inner_y = HALF_WIDTH - THICKNESS, HALF_LENGTH - THICKNESS
    inside = perimeter(inner_x, inner_y, WALL_BOTTOM)
    connect("plaster", inside, perimeter(inner_x, inner_y, WALL_TOP), reverse=True)
    connect("plaster", inside, perimeter(HALF_WIDTH, HALF_LENGTH, WALL_BOTTOM))


def sill(frame, a, b, left_return=True, right_return=True):
    d, z = 0.06, SILL - 0.20
    length_a = a - (d if not left_return else 0)
    length_b = b + (d if not right_return else 0)
    rectangle(frame, length_a, length_b, z, SILL, -d, STONE)
    for h, direction in ((z, -1), (SILL, 1)):
        face(STONE, [
            frame.p(length_a, -d, h), frame.p(length_b, -d, h),
            frame.p(b, 0, h), frame.p(a, 0, h),
        ][::direction])
    for u, direction, returned in ((a, -1, left_return), (b, 1, right_return)):
        if returned:
            face(STONE, [frame.p(u, -d, z), frame.p(u, 0, z),
                         frame.p(u, 0, SILL), frame.p(u, -d, SILL)][::direction])


def pilaster(frame, a, b, left_return=True, right_return=True):
    cap_bottom = WALL_TOP - 0.25
    depth, cap_depth = 0.08, 0.14
    shaft_a = a - (depth if not left_return else 0)
    shaft_b = b + (depth if not right_return else 0)
    cap_a = a - (cap_depth if not left_return else 0)
    cap_b = b + (cap_depth if not right_return else 0)
    rectangle(frame, shaft_a, shaft_b, PILASTER_BASE, cap_bottom, -depth, STONE)
    rectangle(frame, cap_a, cap_b, cap_bottom, WALL_TOP, -cap_depth, STONE)
    face(STONE, [frame.p(shaft_a, -depth, PILASTER_BASE), frame.p(a, 0, PILASTER_BASE),
                 frame.p(b, 0, PILASTER_BASE), frame.p(shaft_b, -depth, PILASTER_BASE)])
    face(STONE, [frame.p(cap_a, -cap_depth, cap_bottom), frame.p(shaft_a, -depth, cap_bottom),
                 frame.p(shaft_b, -depth, cap_bottom), frame.p(cap_b, -cap_depth, cap_bottom)])
    for u, direction, returned in ((a, -1, left_return), (b, 1, right_return)):
        if returned:
            profile = [(-depth, PILASTER_BASE), (0, PILASTER_BASE), (0, WALL_TOP),
                       (-cap_depth, WALL_TOP), (-cap_depth, cap_bottom), (-depth, cap_bottom)]
            face(STONE, [frame.p(u, d, z) for d, z in profile][::direction])


def corbel(frame, center):
    # Squared stone noses with sloped soffits overhang the plaster frieze.
    a, b, depth = center - 0.12, center + 0.12, 0.30
    bottom, top = 13.90, 14.10
    rectangle(frame, a, b, bottom, top, -depth, STONE)
    face(STONE, [frame.p(a, -depth, bottom), frame.p(a, 0, top),
                 frame.p(b, 0, top), frame.p(b, -depth, bottom)])
    for u, direction in ((a, -1), (b, 1)):
        face(STONE, [frame.p(u, -depth, bottom), frame.p(u, 0, top),
                     frame.p(u, -depth, top)][::direction])


def entablature():
    def expanded(projection, z):
        return HALF_WIDTH + projection, HALF_LENGTH + projection, z

    inside = HALF_WIDTH - THICKNESS, HALF_LENGTH - THICKNESS
    envelope(STONE, [expanded(0.14, 13.3), expanded(0.14, 13.7)],
             *inside, cap_bottom=True, cap_top=True)
    envelope("plaster", [expanded(0, 13.7), expanded(0, 14.1)], *inside)
    # A stepped crown ends in a sloping top bed under the projecting tile.
    envelope(STONE, [expanded(0.18, 14.1), expanded(0.45, 14.2),
                     expanded(0.45, 14.265), expanded(0, EAVE)],
             *inside, cap_bottom=True, cap_top=True)


def gable(frame):
    center_z, radius = 15.25, 0.5
    angles = (0, 36, 72, 90, 108, 144, 180, 225, 270, 315)
    inner = [(radius * math.cos(math.radians(a)),
              center_z + radius * math.sin(math.radians(a))) for a in angles]
    count = len(inner)
    outer = [(1.22 * u, center_z + 1.22 * (z - center_z)) for u, z in inner]

    # Each ray reaches the boundary of the triangular stone front from its oculus.
    def reach(u, z):
        dz = z - center_z
        if abs(u) < 1e-9:
            u = 0.0
        limits = []
        if dz < 0:
            limits.append((EAVE - center_z) / dz)
        slope = dz + PITCH * abs(u)
        if slope > 0:
            limits.append((RIDGE - center_z) / slope)
        t = min(limits)
        return u * t, center_z + dz * t

    outline = [reach(*p) for p in outer]
    for i in range(count):
        j = (i + 1) % count
        # Add the triangle's corner if two neighboring rays hit different edges.
        corner = None
        for x in (-HALF_WIDTH, HALF_WIDTH):
            if (outline[i][1] > EAVE + 1e-7) != (outline[j][1] > EAVE + 1e-7):
                if (outer[i][0] + outer[j][0]) * x > 0:
                    corner = (x, EAVE)
        wedge = [outer[i], outline[i]]
        if corner is not None:
            wedge.append(corner)
        outside(frame, wedge + [outline[j], outer[j]])
        face(STONE, [
            frame.p(outer[i][0], 0, outer[i][1]),
            frame.p(outer[j][0], 0, outer[j][1]),
            frame.p(inner[j][0], -0.04, inner[j][1]),
            frame.p(inner[i][0], -0.04, inner[i][1]),
        ])
    bridge(frame, inner, -0.04, 0.30, "plaster")
    rectangle(frame, -radius, radius, center_z - radius, center_z + radius, 0.30, "doorway")
    outside(frame, [(-HALF_WIDTH, EAVE), (0, RIDGE), (HALF_WIDTH, EAVE)], THICKNESS)

    # Raking cornices connect the slope to the horizontal stone crown at the eaves.
    for sign in (-1, 1):
        profile = [(sign * HALF_WIDTH, EAVE - 0.045), (0, RIDGE - 0.045),
                   (0, RIDGE - 0.14), (sign * (HALF_WIDTH - 0.35), EAVE)]
        if sign == -1:
            profile.reverse()
        outside(frame, profile, -0.45, STONE)
        bridge(frame, list(reversed(profile)), -0.45, 0.03, STONE)


def roof_height(x):
    return RIDGE - PITCH * abs(x)


def skin(x0, x1, y0, y1):
    face("tile", [(x, y, roof_height(x)) for x, y in
                  ((x0, y0), (x1, y0), (x1, y1), (x0, y1))])


def tile_roll(sign, y, start):
    half_width, height = 0.09, 0.07
    x = sign * ROOF_X
    root = sign * start
    low = [(x, y - half_width, roof_height(x)), (x, y, roof_height(x) + height),
           (x, y + half_width, roof_height(x))]
    high = [(root, v, z - roof_height(x) + roof_height(root)) for _, v, z in low]
    for i in range(2):
        face("tile", [low[i], low[i + 1], high[i + 1], high[i]][::sign])
    # An imbrex is a hollow cover over a solid tile plane, so its nose is open.


def roof():
    for sign in (-1, 1):
        x = sign * ROOF_X
        a, b = sorted((0, x))
        wx = sign * WELL_HALF
        skin(a, b, -ROOF_Y, -WELL_HALF)
        skin(*sorted((x, wx)), -WELL_HALF, WELL_HALF)
        skin(a, b, WELL_HALF, ROOF_Y)
        for y in (-ROOF_Y, ROOF_Y):
            fascia = [(a, y, roof_height(a)), (b, y, roof_height(b)),
                      (b, y, roof_height(b) - 0.085), (a, y, roof_height(a) - 0.085)]
            face("tile", fascia[::-1] if y < 0 else fascia)
            # Close the small underside of the gable roof overhang.
            end = HALF_LENGTH if y > 0 else -HALF_LENGTH
            ya, yb = sorted((y, end))
            face("tile", [(a, ya, roof_height(a) - 0.085), (a, yb, roof_height(a) - 0.085),
                          (b, yb, roof_height(b) - 0.085), (b, ya, roof_height(b) - 0.085)])
        side_height = roof_height(x)
        face("tile", [(x, -ROOF_Y, side_height), (x, ROOF_Y, side_height),
                      (x, ROOF_Y, side_height - 0.085), (x, -ROOF_Y, side_height - 0.085)][::-sign])
        xl, xr = sorted((x, sign * (HALF_WIDTH - THICKNESS)))
        face("tile", [(xl, -HALF_LENGTH, roof_height(xl) - 0.085),
                      (xl, HALF_LENGTH, roof_height(xl) - 0.085),
                      (xr, HALF_LENGTH, roof_height(xr) - 0.085),
                      (xr, -HALF_LENGTH, roof_height(xr) - 0.085)])
        for i in range(42):
            y = -20.5 + i
            tile_roll(sign, y, WELL_OUTER if abs(y) < WELL_OUTER + 0.09 else 0.12)

    # A shallow crest moulding on either side of the interrupted ridge.
    crest = [(-0.12, roof_height(-0.12)), (-0.055, RIDGE + 0.02),
             (0, RIDGE + 0.04), (0.055, RIDGE + 0.02), (0.12, roof_height(0.12))]
    for y0, y1 in ((-ROOF_Y, -WELL_OUTER), (WELL_OUTER, ROOF_Y)):
        for (x0, z0), (x1, z1) in zip(crest, crest[1:]):
            face("tile", [(x0, y0, z0), (x1, y0, z1), (x1, y1, z1), (x0, y1, z0)])
        outside(FRAME.sub(0, y0), list(reversed(crest)), 0, "tile")
        outside(FRAME.sub(0, y1), crest, 0, "tile")


def well():
    # Follow the roof pitch along both end caps. The lip is 0.30 m above
    # the adjacent plane and the plaster lining drops 1.00 m from that lip.
    def point(x, y, offset):
        return x, y, roof_height(x) + offset

    for a, b in ((-WELL_OUTER, -WELL_HALF), (-WELL_HALF, 0),
                 (0, WELL_HALF), (WELL_HALF, WELL_OUTER)):
        for sign in (-1, 1):
            yo, yi = sign * WELL_OUTER, sign * WELL_HALF
            face(STONE, [point(a, yo, 0.30), point(b, yo, 0.30),
                         point(b, yi, 0.30), point(a, yi, 0.30)][::-sign])
            face(STONE, [point(a, yo, 0), point(b, yo, 0),
                         point(b, yo, 0.30), point(a, yo, 0.30)][::-sign])
    for a, b in ((-WELL_HALF, 0), (0, WELL_HALF)):
        for sign in (-1, 1):
            y = sign * WELL_HALF
            face("plaster", [point(a, y, -0.70), point(b, y, -0.70),
                             point(b, y, 0.30), point(a, y, 0.30)][::sign])
        face("doorway", [point(a, -WELL_HALF, -0.70), point(b, -WELL_HALF, -0.70),
                         point(b, WELL_HALF, -0.70), point(a, WELL_HALF, -0.70)])
    for sign in (-1, 1):
        xo, xi = sign * WELL_OUTER, sign * WELL_HALF
        face(STONE, [point(xi, -WELL_HALF, 0.30), point(xo, -WELL_HALF, 0.30),
                     point(xo, WELL_HALF, 0.30), point(xi, WELL_HALF, 0.30)][::sign])
        face(STONE, [point(xo, -WELL_OUTER, 0), point(xo, WELL_OUTER, 0),
                     point(xo, WELL_OUTER, 0.30), point(xo, -WELL_OUTER, 0.30)][::sign])
        face("plaster", [point(xi, -WELL_HALF, -0.70), point(xi, WELL_HALF, -0.70),
                         point(xi, WELL_HALF, 0.30), point(xi, -WELL_HALF, 0.30)][::-sign])


def palmette(center, z):
    # Profile of approved north gate's terracotta palmette, scaled to 0.45 m.
    profile = [(-0.18, 0), (0.18, 0), (0.25, 0.13), (0.50, 0.31), (0.26, 0.27),
               (0.33, 0.43), (0.12, 0.36), (0, 0.50), (-0.12, 0.36), (-0.33, 0.43),
               (-0.26, 0.27), (-0.50, 0.31), (-0.25, 0.13)]
    face("tile", [SOUTH.p(center + x * 0.55, -0.47 + 0.20 * x * x, z + 0.9 * h)
                  for x, h in profile])


def geometry(segments, corbels):
    bay = LENGTH / 13
    centers = [-HALF_LENGTH + (i + 0.5) * bay for i in range(13)]
    for frame in (EAST, WEST):
        window_wall(frame, HALF_LENGTH, centers, segments)
        sill(frame, -HALF_LENGTH, HALF_LENGTH, False, False)
        for i in range(1, 13):
            p = -HALF_LENGTH + i * bay
            pilaster(frame, p - 0.25, p + 0.25)
        for center in centers:
            for i in range(corbels):
                corbel(frame, center + ((i + 0.5) / corbels - 0.5) * bay)

    window_wall(SOUTH, HALF_WIDTH, [-2.5, 0, 2.5], segments)
    rectangle(NORTH, -HALF_WIDTH, HALF_WIDTH, WALL_BOTTOM, WALL_TOP)
    sill(SOUTH, -HALF_WIDTH, HALF_WIDTH, False, False)
    # Only the short stone returns are needed on the solid north wall.
    sill(NORTH, -HALF_WIDTH, -HALF_WIDTH + 0.50, False, True)
    sill(NORTH, HALF_WIDTH - 0.50, HALF_WIDTH, True, False)
    for frame, half in ((EAST, HALF_LENGTH), (WEST, HALF_LENGTH),
                        (SOUTH, HALF_WIDTH), (NORTH, HALF_WIDTH)):
        pilaster(frame, -half, -half + 0.5, False, True)
        pilaster(frame, half - 0.5, half, True, False)
    wall_inner()
    entablature()
    for frame in (SOUTH, NORTH):
        gable(frame)
    roof()
    well()
    for x, z in ((-4.42, EAVE), (0, RIDGE + 0.02), (4.42, EAVE)):
        palmette(x, z)


def export():
    for segments, corbels in ((8, 3), (6, 2)):
        kit._G.clear()
        geometry(segments, corbels)
        shell = kit._build_object("shell")
        shell.data.calc_loop_triangles()
        triangles = len(shell.data.loop_triangles)
        print(f"{NAME}: {triangles} triangles ({segments} arch segments, {corbels} corbels per bay)")
        if triangles <= 3000:
            break
        bpy.data.objects.remove(shell, do_unlink=True)
    else:
        raise RuntimeError(f"Shell exceeds the 3,000-triangle budget ({triangles})")
    assert {mat.name for mat in shell.data.materials} == {"plaster", STONE, "tile", "doorway"}
    assert min(v.co.z for v in shell.data.vertices) >= WALL_BOTTOM - 1e-5
    assert abs(max(abs(v.co.x) for v in shell.data.vertices) - ROOF_X) < 1e-5
    assert abs(max(abs(v.co.y) for v in shell.data.vertices) - ROOF_Y) < 1e-5

    MODEL.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    shell.select_set(True)
    bpy.context.view_layer.objects.active = shell
    bpy.ops.export_scene.gltf(filepath=str(MODEL), use_selection=True, export_format="GLB",
                              export_yup=True, export_apply=True, export_normals=True,
                              export_texcoords=False, export_materials="EXPORT",
                              export_cameras=False, export_lights=False)


def previews(views):
    RENDERS.mkdir(parents=True, exist_ok=True)
    kit._G.clear()
    rk.box(FRAME, 0, 0, 0, 16, LENGTH, 7.9, "plaster")
    podium = kit._build_object("Preview only: hall and side aisles")

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "AgX"

    world = bpy.data.worlds.new("Neutral daylight")
    scene.world = world
    world.use_nodes = True
    node_tree = world.node_tree
    ambient = node_tree.nodes["Background"]
    ambient.inputs[0].default_value = (0.78, 0.80, 0.84, 1.0)
    ambient.inputs[1].default_value = 0.52
    backdrop = node_tree.nodes.new("ShaderNodeBackground")
    backdrop.inputs[0].default_value = (0.19, 0.19, 0.19, 1.0)
    light_path = node_tree.nodes.new("ShaderNodeLightPath")
    mix = node_tree.nodes.new("ShaderNodeMixShader")
    node_tree.links.new(light_path.outputs["Is Camera Ray"], mix.inputs[0])
    node_tree.links.new(ambient.outputs[0], mix.inputs[1])
    node_tree.links.new(backdrop.outputs[0], mix.inputs[2])
    node_tree.links.new(mix.outputs[0], node_tree.nodes["World Output"].inputs["Surface"])

    sun = bpy.data.objects.new("Sunlight", bpy.data.lights.new("Sunlight", "SUN"))
    scene.collection.objects.link(sun)
    sun.data.energy = 2.10
    sun.data.angle = math.radians(10)
    sun.rotation_euler = Vector((-0.55, 0.72, -0.85)).to_track_quat("-Z", "Y").to_euler()
    camera = bpy.data.objects.new("Preview camera", bpy.data.cameras.new("Preview camera"))
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.data.clip_end = 300
    for name in views:
        location, target, ortho, width, height = VIEWS[name]
        podium.hide_render = name != "from_below"
        camera.location = location
        if name == "from_below":
            camera.data.type = "PERSP"
            camera.data.lens = ortho
        else:
            camera.data.type = "ORTHO"
            camera.data.ortho_scale = ortho
        if target is None:
            camera.rotation_euler = (0, 0, 0)
        else:
            kit._look(camera, target)
        scene.render.resolution_x = width
        scene.render.resolution_y = height
        scene.render.filepath = str(RENDERS / f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skip-renders", action="store_true")
    parser.add_argument("--views", nargs="+", choices=tuple(VIEWS), default=tuple(VIEWS))
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    rk.reset()
    export()
    if not args.skip_renders:
        previews(args.views)


if __name__ == "__main__":
    main()
