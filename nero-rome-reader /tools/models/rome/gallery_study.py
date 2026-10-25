"""Small three-bay Roman arcade study. Run with Blender -b --factory-startup -P this_file."""
import math
import os
import bpy


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "renders", "gallery-study"))
os.makedirs(ROOT, exist_ok=True)

# --factory-startup is recommended, but also remove any startup objects if the script
# is run against a non-empty file. This script owns the scene it builds.
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
    for block in list(datablocks):
        if block.users == 0:
            datablocks.remove(block)


def material(name, color):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    return m


plaster = material("Warm grey lime plaster", (0.56, 0.53, 0.47))
stone = material("Pale limestone", (0.69, 0.65, 0.56))
floor_mat = material("Paving · muted limestone", (0.47, 0.45, 0.40))
ceiling_mat = material("Ceiling · chalk", (0.76, 0.73, 0.66))
wood = material("Door · aged chestnut", (0.27, 0.16, 0.095))
reveal = material("Arch reveals · stone shadow", (0.40, 0.37, 0.32))


def cube(name, loc, scale, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    if bevel:
        mod = o.modifiers.new("Soft worn edges", "BEVEL")
        mod.width = bevel
        mod.segments = 1
        o.modifiers.new("Weighted corner normals", "WEIGHTED_NORMAL")
    return o


def arch_wall_bay(index, x0, x1):
    """One solid wall panel whose lower edge follows a semicircular opening."""
    spring, radius, top, yf, yb = 1.62, min((x1 - x0) / 2.0 - 0.18, 1.48), 3.2, -1.225, -0.775
    cx = (x0 + x1) / 2.0
    # The polygon's lower edge turns inward and follows a semicircular opening.
    outline = [(x0, 0.0), (x0, top), (x1, top), (x1, 0.0), (cx + radius, 0.0)]
    for i in range(17):
        a = math.pi * i / 16.0
        outline.append((cx + radius * math.cos(a), spring + radius * math.sin(a)))
    outline.append((cx - radius, 0.0))
    n = len(outline)
    verts = [(x, yf, z) for x, z in outline] + [(x, yb, z) for x, z in outline]
    # Cap faces use the same concave polygon outline; Blender handles this planar ngon.
    faces = [tuple(range(n)), tuple(range(n, 2 * n))[::-1]]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    mesh = bpy.data.meshes.new("Arch-cut wall panel mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(plaster)
    mesh.materials.append(reveal)
    mesh.update()
    obj = bpy.data.objects.new("Bay %d · true round arch" % index, mesh)
    bpy.context.collection.objects.link(obj)
    # Distinct material on the intrados surfaces; front/back plaster remains warm and readable.
    for p in mesh.polygons:
        if len(p.vertices) == 4:
            p.material_index = 1
    return obj


# Floor and continuous rear wall.
cube("Paved floor slab · 10 × 2 m", (0, 0, -0.10), (10, 2.9, 0.20), floor_mat, 0.025)
cube("Rear wall · left", (-2.74, 1.225, 1.60), (4.52, 0.45, 3.20), plaster)
cube("Rear wall · right", (2.74, 1.225, 1.60), (4.52, 0.45, 3.20), plaster)
cube("Rear wall · lintel over narrow door", (0, 1.225, 2.78), (0.96, 0.45, 0.84), plaster)
# Solid short end walls close the corridor at both ends.
for x in (-4.78, 4.78):
    cube("Solid arcade end wall", (x, -0.01, 1.60), (0.44, 2.45, 3.20), plaster)
cube("Narrow timber door", (0, 0.985, 1.05), (0.90, 0.07, 2.10), wood, 0.025)
cube("Door lintel trim", (0, 0.94, 2.14), (1.00, 0.10, 0.08), stone, 0.012)
for x in (-0.38, 0.38):
    cube("Door jamb", (x, 0.94, 1.05), (0.07, 0.10, 2.10), stone, 0.01)
cube("Door handle", (0.29, 0.935, 1.02), (0.045, 0.025, 0.07), stone)

# Three equal semicircular openings across a 10 m frontage.
bounds = [-5.0, -1.6666667, 1.6666667, 5.0]
for i in range(3):
    arch_wall_bay(i + 1, bounds[i], bounds[i + 1])

# Solid end returns close the short corridor; front wall piers retain generous mass between bays.
for x in (-4.78, -1.6666667, 1.6666667, 4.78):
    width = 0.44 if abs(x) > 4 else 0.34
    cube("Arcade pier / end return", (x, -1.0, 1.60), (width, 0.50, 3.20), stone, 0.025)

# Flat pale ceiling canopy and quiet edge cornice.
cube("Pale ceiling canopy", (0, 0, 3.10), (10.0, 2.9, 0.20), ceiling_mat, 0.018)
cube("Front cornice", (0, -1.28, 3.24), (10.05, 0.16, 0.12), stone, 0.018)
cube("Rear cornice", (0, 1.28, 3.24), (10.05, 0.16, 0.12), stone, 0.018)


def aim(obj, point):
    obj.rotation_euler = (mathutils.Vector(point) - obj.location).to_track_quat("-Z", "Y").to_euler()


import mathutils

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = 900
scene.render.resolution_y = 600
scene.render.resolution_percentage = 100
scene.display.shading.light = "STUDIO"
scene.display.shading.studio_light = "paint.sl"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = "BOTH"
scene.display.shading.curvature_ridge_factor = 1.25
scene.display.shading.curvature_valley_factor = 1.0
scene.display.shading.background_type = "WORLD"
scene.display.shading.background_color = (0.16, 0.17, 0.18)
scene.view_settings.view_transform = "Standard"
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.camera = None

def make_camera(name, location, target, lens):
    data = bpy.data.cameras.new(name)
    cam = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(cam)
    cam.location = location
    data.lens = lens
    aim(cam, target)
    return cam


# Three-quarter exterior reveals wall depth and all three arch openings.
camera = make_camera("Camera · three-quarter arcade", (7.8, -11.8, 6.8), (0, 0.15, 1.45), 52)
scene.camera = camera
scene.render.filepath = os.path.join(ROOT, "three.png")
bpy.ops.render.render(write_still=True)

# Street elevation: nearly frontal, with a slight lift for a legible pavement strip.
camera.location = (0.45, -16.5, 4.5)
aim(camera, (0, 0.05, 1.55))
camera.data.lens = 55
scene.render.filepath = os.path.join(ROOT, "street.png")
bpy.ops.render.render(write_still=True)

# Save a useful default view and the complete source scene.
scene.camera = camera
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "gallery.blend"))

# Export only the architectural study meshes, without the presentation cameras.
bpy.ops.object.select_all(action="DESELECT")
for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        obj.select_set(True)
bpy.context.view_layer.objects.active = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, "gallery.glb"), export_format="GLB", use_selection=True)

# Evaluate mesh triangles for a reproducible complexity report.
depsgraph = bpy.context.evaluated_depsgraph_get()
triangles = 0
for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        triangles += len(mesh.loop_triangles)
        evaluated.to_mesh_clear()
print("GALLERY_STUDY_TRIANGLES=%d" % triangles)
for filename in ("gallery.blend", "gallery.glb", "three.png", "street.png"):
    print("GALLERY_STUDY_FILE=%s" % os.path.join(ROOT, filename))
