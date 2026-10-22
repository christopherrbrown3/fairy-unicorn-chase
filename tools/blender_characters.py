"""Original Fairy Unicorn Chase character masters, authored with Blender.

Run with Blender 5.x: blender --background --factory-startup --python this_file
Set PROJECT_DIR below to build in another checkout.
The live MCP run creates its own scene and restores the user's active scene.
The character master can be saved separately from the exported GLBs.
Game coordinates are X right, Y up, Z forward; the exporter converts to glTF.
"""
import bpy
import bmesh
import math
from mathutils import Vector, Euler

PROJECT_DIR = '/Users/chris/Codex Projects/fairy-unicorn-chase'
previous_scene = bpy.context.window.scene
scene = bpy.data.scenes.new('Fairy Unicorn Chase | character atelier')
bpy.context.window.scene = scene
scene.unit_settings.scale_length = 1
TAU = math.tau


def xyz(p):
    return Vector((p[0], -p[2], p[1]))


def game(p):
    return Vector((p[0], p[2], -p[1]))


def linear(v):
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4


def rgb(hex_color):
    return tuple(linear(int(hex_color[i:i+2], 16) / 255) for i in (1, 3, 5))


def material(name, color, roughness=.45, metalness=0, alpha=1):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*rgb(color), alpha)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metalness
    shader.inputs['Alpha'].default_value = alpha
    mat.diffuse_color = (*rgb(color), alpha)
    if alpha < 1:
        mat.use_nodes = True
        mat.surface_render_method = 'DITHERED'
    return mat


coat = material('Coat | velvet', '#ffffff', .53)
hair = [material('Hair | strand ' + str(i), c, .32, .08) for i, c in enumerate(
    ['#ffd45d', '#f4bc36', '#ffe393', '#dca02b', '#fff1bd'])]
gold = material('Gold | brushed champagne', '#e9bd68', .29, .72)
cream = material('Ivory | embroidered silk', '#f9e9bf', .48)
leather = material('Leather | saddle and bridle', '#7d4c3b', .51)
blue = material('Dress | cornflower silk', '#448fce', .48)
blue_dark = material('Dress | indigo piping', '#245a99', .47)
blue_light = material('Dress | sky organza', '#a6d8ed', .49)
skin = material('Skin | peach', '#f7cfb0', .51)
blush = material('Blush | rose', '#d48d86', .6)
lip = material('Smile | rosewood', '#9d6868', .52)
eye_white = material('Eyes | warm porcelain', '#fff9ec', .25)
iris = material('Eyes | iris', '#468aaa', .25)
limbal = material('Eyes | limbal ring', '#496372', .34)
ink = material('Eyes | midnight', '#1d2539', .22)
shine = material('Eyes | catchlight', '#ffffff', .12)
hoof = material('Hooves | polished horn', '#78564e', .32)
nostril = material('Nostrils | soft umber', '#80535b', .7)
wing_mat = material('Wings | opal membrane', '#b8dfef', .27, .15, .43)
wing_vein = material('Wings | pearl veins', '#ddedf1', .36, .15)

parts = []


def mesh(name, vertices, faces, mat, bone=None, uv=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata([xyz(v) for v in vertices], [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    if mat:
        data.materials.append(mat)
    for poly in data.polygons:
        poly.use_smooth = True
    if uv:
        layer = data.uv_layers.new(name='UVMap')
        for poly in data.polygons:
            for loop_index in poly.loop_indices:
                layer.data[loop_index].uv = uv[data.loops[loop_index].vertex_index]
    if bone:
        obj.vertex_groups.new(name=bone).add(list(range(len(vertices))), 1, 'REPLACE')
    parts.append(obj)
    return obj


def ellipsoid(name, center, radii, mat, bone=None, rotation=(0, 0, 0), sides=24, rings=16):
    matrix = Euler(rotation).to_matrix()
    vertices, uv = [], []
    for j in range(rings + 1):
        a = math.pi * j / rings
        for i in range(sides + 1):
            b = TAU * i / sides
            v = matrix @ Vector((radii[0] * math.sin(a) * math.cos(b), radii[1] * math.cos(a), radii[2] * math.sin(a) * math.sin(b)))
            vertices.append(Vector(center) + v)
            uv.append((i / sides, j / rings))
    faces = []
    for j in range(rings):
        for i in range(sides):
            a = j * (sides + 1) + i
            faces.append((a, a+1, a+sides+2, a+sides+1))
    return mesh(name, vertices, faces, mat, bone, uv)


def sample(points, t):
    points = [Vector(p) for p in points]
    u = min(t, .999999) * (len(points)-1)
    i = int(u)
    f = u-i
    a, b, c, d = points[max(i-1, 0)], points[i], points[min(i+1, len(points)-1)], points[min(i+2, len(points)-1)]
    return .5 * ((2*b) + (-a+c)*f + (2*a-5*b+4*c-d)*f*f + (-a+3*b-3*c+d)*f*f*f)


def strand(name, points, radius, mat, bone, flat=1, segments=28, sides=10, taper=True, grooves=0):
    vertices, uv = [], []
    previous_right = None
    for j in range(segments+1):
        t = j/segments
        p = sample(points, t)
        direction = (sample(points, min(1, t+.002)) - sample(points, max(0, t-.002))).normalized()
        guide = Vector((0, 0, 1)) if abs(direction.z) < .94 else Vector((0, 1, 0))
        # Parallel transport prevents the cross section snapping when a curl
        # passes the guide axis (which otherwise creates visible ribbon spikes).
        right = direction.cross(guide).normalized() if previous_right is None else (previous_right-direction*previous_right.dot(direction)).normalized()
        previous_right = right
        normal = direction.cross(right).normalized()
        r = radius * (max(.025, (math.sin(math.pi*(.1+.9*t)))**.5) if taper else 1)
        for i in range(sides+1):
            a = TAU*i/sides
            relief = 1 + grooves*math.cos(a*5)
            vertices.append(p + r*relief*(right*math.cos(a) + normal*math.sin(a)*flat))
            uv.append((i/sides, t*3))
    faces = []
    for j in range(segments):
        for i in range(sides):
            a = j*(sides+1)+i
            faces.append((a, a+1, a+sides+2, a+sides+1))
    faces.extend([tuple(range(sides, -1, -1)), tuple(segments*(sides+1)+i for i in range(sides+1))])
    return mesh(name, vertices, faces, mat, bone, uv)


def line(name, points, radius, mat, bone, segments=24):
    return strand(name, points, radius, mat, bone, segments=segments, sides=6, taper=False)


def star(name, center, size, mat, bone, normal=(0, 0, 1)):
    n = Vector(normal).normalized()
    u = Vector((0, 1, 0)).cross(n).normalized()
    v = n.cross(u)
    verts = [Vector(center) + n*.008]
    for i in range(10):
        a = math.pi/2+math.pi*i/5
        r = size if i%2 == 0 else size*.43
        verts.append(Vector(center)+u*math.cos(a)*r+v*math.sin(a)*r)
    return mesh(name, verts, [(0, i+1, (i+1)%10+1) for i in range(10)], mat, bone)


def rigid_weights(obj, bone):
    obj.vertex_groups.clear()
    obj.vertex_groups.new(name=bone).add(list(range(len(obj.data.vertices))), 1, 'REPLACE')


def join(objects, name):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    return obj


def sculpt(objects, name, voxel=.038):
    obj = join(objects, name)
    obj.data.remesh_voxel_size = voxel
    bpy.ops.object.voxel_remesh()
    smooth = obj.modifiers.new('Hand smoothed organic silhouette', 'SMOOTH')
    smooth.factor, smooth.iterations = 1.15, 6
    bpy.ops.object.modifier_apply(modifier=smooth.name)
    decimate = obj.modifiers.new('Mobile topology', 'DECIMATE')
    decimate.ratio = .56
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def paint(obj, values):
    colors = obj.data.color_attributes.new(name='Color', type='FLOAT_COLOR', domain='POINT')
    for value, color in zip(values, colors.data):
        color.color = (*value, 1)
    obj.data.color_attributes.active_color = colors


def blend(a, b, t):
    return tuple(x*(1-t)+y*t for x, y in zip(a, b))


def eye(center, normal, size, bone, lashes=False, socket_color='#fff7ee'):
    eye_start = len(parts)
    n = Vector(normal).normalized()
    # The local eye Z faces the camera; its Y stays vertical.
    angle = math.atan2(n.x, n.z)
    center = Vector(center)
    socket=ellipsoid('Sculpted eye socket', center-n*.028, (size*1.20, size*1.16, .037), coat if not lashes else skin, bone, (0, angle, 0))
    if not lashes: paint(socket,[rgb(socket_color)]*len(socket.data.vertices))
    ellipsoid('Eye sclera', center, (size*1.10, size*.91, .029), eye_white, bone, (0, angle, -.1*n.x))
    ellipsoid('Iris limbal ring', center+n*.025, (size*.65, size*.77, .014), limbal, bone, (0, angle, 0))
    ellipsoid('Luminous iris', center+n*.035, (size*.59, size*.70, .011), iris, bone, (0, angle, 0))
    ellipsoid('Deep pupil', center+n*.044, (size*.34, size*.48, .008), ink, bone, (0, angle, 0))
    tangent = Vector((math.cos(angle), 0, -math.sin(angle)))
    ellipsoid('Eye key reflection', center+n*.053+tangent*(-size*.22)+Vector((0,size*.30,0)), (size*.14, size*.16, .006), shine, bone, (0, angle, 0), sides=12, rings=8)
    ellipsoid('Eye soft reflection', center+n*.053+tangent*(size*.20)-Vector((0,size*.26,0)), (size*.06, size*.07, .005), shine, bone, (0, angle, 0), sides=12, rings=8)
    arc = [center+tangent*(math.cos(a)*size*1.10)+Vector((0,math.sin(a)*size*.90,0))+n*.014 for a in [math.pi*i/16 for i in range(17)]]
    line('Upper velvet eyelid', arc, .006 if lashes else .009, ink if lashes else leather, bone)
    lower = [center+tangent*(math.cos(a)*size*1.10)+Vector((0,math.sin(a)*size*.90,0))+n*.008 for a in [math.pi+math.pi*i/16 for i in range(17)]]
    line('Lower eyelid', lower, .004, blush if lashes else cream, bone)
    if lashes:
        for i in range(3):
            a = .35+i*.22 if center.x > 0 else math.pi-.35-i*.22
            start = center+tangent*(math.cos(a)*size)+Vector((0,math.sin(a)*size,0))+n*.02
            line('Silken lash', [start, start+tangent*(.018 if center.x>0 else -.018)+Vector((0,.022,0))], .003, ink, bone, 8)
    for obj in parts[eye_start+1:]:
        obj.vertex_groups.new(name='blink').add(list(range(len(obj.data.vertices))),1,'REPLACE')


def make_rig(name, bones):
    armature = bpy.data.armatures.new(name+' skeleton')
    rig = bpy.data.objects.new(name+' rig', armature)
    scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for name, pos, parent in bones:
        bone = armature.edit_bones.new(name)
        bone.head = xyz(pos)
        bone.tail = bone.head + Vector((0, 0, .16))
        if parent:
            bone.parent = armature.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    return rig


def finish(name, bones, start, output):
    objects = [obj for obj in list(scene.objects) if obj.type == 'MESH' and obj.get('finished') is None]
    # Transparent wings stay separate for correct depth sorting.
    opaque, transparent = [], []
    for obj in objects:
        if not obj.data.color_attributes.get('Color'):
            paint(obj, [(1, 1, 1)] * len(obj.data.vertices))
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
        bm.to_mesh(obj.data)
        bm.free()
        (transparent if wing_mat in obj.data.materials[:] else opaque).append(obj)
    merged = [join(opaque, name+' | sculpt and wardrobe')]
    for obj in merged:
        if obj.vertex_groups.get('blink'):
            obj.shape_key_add(name='Basis')
            blink = obj.shape_key_add(name='Blink')
            index = obj.vertex_groups['blink'].index
            eye_height = 3.267 if name=='Mia' else 2.49
            for vertex in obj.data.vertices:
                if any(g.group==index for g in vertex.groups):
                    blink.data[vertex.index].co.z = eye_height+(vertex.co.z-eye_height)*.04
    for obj in transparent:
        merged.append(obj)
    rig = make_rig(name, bones)
    for obj in merged:
        obj.parent = rig
        mod = obj.modifiers.new('Character deformation', 'ARMATURE')
        mod.object = rig
        obj['finished'] = True
    bpy.ops.object.select_all(action='DESELECT')
    rig.select_set(True)
    for obj in merged:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=PROJECT_DIR+'/public/assets/models/'+output, export_format='GLB', use_selection=True, use_active_scene=True, export_vertex_color='ACTIVE', export_animations=False, export_yup=True, export_extras=False)
    triangles = sum(sum(len(p.vertices)-2 for p in obj.data.polygons) for obj in merged)
    print(name, 'exported:', triangles, 'triangles;', len(bones), 'bones')
    return rig


def pony(unicorn):
    start = len(parts)
    label = 'Unicorn' if unicorn else 'Glender'
    bones = [('root',(0,0,0),None), ('neck',(0,1.62,.47),'root'), ('head',(0,2.32,.91),'neck'), ('mane',(0,2.53,.62),'neck'), ('tail',(0,1.65,-.91),'root')]
    legs = []
    for side in [-1,1]:
        for front in [False,True]:
            name = ('front' if front else 'back')+('_L' if side<0 else '_R')
            z = .57 if front else -.68
            knee_z = z+.025 if front else z-.11
            bones.extend([(name,(side*.36,1.37,z),'root'), (name+'_shin',(side*.37,.66,knee_z),name)])
            legs.append((name,side,z,knee_z))
    volumes = []
    def volume(pos, scale, rot=(0,0,0)):
        volumes.append(ellipsoid('Anatomy volume',pos,scale,coat,rotation=rot))
    volume((0,1.43,-.13),(.51,.52,.86))
    volume((0,1.43,-.65),(.52,.53,.51))
    volume((0,1.5,.48),(.44,.57,.46))
    volume((0,1.98,.58),(.33,.65,.37),(.29,0,0))
    volume((0,2.42,.92),(.325,.43,.38),(.15,0,0))
    volume((0,2.32,1.2),(.28,.28,.40),(.25,0,0))
    volume((0,2.17,1.48),(.28,.21,.28))
    volume((0,2.10,1.40),(.245,.14,.29))
    for name, side, z, knee_z in legs:
        volume((side*.36,1.13,z),(.18,.40,.205))
        volume((side*.37,.73,knee_z),(.13,.20,.135))
        volume((side*.37,.43,z+.02),(.092,.29,.11),(.08,0,0))
        volume((side*.37,.19,z+.06),(.13,.16,.15))
    body = sculpt(volumes, label+' continuous anatomy',.032)
    body.data.materials.clear()
    body.data.materials.append(coat)
    base = rgb('#fff7ee' if unicorn else '#cf9269')
    light = rgb('#fffef9' if unicorn else '#eab78c')
    muzzle = rgb('#e9bfca' if unicorn else '#efc1a2')
    def color(p):
        x,y,z = p
        c = blend(base,light,min(.85,max(0,(y-.25)/2.9)))
        m = max(0,min(1,(z-1.22)/.25))*max(0,min(1,(2.46-y)/.2))
        c = blend(c,muzzle,m*.8)
        if not unicorn:
            blaze = max(0,1-abs(x)/(.06+.028*math.sin(y*7))) * max(0,min(1,(z-.93)/.22))*max(0,min(1,(y-2.18)/.15))
            c = blend(c,rgb('#fff4d8'),blaze*.92)
        return c
    paint(body,[color(game(v.co)) for v in body.data.vertices])
    groups = {name:body.vertex_groups.new(name=name) for name,_,_ in bones}
    for v in body.data.vertices:
        p=game(v.co); x,y,z=p
        weights={'root':1}
        if y>1.63 and z>.13:
            neck=min(1,(y-1.63)/.42)*min(1,(z-.13)/.31)
            head=min(1,max(0,(y-2.12)/.35),max(0,(z-.68)/.28))
            weights={'root':1-neck,'neck':neck*(1-head),'head':neck*head}
        if y<1.25 and abs(x)>.19:
            distances=[(x-leg[1]*.36)**2+(z-leg[2])**2 for leg in legs]
            name,side,lz,kz=legs[distances.index(min(distances))]
            leg_weight=min(1,max(0,(1.25-y)/.37))*min(1,max(0,(abs(x)-.19)/.11))
            knee=min(1,max(0,(.85-y)/.34))
            weights={'root':1-leg_weight,name:leg_weight*(1-knee),name+'_shin':leg_weight*knee}
        for name,w in weights.items():
            if w>.00001: groups[name].add([v.index],w,'REPLACE')
    for side in [-1,1]:
        ear=ellipsoid('Tapered listening ear',(side*.235,2.89,.83),(.105,.31,.12),coat,'head',(0,0,-side*.23))
        paint(ear,[light] * len(ear.data.vertices))
        ellipsoid('Velvet ear interior',(side*.249,2.91,.925),(.061,.205,.021),blush,'head',(0,0,-side*.23))
        eye((side*.286,2.49,1.169),(side*.84,.04,.56),.111,'head',socket_color='#fff7ee' if unicorn else '#e0ab80')
        ellipsoid('Recessed nostril',(side*.178,2.24,1.685),(.052,.034,.013),nostril,'head',(0,side*.45,-side*.25))
        line('Muzzle crease',[(side*.235,2.12,1.61),(side*.24,2.09,1.53),(side*.22,2.10,1.43)],.009,lip,'head',16)
    # Layered ribbons form real locks, with tapered tips and carved strand relief.
    for i in range(14):
        t=i/13
        points=[(-.025,2.85-t*.75,.86-t*.52),(.23,2.77-t*.57,.76-t*.56),(.40,2.46-t*.36,.63-t*.62),(.43,2.19-t*.37,.39-t*.60),(.48,2.18-t*.47,.19-t*.58)]
        strand('Layered mane lock',points,.073+(i%3)*.008,hair[i%5],'mane',flat=.65,grooves=.055)
    for i in range(7):
        x=(i-3)*.055
        strand('Swept forelock',[(x*.6-.05,2.86,.88),(x+.015,2.88,1.08),(x+.12,2.73,1.27),(.13+i*.020,2.60-i*.023,1.30)],.066,hair[i%5],'head',flat=.58,grooves=.055)
    for i in range(15):
        a=TAU*i/15
        x=math.cos(a)*.12
        strand('Silken tail lock',[(x*.4,1.69,-.91),(x,1.68,-1.2),(x*1.7+.05,1.34,-1.47),(x*1.6+.14,.81,-1.53),(x*.6+.35,.57+math.sin(a)*.06,-1.45)],.075,hair[i%5],'tail',flat=.75,grooves=.055)
    for name,side,z,knee_z in legs:
        ellipsoid('Sculpted hoof',(side*.37,.115,z+.105),(.155,.12,.215),hoof,name+'_shin',sides=24,rings=12)
        line('Hoof coronet',[(side*.37+math.cos(a)*.135,.205,z+.085+math.sin(a)*.17) for a in [TAU*i/32 for i in range(33)]],.014,cream,name+'_shin')
        if unicorn:
            line('Hoof gold inlay',[(side*.37+math.cos(a)*.152,.10,z+.10+math.sin(a)*.21) for a in [TAU*i/32 for i in range(33)]],.008,gold,name+'_shin')
    if unicorn:
        horn_points=[(0,2.78,1.04),(0,3.05,1.11),(0,3.31,1.18),(0,3.52,1.23)]
        horn=strand('Ivory spiral horn',horn_points,.093,cream,'head',flat=1,segments=32,sides=16)
        for v in horn.data.vertices:
            t=(v.index//17)/32
            center=sample(horn_points,t)
            factor=max(.012,(1-t)**.8)/max(.025,math.sin(math.pi*(.1+.9*t))**.5)
            v.co=xyz(center+(game(v.co)-center)*factor)
        points=[]
        for i in range(121):
            t=i/120; a=t*TAU*5; r=.095*(1-t)**.8
            points.append((math.cos(a)*r,2.80+t*.69,1.045+t*.18+math.sin(a)*r))
        strand('Golden horn helix',points,.011,gold,'head',segments=120,sides=6)
        for side in [-1,1]:
            for j in range(3):
                star('Pearl constellation',(side*(.48-j*.004),1.58-j*.09,-.57+j*.22),.043,cream,'root',(side,0,0))
    else:
        for side in [-1,1]:
            for z,y,r in [(-.62,1.63,.16),(-.31,1.40,.11),(-.75,1.27,.075)]:
                star('Glender golden star',(side*.508,y,z),r,gold,'root',(side,0,0))
                star('Star enamel center',(side*.515,y,z),r*.76,cream,'root',(side,0,0))
        ellipsoid('Quilted cornflower saddle blanket',(0,1.89,-.19),(.54,.105,.59),blue_dark,'root')
        ellipsoid('Soft leather saddle',(0,1.97,-.19),(.37,.095,.43),leather,'root')
        for side in [-1,1]:
            line('Saddle blanket piping',[(side*.48,1.90,.25),(side*.55,1.87,-.12),(side*.48,1.88,-.64)],.014,gold,'root')
            line('Leather bridle cheekpiece',[(side*.26,2.73,.76),(side*.32,2.43,.99),(side*.28,2.24,1.46)],.018,leather,'head')
            line('Soft riding rein',[(side*.29,2.23,1.42),(side*.53,2.11,.81),(side*.30,2.38,.39)],.012,leather,'root')
            ellipsoid('Bridle rosette',(side*.32,2.43,.99),(.025,.037,.037),gold,'head')
        line('Noseband',[(-.28,2.24,1.46),(-.18,2.3,1.66),(0,2.32,1.72),(.18,2.3,1.66),(.28,2.24,1.46)],.018,leather,'head')
    return finish(label,bones,start,'unicorn.glb' if unicorn else 'glender.glb')


def mia():
    start=len(parts)
    bones=[('root',(0,0,0),None),('spine',(0,2.12,-.12),'root'),('head',(0,3.02,-.06),'spine'),('hair',(0,3.34,-.21),'head'),('arm_L',(-.265,2.69,.015),'spine'),('arm_R',(.265,2.69,.015),'spine'),('wing_L',(-.15,2.72,-.27),'spine'),('wing_R',(.15,2.72,-.27),'spine')]
    face=sculpt([
        ellipsoid('Face volume',(0,3.23,-.02),(.303,.366,.272),skin),
        ellipsoid('Cheek volume',(-.15,3.14,.107),(.153,.153,.15),skin),
        ellipsoid('Cheek volume',(.15,3.14,.107),(.153,.153,.15),skin),
        ellipsoid('Chin volume',(0,3.025,.066),(.177,.122,.18),skin),
        ellipsoid('Nose bridge',(0,3.193,.245),(.037,.073,.048),skin),
        ellipsoid('Nose tip',(0,3.156,.279),(.046,.036,.044),skin),
    ],'Mia sculpted face',.014)
    rigid_weights(face,'head')
    face.data.materials.clear(); face.data.materials.append(coat)
    base=rgb('#f7cfb0'); rosy=rgb('#e6a596')
    def face_color(p):
        x,y,z=p
        cheeks=math.exp(-((abs(x)-.20)**2/.003+(y-3.12)**2/.003+(z-.21)**2/.012))
        return blend(base,rosy,cheeks*.52)
    paint(face,[face_color(game(v.co)) for v in face.data.vertices])
    ellipsoid('Neck',(0,2.94,-.04),(.092,.16,.10),skin,'spine')
    for side in [-1,1]:
        ellipsoid('Fairy ear',(side*.30,3.22,-.016),(.071,.105,.054),skin,'head',(0,0,-side*.2))
        ellipsoid('Ear interior',(side*.333,3.22,.016),(.023,.06,.015),blush,'head')
        eye((side*.126,3.267,.228),(side*.13,0,1),.074,'head',True)
        line('Expressive eyebrow',[(side*.065,3.382,.217),(side*.123,3.402,.215),(side*.197,3.379,.195)],.012,hair[3],'head')
        for j in range(3):
            ellipsoid('Tiny freckle',(side*(.164+j*.022),3.16+(j%2)*.012,.244-j*.012),(.0045,.0038,.003),blush,'head',sides=8,rings=6)
    line('Kind smile',[(-.069,3.054,.254),(-.034,3.035,.269),(0,3.029,.274),(.035,3.035,.269),(.069,3.054,.254)],.009,lip,'head')
    line('Lower lip',[(-.036,3.024,.265),(0,3.017,.273),(.036,3.024,.265)],.008,blush,'head')
    # Fitted bodice with a waist, shoulder shaping, and a physically folded skirt.
    ellipsoid('Silk bodice',(0,2.58,-.06),(.256,.32,.185),blue,'spine')
    ellipsoid('Waist sash',(0,2.405,-.047),(.268,.044,.196),blue_dark,'spine')
    for layer in [0,1]:
        verts,uv=[],[]; sides=96; rings=14
        for j in range(rings+1):
            t=j/rings
            for i in range(sides+1):
                a=TAU*i/sides
                fold=math.cos(a*10)*.025*t*t
                r=.235+t**.75*(.36-layer*.024)+fold
                y=2.41-t*(.46+layer*.025)+math.cos(a*5)*.038*t**4-abs(math.sin(a))*.06*t
                verts.append((math.sin(a)*r,y,-.08+math.cos(a)*r*.80))
                uv.append((i/sides,t))
        faces=[]
        for j in range(rings):
            for i in range(sides):
                a=j*(sides+1)+i
                faces.append((a,a+sides+1,a+sides+2,a+1))
        skirt=mesh('Scalloped silk overskirt' if layer==0 else 'Pale underskirt',verts,faces,blue if layer==0 else blue_light,'spine',uv)
        # Both sides are visible when Glender jumps.
        skirt.data.materials[0].use_backface_culling=False
        hem=[verts[rings*(sides+1)+i] for i in range(sides+1)]
        line('Embroidered scalloped hem',hem,.010,cream,'spine',96)
    for i in range(10):
        a=TAU*(i+.5)/10
        points=[]
        for j in range(12):
            t=.2+j/11*.72; r=.235+t**.75*.36+math.cos(a*10)*.025*t*t
            points.append((math.sin(a)*r,2.41-t*.46,-.08+math.cos(a)*r*.80))
        line('Dress tailored seam',points,.0045,blue_light,'spine',16)
        star('Hem embroidered star',(math.sin(a)*.536,2.04-abs(math.sin(a))*.04,-.08+math.cos(a)*.43),.026,cream,'spine',(math.sin(a),.3,math.cos(a)))
    line('Sweetheart neckline',[(-.21,2.78,.036),(-.12,2.77,.105),(0,2.71,.137),(.12,2.77,.105),(.21,2.78,.036)],.010,cream,'spine')
    star('Mia star brooch',(0,2.64,.136),.061,gold,'spine')
    ellipsoid('Brooch sapphire',(0,2.64,.15),(.021,.025,.015),blue_light,'spine',sides=12,rings=10)
    for side in [-1,1]:
        arm='arm_L' if side<0 else 'arm_R'
        ellipsoid('Puffed silk sleeve',(side*.28,2.682,.012),(.137,.154,.139),blue,arm,(0,0,side*.25))
        line('Sleeve cuff',[(side*(.28+math.cos(a)*.087),2.565,.045+math.sin(a)*.09) for a in [TAU*i/24 for i in range(25)]],.009,cream,arm)
        arm_mesh=sculpt([
            ellipsoid('Upper arm',(side*.328,2.494,.083),(.067,.147,.076),skin,rotation=(-.32,0,side*.18)),
            ellipsoid('Forearm',(side*.35,2.386,.202),(.059,.086,.145),skin,rotation=(-.55,0,0)),
            ellipsoid('Hand',(side*.31,2.385,.343),(.076,.055,.084),skin),
        ],'Mia gently bent arm',.017)
        rigid_weights(arm_mesh,arm)
        ellipsoid('Thumb',(side*.263,2.406,.351),(.031,.034,.046),skin,arm)
        for j in range(3):
            line('Finger crease',[(side*(.287+j*.024),2.353,.34),(side*(.287+j*.024),2.361,.38)],.002,blush,arm,8)
        ellipsoid('Seated knee',(side*.46,1.958,.16),(.105,.16,.125),skin,'spine')
        ellipsoid('Blue riding boot',(side*.475,1.741,.19),(.108,.188,.12),blue_dark,'spine')
        ellipsoid('Pointed fairy boot',(side*.475,1.62,.29),(.111,.086,.20),blue_dark,'spine')
        line('Boot cuff',[(side*.475+math.cos(a)*.109,1.86,.19+math.sin(a)*.12) for a in [TAU*i/24 for i in range(25)]],.012,gold,'spine')
        star('Boot star',(side*.475,1.65,.475),.035,gold,'spine')
    # Hair cap follows the skull; a variable hairline leaves the face open.
    verts,faces,uv=[],[],[]
    for j in range(17):
        for i in range(49):
            a=TAU*i/48; back=(1-math.cos(a))*.5
            polar=(.98+back*1.02)*j/16
            verts.append((math.sin(a)*math.sin(polar)*.325,3.26+math.cos(polar)*.365,-.035+math.cos(a)*math.sin(polar)*.283))
            uv.append((i/48,j/16))
    for j in range(16):
        for i in range(48):
            a=j*49+i;faces.append((a,a+49,a+50,a+1))
    mesh('Tailored blonde hair cap',verts,faces,hair[1],'head',uv)
    for i in range(15):
        t=(i-7)/7;x=t*.275
        points=[(x*.68,3.54,-.17),(x,3.30,-.30-abs(t)*.025),(x*1.10+math.sin(i)*.022,2.99,-.34),(x*1.11+.06,2.76,-.41),(x*.97+.035,2.62+(i%3)*.024,-.46)]
        strand('Blonde flowing back lock',points,.055,hair[i%5],'hair',flat=.65,grooves=.045)
    for side in [-1,1]:
        for i in range(4):
            points=[(side*(.21+i*.022),3.51-i*.034,.09),(side*(.29+i*.018),3.25-i*.045,.07),(side*(.31+i*.021),2.99-i*.02,-.02),(side*(.27+i*.025),2.81,-.13),(side*(.37+i*.015),2.77,-.24)]
            strand('Face framing curl',points,.047,hair[(i+1)%5],'hair',flat=.65,grooves=.05)
    for i in range(6):
        t=i/5
        strand('Side swept fringe',[(-.15+t*.044,3.58,.036),(-.12+t*.055,3.55,.206),(.035+t*.048,3.44,.26),(.18+t*.025,3.35-t*.07,.18)],.055,hair[i%5],'head',flat=.51,grooves=.045)
    # An actual floral crown, small enough to preserve Mia's silhouette.
    crown=[]
    for i in range(49):
        a=-1.25+2.5*i/48
        crown.append((math.sin(a)*.317,3.51+math.cos(a)*.016,-.02+math.cos(a)*.24))
    line('Delicate gold circlet',crown,.011,gold,'head',48)
    for i in range(5):
        a=(i-2)*.42; center=Vector((math.sin(a)*.31,3.54,-.02+math.cos(a)*.241))
        for j in range(5):
            b=TAU*j/5
            ellipsoid('Crown enamel petal',center+Vector((math.cos(b)*.028,math.sin(b)*.027,0)),(.019,.027,.012),cream,'head',(0,0,b-math.pi/2),sides=12,rings=8)
        ellipsoid('Crown gold flower heart',center+Vector((0,0,.015)),(.016,.016,.011),gold,'head',sides=12,rings=8)
    # Curved gossamer wings. Two lobes per side, with branching veins and pearl edging.
    for side in [-1,1]:
        bone='wing_L' if side<0 else 'wing_R'
        def p(x,y): return (side*(.15+x),2.72+y,-.27-.14*x*x)
        outlines=[[(0,0),(.16,.44),(.48,.81),(.92,.98),(1.07,.87),(1.06,.68),(.92,.45),(.73,.27),(.39,.08),(0,0)],[(.03,-.02),(.38,-.02),(.69,-.14),(.83,-.38),(.73,-.58),(.50,-.57),(.25,-.35),(.03,-.02)]]
        for lobe,outline in enumerate(outlines):
            boundary=[sample([(x,y,0) for x,y in outline],j/80) for j in range(80)]
            # Radial surface rings follow the membrane curvature. Triangulating
            # just the boundary made long folded slivers with dark back faces.
            center=sum(boundary,Vector())/len(boundary)
            samples=[center]
            rings=6
            for ring in range(1,rings+1):
                samples.extend(center.lerp(v,ring/rings) for v in boundary)
            verts=[p(v.x,v.y) for v in samples]
            faces=[(0,1+i,1+(i+1)%80) for i in range(80)]
            for ring in range(rings-1):
                inner=1+ring*80;outer=inner+80
                faces.extend((inner+i,outer+i,outer+(i+1)%80,inner+(i+1)%80) for i in range(80))
            wing=mesh('Opal upper wing' if lobe==0 else 'Opal lower wing',verts,faces,wing_mat,bone,[(v.x,v.y) for v in samples])
            paint(wing,[blend(rgb('#a8dce9'),rgb('#b6a2d9'),max(0,min(1,(2.95-game(v.co).y)/.8))) for v in wing.data.vertices])
            edge=[p(v.x,v.y) for v in boundary]
            line('Pearl wing margin',edge+[edge[0]],.007,wing_vein,bone,80)
        branches=[[(.02,.0),(.35,.28),(.70,.63),(.93,.91)],[(.20,.17),(.32,.47),(.48,.77)],[(.38,.31),(.67,.35),(.95,.48)],[(.53,.46),(.76,.54),(1.04,.72)],[(.05,-.03),(.29,-.20),(.72,-.51)],[(.30,-.20),(.52,-.18),(.76,-.29)],[(.30,-.20),(.37,-.39),(.51,-.55)]]
        for branch in branches:
            line('Fine branching wing vein',[p(x,y) for x,y in branch],.0045,wing_vein,bone,24)
        for i in range(13):
            t=i/12
            x=.38+t*.55;y=.67+math.sin(t*math.pi)*.16
            ellipsoid('Wing edge pearl',p(x,y),(.011,.014,.007),cream,bone,sides=8,rings=6)
        for x,y in [(.62,.56),(.54,-.32)]:
            ring=[p(x+math.cos(a)*.086,y+math.sin(a)*.115) for a in [TAU*i/40 for i in range(41)]]
            line('Wing opal eyespot',ring,.006,cream,bone,40)
    return finish('Mia',bones,start,'mia.glb')


try:
    glender=pony(False)
    unicorn=pony(True)
    rider=mia()
    # The saved master is a turntable-ready lineup, while each GLB is at game origin.
    glender.location.x=-2.4
    rider.location.x=-2.4
    unicorn.location.x=2.0
    scene.world=bpy.data.worlds.new('Character atelier world')
    scene.world.use_nodes=True
    next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND').inputs[0].default_value=(.22,.28,.36,1)
    print('Editable masters are in the isolated character atelier scene.')
finally:
    bpy.context.window.scene=previous_scene
    print('Restored original scene:',previous_scene.name)
