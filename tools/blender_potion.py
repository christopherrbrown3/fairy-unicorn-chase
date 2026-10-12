"""Original reusable potion, authored in a separate scene through Blender MCP.
Run in Blender. Does not save over or delete objects from the user's open project.
"""
import bpy, math, os
from mathutils import Vector

asset_dir = '/Users/chris/Codex Projects/fairy-unicorn-chase/public/assets/models'
os.makedirs(asset_dir, exist_ok=True)
previous_scene = bpy.context.window.scene
scene = bpy.data.scenes.new('Fairy Unicorn Chase | original potion')
bpy.context.window.scene = scene

def mat(name, color, metallic=0, roughness=.4):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = next(n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    return material

glass = mat('Potion | sea-glass turquoise', (.22, .69, .73), .18, .24)
gold = mat('Potion | soft golden collar', (.95, .69, .25), .32, .32)
cork = mat('Potion | peach cork', (.68, .42, .25))
light = mat('Potion | cream star label', (1, .93, .67))

def lathe(name, profile, material, sides=20):
    vertices = [(r*math.cos(i*math.tau/sides), r*math.sin(i*math.tau/sides), z)
                for r,z in profile for i in range(sides)]
    faces = []
    for row in range(len(profile)-1):
        for i in range(sides):
            a = row*sides+i; b = row*sides+(i+1)%sides
            faces.append((a,b,b+sides,a+sides))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces); mesh.update()
    obj = bpy.data.objects.new(name, mesh); scene.collection.objects.link(obj)
    obj.data.materials.append(material)
    for polygon in mesh.polygons: polygon.use_smooth = True
    return obj

try:
    lathe('Sparkle potion | rounded bottle', [(0,.02),(.23,.03),(.32,.1),(.38,.25),(.4,.43),(.37,.61),(.25,.78),(.12,.85),(.12,1.02),(0,1.02)], glass)
    lathe('Sparkle potion | golden neck ribbon', [(.12,.88),(.16,.88),(.17,.9),(.16,.94),(.12,.94)], gold)
    lathe('Sparkle potion | cork stopper', [(0,1),(.115,1),(.14,1.02),(.14,1.13),(.13,1.16),(0,1.16)], cork)
    # An original extruded five-point star, facing the front of the bottle.
    vertices = []
    for depth in [-.393,-.418]:
        for i in range(10):
            a = math.pi/2+i*math.pi/5; r=.17 if i%2==0 else .077
            vertices.append((math.cos(a)*r, depth, .47+math.sin(a)*r))
    faces = [tuple(range(9,-1,-1)), tuple(range(10,20))]
    for i in range(10): faces.append((i,(i+1)%10,(i+1)%10+10,i+10))
    labelmesh = bpy.data.meshes.new('Star label mesh'); labelmesh.from_pydata(vertices,[],faces); labelmesh.update()
    label = bpy.data.objects.new('Sparkle potion | star label',labelmesh);scene.collection.objects.link(label);label.data.materials.append(light)
    # Sparkles are geometry, so the small asset needs no textures or shaders.
    for i,(x,z) in enumerate([(-.48,.75),(.46,.94),(-.26,1.25)]):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.05,location=(x,0,z))
        obj=bpy.context.object;obj.name='Potion floating sparkle '+str(i);obj.data.materials.append(light)
    for obj in scene.objects: obj.select_set(True)
    bpy.context.view_layer.objects.active = label
    filepath = os.path.join(asset_dir, 'sparkle-potion.glb')
    bpy.ops.export_scene.gltf(filepath=filepath, export_format='GLB', use_active_scene=True, export_cameras=False, export_lights=False)
    print('Exported original potion:', filepath, os.path.getsize(filepath), 'bytes')
    print('Vertices:', sum(len(o.data.vertices) for o in scene.objects if o.type == 'MESH'))
finally:
    bpy.context.window.scene = previous_scene
    print('Restored original Blender scene:', previous_scene.name)
