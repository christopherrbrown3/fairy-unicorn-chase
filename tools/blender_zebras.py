"""Original plains-zebra scenery, authored/exported in isolated Blender 5.x.
Run: Blender --background --factory-startup --threads 2 --python tools/blender_zebras.py
Never reads, opens, or overwrites the live Blender scene or protected cast.
"""
import bpy, bmesh, math, os, json, struct, zlib
import numpy as np
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'art/scenery/zebra'; OUT=ROOT/'output/qa-zebra/blender'; EXPORT=ROOT/'public/assets/models/scenery'
for p in [ART,OUT,EXPORT]: p.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
CLAY_ONLY=os.environ.get('ZEBRA_CLAY_ONLY')=='1'

def mark_coat_origin(path):
 data=Path(path).read_bytes();end=data.rfind(b'IEND')-4
 chunks=[]
 for key,value in [('Origin','Original code-painted UV coat; tools/blender_zebras.py'),('Description','Original surface-mask-baked Blender coat; reference photographs inform anatomy only.'),('impeccable:prompt','Original code-painted and surface-mask-baked Blender coat from tools/blender_zebras.py. No AI bitmap generation or photo pixels; reference photographs are anatomy references only.')]:
  payload=key.encode()+b'\0'+value.encode();kind=b'tEXt'
  chunks.append(struct.pack('>I',len(payload))+kind+payload+struct.pack('>I',zlib.crc32(kind+payload)&0xffffffff))
 Path(path).write_bytes(data[:end]+b''.join(chunks)+data[end:])

def xyz(p): return (p[0],-p[2],p[1])
def game(p): return Vector((p[0],p[2],-p[1]))
def mat(name,color,rough=.65):
 m=bpy.data.materials.new(name);m.use_nodes=True
 n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Roughness'].default_value=rough
 return m
ink=mat('Mane and tail | charcoal hair',(.025,.027,.023),.8)
hoofmat=mat('Hooves | natural dark horn',(.055,.045,.034),.43)
eye=mat('Eyes | deep brown cornea',(.012,.009,.005),.16)
nostril=mat('Nostril and mouth recess',(.018,.015,.014),.8)
inner=mat('Ear interior | warm short fur',(.28,.23,.18),.9)
coat=mat('Adult | baked original plains coat',(.85,.82,.73),.85)
foalcoat=mat('Foal | baked warm brown coat',(.85,.82,.73),.85)
parts=[]
def mesh(name,verts,faces,material=None):
 d=bpy.data.meshes.new(name);d.from_pydata([xyz(p) for p in verts],[],faces);d.update();o=bpy.data.objects.new(name,d);scene.collection.objects.link(o)
 if material:d.materials.append(material)
 for f in d.polygons:f.use_smooth=True
 parts.append(o);return o

def ell(name,c,r,material=None,rotation=None,sides=20,rings=12):
 vs=[]
 for j in range(rings+1):
  a=math.pi*j/rings
  for i in range(sides):
   b=math.tau*i/sides;v=Vector((r[0]*math.sin(a)*math.cos(b),r[1]*math.cos(a),r[2]*math.sin(a)*math.sin(b)))
   if rotation:v=rotation@v
   vs.append(Vector(c)+v)
 fs=[]
 for j in range(rings):
  for i in range(sides):a=j*sides+i;b=j*sides+(i+1)%sides;fs.append((a,b,b+sides,a+sides))
 return mesh(name,vs,fs,material)

def loft(name,sections,axis='z',material=None,sides=24):
 # A deliberately shaped anatomical cross-section loft, not a primitive body.
 vs=[]
 for center,rx,ry in sections:
  for i in range(sides):
   a=math.tau*i/sides
   v=Vector(center)+ (Vector((rx*math.cos(a),ry*math.sin(a),0)) if axis=='z' else Vector((rx*math.cos(a),0,ry*math.sin(a))))
   vs.append(v)
 fs=[tuple(range(sides-1,-1,-1))]
 for j in range(len(sections)-1):
  for i in range(sides):a=j*sides+i;b=j*sides+(i+1)%sides;fs.append((a,b,b+sides,a+sides))
 fs.append(tuple((len(sections)-1)*sides+i for i in range(sides)))
 return mesh(name,vs,fs,material)

def join(objects,name):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name=name;return o

# One continuous quad cage from rump through scapular/pectoral transition
# into the neck. Ring planes rotate with the anatomical centerline; there is
# no closed lower-neck volume, cap, or overlapping chest lobe to union.
sections=[(-1.48,2.13,.08,.20),(-1.30,2.15,.36,.50),(-1.03,2.12,.51,.65),(-.60,2.06,.54,.62),(-.15,2.02,.58,.64),(.24,2.06,.56,.66),(.55,2.18,.48,.65),(.82,2.43,.39,.55),(1.02,2.76,.30,.43),(1.18,3.09,.24,.31),(1.31,3.42,.19,.24)]
core_sections=sections[:]
verts=[];faces=[];sides=32
for j,(z,y,rx,ry) in enumerate(sections):
 prev=sections[max(0,j-1)];nxt=sections[min(len(sections)-1,j+1)]
 tangent=Vector((0,nxt[1]-prev[1],nxt[0]-prev[0])).normalized()
 radial=Vector((0,tangent.z,-tangent.y))
 for i in range(sides):
  a=math.tau*i/sides
  verts.append(Vector((0,y,z))+Vector((rx*math.cos(a),0,0))+radial*(ry*math.sin(a)))
for j in range(len(sections)-1):
 for i in range(sides):a=j*sides+i;b=j*sides+(i+1)%sides;faces.append((a,b,b+sides,a+sides))
faces.extend([tuple(range(sides-1,-1,-1)),tuple((len(sections)-1)*sides+i for i in range(sides))])
core_coords=[Vector(v) for v in verts]
core_triangles=[]
for face in faces:
 for k in range(1,len(face)-1):core_triangles.append((face[0],face[k],face[k+1]))
core_bvh=BVHTree.FromPolygons(core_coords,core_triangles,all_triangles=True)
core=mesh('Continuous torso shoulder neck quad cage',verts,faces)
# Preserve the original editable quad construction, independent of game retopo.
cagecol=bpy.data.collections.new('Source | continuous quad anatomy');scene.collection.children.link(cagecol)
cage=core.copy();cage.data=core.data.copy();cagecol.objects.link(cage);cage.hide_render=True;cage.hide_set(True)
loft('Long equid skull and tapered nasal bridge',[( (0,y,z),rx,ry) for z,y,rx,ry in [(1.08,3.32,.15,.25),(1.3,3.34,.25,.31),(1.52,3.29,.25,.29),(1.79,3.13,.19,.23),(2.05,2.96,.19,.19),(2.27,2.86,.23,.18),(2.4,2.86,.17,.15)]])
# Cheekbone and jaw mass join the skull; all skin becomes one continuous mesh.
for side in [-1,1]:
 ell('Cheek mass',(side*.16,3.18,1.4),(.16,.23,.24))
 for back in [False,True]:
  x=side*.43
  sections=([(x,2.15,-1.02,.25,.3),(x,1.77,-.9,.22,.26),(x,1.38,-.72,.15,.18),(x,.98,-1.02,.085,.11),(x,.77,-1.17,.095,.1),(x,.55,-1.1,.065,.075),(x,.25,-1.04,.085,.1),(x,.12,-.97,.08,.1)] if back else [(x,2.02,.77,.2,.26),(x,1.64,.82,.16,.18),(x,1.23,.88,.11,.12),(x,1.02,.92,.1,.12),(x,.84,.93,.07,.085),(x,.4,.96,.061,.071),(x,.23,1.0,.09,.1),(x,.12,1.07,.08,.1)])
  sections=[(x*.6,2.3,sections[0][2],.09,.14),(x*.88,1.98,sections[0][2],.19,.24)]+sections[1:]
  loft(('Hind' if back else 'Fore')+' limb anatomical taper',[( (a,b,c),rx,rz) for a,b,c,rx,rz in sections],axis='y',sides=16)
# Keep exact editable component cages for directly constructed pose variants.
source_parts=[]
for original in parts:
 source=original.copy();source.data=original.data.copy();cagecol.objects.link(source)
 source.hide_render=True;source.hide_set(True);source_parts.append(source)
for o in parts:
 bpy.context.view_layer.objects.active=o
 mod=o.modifiers.new('Anatomical loft interpolation','SUBSURF');mod.levels=2;bpy.ops.object.modifier_apply(modifier=mod.name)
body=join(parts[:],'Zebra | continuous sculpted skin')
# Recalculate loft orientation, union skin, relax joint transitions, retopologize.
bm=bmesh.new();bm.from_mesh(body.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(body.data);bm.free()
body.data.remesh_voxel_size=.022;bpy.ops.object.voxel_remesh()
sm=body.modifiers.new('Relax anatomical joins','SMOOTH');sm.factor=.8;sm.iterations=5;bpy.ops.object.modifier_apply(modifier=sm.name)
dec=body.modifiers.new('Game retopology budget','DECIMATE');dec.ratio=.18;bpy.ops.object.modifier_apply(modifier=dec.name)
for p in body.data.polygons:p.use_smooth=True
body.data.materials.clear();body.data.materials.append(coat)
# Grazing is authored directly in the same quad ring topology, before joining.
# No projection/weight deformation is applied to the remeshed animal.
graze_centers=[Vector((0,y,z)) for z,y,rx,ry in core_sections]
for j,y,z in [(6,2.18,.55),(7,2.40,.85),(8,2.55,1.18),(9,2.62,1.55),(10,2.65,1.92)]:
 graze_centers[j]=Vector((0,y,z))
graze_head_rotation=Matrix.Rotation(1.1,3,'X')
head_rest=Vector((0,core_sections[-1][1],core_sections[-1][0]))
def direct_head(p): return graze_centers[-1]+graze_head_rotation@(Vector(p)-head_rest)
def direct_neck(p):
 # Mane vertices carry a known longitudinal position; this does not pose skin.
 j=max(0,min(9,int((p.y-2.57)/.89*4+6)));t=max(0,min(1,(p.y-core_sections[j][1])/(core_sections[j+1][1]-core_sections[j][1])))
 r=Vector((0,core_sections[j][1],core_sections[j][0])).lerp(Vector((0,core_sections[j+1][1],core_sections[j+1][0])),t)
 q=graze_centers[j].lerp(graze_centers[j+1],t)
 rt=Vector((0,core_sections[j+1][1]-core_sections[j][1],core_sections[j+1][0]-core_sections[j][0]))
 pt=graze_centers[j+1]-graze_centers[j]
 angle=math.atan2(rt.y,rt.z)-math.atan2(pt.y,pt.z)
 return q+Matrix.Rotation(angle,3,'X')@(Vector(p)-r)
posed_parts=[]
for source in source_parts:
 o=source.copy();o.data=source.data.copy();scene.collection.objects.link(o);o.hide_render=False;o.hide_set(False)
 if 'quad cage' in source.name:
  for v in o.data.vertices:
   j=v.index//32;i=v.index%32;rx=core_sections[j][2];ry=core_sections[j][3]
   tangent=(graze_centers[min(10,j+1)]-graze_centers[max(0,j-1)]).normalized()
   radial=Vector((0,tangent.z,-tangent.y));a=math.tau*i/32
   v.co=xyz(graze_centers[j]+Vector((rx*math.cos(a),0,0))+radial*(ry*math.sin(a)))
 elif 'skull' in source.name or 'Cheek' in source.name:
  for v in o.data.vertices:v.co=xyz(direct_head(game(v.co)))
 bpy.context.view_layer.objects.active=o
 mod=o.modifiers.new('Direct pose cage interpolation','SUBSURF');mod.levels=2;bpy.ops.object.modifier_apply(modifier=mod.name)
 posed_parts.append(o)
grazing_body=join(posed_parts,'Zebra | continuous directly posed grazing skin')
bm=bmesh.new();bm.from_mesh(grazing_body.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(grazing_body.data);bm.free()
grazing_body.data.remesh_voxel_size=.022;bpy.ops.object.voxel_remesh()
sm=grazing_body.modifiers.new('Relax direct pose anatomical joins','SMOOTH');sm.factor=.8;sm.iterations=5;bpy.ops.object.modifier_apply(modifier=sm.name)
dec=grazing_body.modifiers.new('Game retopology budget','DECIMATE');dec.ratio=.18;bpy.ops.object.modifier_apply(modifier=dec.name)
for poly in grazing_body.data.polygons:poly.use_smooth=True
grazing_body.data.materials.clear();grazing_body.data.materials.append(coat)

# Continuous UV islands and original surface ribbons are baked in Blender.
if not CLAY_ONLY:
 import sys
 sys.path.insert(0,str(ROOT/'tools'))
 from blender_zebra_coat import paint_coats
 grazing_coat,grazing_foalcoat=paint_coats(body,grazing_body,core_sections,graze_centers,direct_head,xyz,game,ART,mark_coat_origin,coat,foalcoat)
else:grazing_coat,grazing_foalcoat=coat,foalcoat
# Finished eyes, recessed nostrils, shaped ears, hooves, lip crease, and hair.
parts=[body]
for side in [-1,1]:
 ell('Eye with dark almond lid',(side*.245,3.34,1.46),(.035,.06,.085),eye,sides=16,rings=10)
 ell('Nostril recessed oval',(side*.207,2.94,2.24),(.026,.05,.072),nostril,Matrix.Rotation(side*.25,3,'Z'),16,10)
 # Ear outer shell is a pointed, cupped leaf, not a long capsule.
 verts=[];faces=[]
 for j in range(9):
  t=j/8;width=.135*math.sin(math.pi*t)**.7
  for k in range(7):
   u=(k/6-.5)*2;verts.append((side*(.18+t*.09)+u*width,3.5+t*.32,1.2-.045*u*u-.03*math.sin(t*math.pi)))
 for j in range(8):
  for k in range(6):a=j*7+k;faces.append((a,a+1,a+8,a+7))
 ear=mesh('Cupped pointed ear',verts,faces,inner);solid=ear.modifiers.new('Ear rim thickness','SOLIDIFY');solid.thickness=.025;bpy.context.view_layer.objects.active=ear;bpy.ops.object.modifier_apply(modifier=solid.name)
 for z in [1.09,-.95]:
  loft('Hoof coronet wall and toe',[( (side*.43,y,z+shift),rx,rz) for y,rx,rz,shift in [(0,.14,.19,.025),(.07,.145,.19,.025),(.18,.115,.13,0),(.23,.085,.1,-.025)]],axis='y',material=hoofmat,sides=16)
# A continuous tapered mane ridge, with individually cut short bristles.
maneverts=[];manefaces=[]
for i in range(33):
 t=i/32;y=2.57+t*.89;z=.44+t*.67;h=.11+.018*math.sin(i*2.4)
 for x,dy,dz in [(-.035,0,0),(-.018,.035,-h),(.018,.035,-h),(.035,0,0)]:maneverts.append((x,y+dy,z+dz))
 if i:
  for k in range(3):a=(i-1)*4+k;manefaces.append((a,a+1,a+5,a+4))
mesh('Short bristly mane ridge',maneverts,manefaces,ink)
# Tail root/thin dock/tassel strand mesh.
loft('Tail dock',[((x,y,z),r,r) for x,y,z,r in [(0,2.31,-1.44,.075),(.03,2.05,-1.6,.055),(.09,1.68,-1.7,.04),(.13,1.36,-1.72,.035)]],axis='y',material=ink,sides=10)
for i in range(9):
 a=i*math.tau/9;ell('Tassel hair',(.13+math.cos(a)*.035,1.19,-1.72+math.sin(a)*.04),(.025,.23,.025),ink,Matrix.Rotation(.1,3,'X'),8,8)
masterparts=parts[:]
# Pose the connected mesh smoothly in model space. UV paint follows the skin.
def smooth(v):v=max(0,min(1,v));return v*v*(3-2*v)
def shorten(y): return y if y<=2.6 else 2.6+(y-2.6)*.86
restline=[Vector((0,shorten(y),z)) for z,y,rx,ry in core_sections]
def catmull(values,j,t):
 a=values[max(0,j-1)];b=values[j];c=values[min(j+1,len(values)-1)];d=values[min(j+2,len(values)-1)]
 return (b*2+(c-a)*t+(a*2-b*5+c*4-d)*t*t+(-a+b*3-c*3+d)*t*t*t)*.5

def deform(p,pose,young,head_detail=False,original_name=""):
 original=Vector(p);p=original.copy();rawy=p.y;p.y=shorten(p.y);x,y,z=p
 if pose=='grazing':
  # Skin was built in its target pose; only separate skull details move rigidly.
  if head_detail:p=direct_head(original);p.y=shorten(p.y)
  elif original_name.startswith('Short bristly'):p=direct_neck(original);p.y=shorten(p.y)
 elif pose=='walking':p.z+=smooth((1.7-rawy)/1.2)*(.17 if (x>0)==(z>0) else -.17)
 elif pose=='looking':
  w=smooth((rawy-2.65)/.7);pivotlook=Vector((0,2.65,1.1));p=p.lerp(pivotlook+Matrix.Rotation(-.12,3,'Y')@(p-pivotlook),w)
 if young:p=Vector((p.x*.65,p.y*.84 if p.y<1.5 else 1.26+(p.y-1.5)*.65,p.z*.65))
 return p
collections=[]
for young in [False,True]:
 for pose in ['looking','grazing','walking']:
  name=('foal' if young else 'adult')+'-'+pose;col=bpy.data.collections.new(name);scene.collection.children.link(col);collections.append(col)
  root=bpy.data.objects.new(name,None);col.objects.link(root)
  for original in masterparts:
   source=grazing_body if original==body and pose=='grazing' else original
   o=source.copy();o.data=source.data.copy();col.objects.link(o);o.parent=root
   if original==body:o.data.name='Finished '+name+' continuous UV skin'
   if original==body and young:o.data.materials.clear();o.data.materials.append(grazing_foalcoat if pose=='grazing' else foalcoat)
   for v in o.data.vertices:v.co=xyz(deform(game(v.co),pose,young,original.name.startswith(('Eye','Nostril','Cupped')),original.name))
   o.data.update()
   for poly in o.data.polygons:poly.use_smooth=True
for o in masterparts+[grazing_body]:bpy.data.objects.remove(o,do_unlink=True)
# Export all six immutable templates in one GLB, with embedded original coat maps.
for o in bpy.data.objects:o.select_set(False)
for col in collections:
 for o in col.objects:o.select_set(True)
expected_roots={'adult-looking','adult-grazing','adult-walking','foal-looking','foal-grazing','foal-walking'}
selected=list(bpy.context.selected_objects)
assert {o.name for o in selected if o.parent is None}==expected_roots
assert all(o.type in {'EMPTY','MESH'} and ('continuous' in o.name or 'cage' not in o.name.lower()) for o in selected)
if not CLAY_ONLY:bpy.ops.export_scene.gltf(filepath=str(EXPORT/'plains-zebras.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_texcoords=True,export_normals=True,export_materials='EXPORT')
# Review atelier, separate from exported geometry.
for col in collections:
 col.hide_render=True
review=bpy.data.collections.new('Review atelier');scene.collection.children.link(review)
def show(name,position=(0,0,0)):
 src=next(c for c in collections if c.name==name)
 for original in src.objects:
  if original.type!='MESH':continue
  o=original.copy();o.data=original.data;review.objects.link(o);o.parent=None;o.location=xyz(position)
 return src
show('adult-looking')
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012));floor=bpy.context.object;floor.name='Review ground only';floor.data.materials.append(mat('Review warm stone',(.22,.24,.23),.9))
for n,pos,power,size in [('Key',(-4,5,7),1000,5),('Fill',(5,3,5),750,4),('Rim',(0,-5,6),1200,3)]:
 d=bpy.data.lights.new(n,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(n,d);scene.collection.objects.link(o);o.location=xyz(pos);o.rotation_euler=(Vector(xyz((0,1.8,0)))-o.location).to_track_quat('-Z','Y').to_euler()
camdata=bpy.data.cameras.new('Review camera');cam=bpy.data.objects.new('Review camera',camdata);scene.collection.objects.link(cam);scene.camera=cam;camdata.type='ORTHO';camdata.ortho_scale=5.7
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world.color=(.24,.27,.29);scene.view_settings.view_transform='Standard'
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
if CLAY_ONLY:
 clay=mat('Neutral anatomy review clay',(.42,.45,.46),.9);scene.view_layers[0].material_override=clay
 claydir=OUT/'pass3-clay';claydir.mkdir(exist_ok=True)
 for pose in ['looking','grazing']:
  for o in list(review.objects):bpy.data.objects.remove(o,do_unlink=True)
  show('adult-'+pose)
  for label,position,target in [('front',(0,3,9),(0,1.9,.35)),('three-quarter',(6,3.4,7),(0,1.9,.25))]:
   cam.location=xyz(position);cam.rotation_euler=(Vector(xyz(target))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(claydir/(('standing' if pose=='looking' else 'grazing')+'-'+label+'.png'));bpy.ops.render.render(write_still=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'pass3-clay-source.blend'),compress=True)
else:
 for label,position,target in [('side',(8,3,0),(0,1.9,.25)),('front',(0,3,9),(0,1.9,.35)),('three-quarter',(6,3.4,7),(0,1.9,.25))]:
  cam.location=xyz(position);cam.rotation_euler=(Vector(xyz(target))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(OUT/(label+'.png'));bpy.ops.render.render(write_still=True)
 for o in list(review.objects):bpy.data.objects.remove(o,do_unlink=True)
 show('adult-looking',(-2.1,0,0));show('adult-grazing',(2.1,0,-.3));show('foal-walking',(.1,0,1.1))
 camdata.ortho_scale=10;cam.location=xyz((7,4.7,10));cam.rotation_euler=(Vector(xyz((0,1.7,.2)))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(OUT/'family.png');bpy.ops.render.render(write_still=True)
 for o in list(review.objects):bpy.data.objects.remove(o,do_unlink=True)
 show('adult-grazing');camdata.ortho_scale=4.7;cam.location=xyz((6,3.4,7));cam.rotation_euler=(Vector(xyz((0,1.9,.45)))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(OUT/'grazing-closeup.png');bpy.ops.render.render(write_still=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(ART/'plains-zebra-masters.blend'),compress=True)
report={'authoring':'Blender '+bpy.app.version_string,'bodyVertices':len(next(o for o in collections[0].objects if o.type=='MESH' and 'continuous' in o.name).data.vertices),'templates':[c.name for c in collections],'source':'Original anatomical lofts, voxel-unioned skin, relaxed/decimated topology, continuous UV islands with original individually drawn Bezier surface paths deterministically rasterized to four 2048-pixel maps; no sourced model or photographic texture.'}
(OUT/'build-report.json').write_text(json.dumps(report,indent=2))
