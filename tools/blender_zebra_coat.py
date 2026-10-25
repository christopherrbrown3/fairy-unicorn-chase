"""Original surface-stripe authoring and deterministic UV surface-mask baking for zebra scenery.
All marks are original Bezier ribbons on the anatomical surface; no photo pixels.
"""
import bpy, bmesh, math, heapq
from mathutils import Vector
from mathutils.bvhtree import BVHTree

def raster_surface_mask(target, strokes, posed, direct_head, game, resolution=2048):
 """Rasterize original surface polylines into the existing continuous UVs.
 No ray-cage bake, periodic field, photographic pixels, or per-face UV atlas.
 """
 import numpy as np
 from mathutils.kdtree import KDTree
 size=resolution
 positions=np.zeros((size,size,3),dtype=np.float32)
 covered=np.zeros((size,size),dtype=bool)
 uv=target.data.uv_layers.active.data
 for triangle in target.data.loop_triangles:
  tex=np.array([uv[i].uv[:] for i in triangle.loops],dtype=np.float64)*size-.5
  lo=np.maximum(0,np.ceil(tex.min(axis=0)).astype(int));hi=np.minimum(size-1,np.floor(tex.max(axis=0)).astype(int))
  if np.any(hi<lo):continue
  x,y=np.meshgrid(np.arange(lo[0],hi[0]+1),np.arange(lo[1],hi[1]+1))
  a,b,c=tex;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
  if abs(den)<1e-12:continue
  wa=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den
  wb=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den;wc=1-wa-wb
  inside=(wa>=-1e-6)&(wb>=-1e-6)&(wc>=-1e-6)
  coords=np.array([game(target.data.vertices[i].co)[:] for i in triangle.vertices])
  values=wa[...,None]*coords[0]+wb[...,None]*coords[1]+wc[...,None]*coords[2]
  positions[y[inside],x[inside]]=values[inside];covered[y[inside],x[inside]]=True
 indices=np.flatnonzero(covered);points=positions.reshape(-1,3)[indices]
 starts=[];ends=[];widths_a=[];widths_b=[]
 for centers,widths in strokes:
  for i in range(len(centers)-1):
   # Reject any discontinuous projection jump, never bridge unrelated surfaces.
   if (centers[i+1]-centers[i]).length>.07:continue
   starts.append(centers[i][:]);ends.append(centers[i+1][:]);widths_a.append(widths[i]);widths_b.append(widths[i+1])
 starts=np.asarray(starts,dtype=np.float32);ends=np.asarray(ends,dtype=np.float32)
 widths_a=np.asarray(widths_a,dtype=np.float32);widths_b=np.asarray(widths_b,dtype=np.float32)
 middles=(starts+ends)/2;tree=KDTree(len(middles))
 for i,p in enumerate(middles):tree.insert(p,i)
 tree.balance()
 cell=.12;cells=np.floor(points/cell).astype(np.int32);minimum=cells.min(axis=0);dims=cells.max(axis=0)-minimum+1
 local=cells-minimum;keys=(local[:,0]*dims[1]+local[:,1])*dims[2]+local[:,2]
 order=np.argsort(keys);breaks=np.r_[0,np.flatnonzero(np.diff(keys[order]))+1,len(order)]
 coverage=np.zeros(len(points),dtype=np.float32)
 radius=cell*math.sqrt(3)/2+float(max(widths_a.max(),widths_b.max()))+.045
 for begin,end in zip(breaks[:-1],breaks[1:]):
  ids=order[begin:end];center=(cells[ids[0]]+.5)*cell
  candidates=[item[1] for item in tree.find_range(center,radius)]
  if not candidates:continue
  a=starts[candidates];delta=ends[candidates]-a;length2=np.maximum((delta*delta).sum(axis=1),1e-12)
  wa=widths_a[candidates];wd=widths_b[candidates]-wa
  for start in range(0,len(ids),256):
   selected=ids[start:start+256];p=points[selected,None,:];t=np.clip(((p-a)*delta).sum(axis=2)/length2,0,1)
   distance=np.sqrt(((p-(a+t[...,None]*delta))**2).sum(axis=2))
   signed=(distance-(wa+t*wd)).min(axis=1)
   coverage[selected]=np.clip(.5-signed/.0035,0,1)
 # Full closed muzzle patch, evaluated in the same head coordinates for both poses.
 # It includes the end surface and center seam, unlike the rejected lateral collar.
 head=points
 if posed:
  origin=np.asarray(direct_head((0,0,0)))
  rotation=np.column_stack([np.asarray(direct_head(p))-origin for p in [(1,0,0),(0,1,0),(0,0,1)]])
  head=(points-origin)@rotation
 boundary=2.105+.018*((head[:,1]-2.9)/.32)**2
 muzzle=np.clip((head[:,2]-boundary)/.004+.5,0,1)*(head[:,1]>2.5)
 coverage=np.maximum(coverage,muzzle)
 result=np.zeros((size,size),dtype=np.float32);result.reshape(-1)[indices]=coverage
 # UV-island padding copies the nearest boundary values without painting gaps.
 known=covered.copy()
 for _ in range(18):
  total=np.zeros_like(result);count=np.zeros_like(result)
  for axis,shift in [(0,-1),(0,1),(1,-1),(1,1)]:
   neighbor=np.roll(known,shift,axis=axis);total+=np.roll(result,shift,axis=axis)*neighbor;count+=neighbor
  fill=(~known)&(count>0);result[fill]=total[fill]/count[fill];known[fill]=True
 print('RASTERIZED',target.name,'texels',len(indices),'segments',len(starts),flush=True)
 return result

def paint_coats(body, grazing_body, core_sections, graze_centers, direct_head, xyz, game, art, mark_origin, coat, foalcoat):
 scene=bpy.context.scene
 scene.render.engine='CYCLES';scene.cycles.samples=1
 def deselect_all():
  for ob in bpy.data.objects:ob.select_set(False)
 collection=bpy.data.collections.new('Source | original Bezier surface coat strokes');scene.collection.children.link(collection)
 def emission(name,color):
  m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;n.clear();s=n.new('ShaderNodeEmission');s.inputs['Color'].default_value=(*color,1);o=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(s.outputs[0],o.inputs['Surface']);return m,s
 pale,palenode=emission('Bake only | ivory skin',(.86,.84,.76));dark,darknode=emission('Bake only | charcoal strokes',(.018,.023,.021))
 def unwrap(o):
  bm=bmesh.new();bm.from_mesh(o.data)
  bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.00001,plane_co=(0,0,0),plane_no=(1,0,0),clear_inner=False,clear_outer=False)
  bm.verts.ensure_lookup_table();bm.edges.ensure_lookup_table()
  for e in bm.edges:e.seam=all(abs(v.co.x)<.00002 for v in e.verts)
  # Four short inner-leg seams connect the foot to the central ventral seam.
  # The torso, shoulder and neck remain broad continuous left/right islands.
  for side in [-1,1]:
   for z in [-1.0,1.0]:
    start=min(bm.verts,key=lambda v:(game(v.co)-Vector((side*.35,.14,z))).length_squared)
    end=min((v for v in bm.verts if abs(v.co.x)<.00002),key=lambda v:(game(v.co)-Vector((0,1.7,z*.6))).length_squared)
    distances={start.index:0};previous={};queue=[(0,start.index)]
    while queue:
     cost,idx=heapq.heappop(queue)
     if idx==end.index:break
     if cost!=distances.get(idx):continue
     v=bm.verts[idx]
     for e in v.link_edges:
      other=e.other_vert(v);p=game(other.co)
      penalty=1+max(0,abs(p.x)-.35)*18+abs(p.z-z)*2
      new=cost+e.calc_length()*penalty
      if new<distances.get(other.index,1e20):distances[other.index]=new;previous[other.index]=(idx,e);heapq.heappush(queue,(new,other.index))
    idx=end.index
    while idx in previous:idx,e=previous[idx];e.seam=True
  bm.to_mesh(o.data);bm.free()
  deselect_all();o.select_set(True);bpy.context.view_layer.objects.active=o
  bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.unwrap(method='ANGLE_BASED',margin=.012);bpy.ops.uv.pack_islands(margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
 def bezier(points,t):return points[0]*(1-t)**3+points[1]*(3*(1-t)**2*t)+points[2]*(3*(1-t)*t*t)+points[3]*t**3
 def interpolation(seq,s):
  j=max(0,min(len(seq)-2,int(s)));t=max(0,min(1,s-j));a=seq[max(0,j-1)];b=seq[j];c=seq[j+1];d=seq[min(len(seq)-1,j+2)]
  return (b*2+(c-a)*t+(a*2-b*5+c*4-d)*t*t+(-a+b*3-c*3+d)*t*t*t)*.5
 def surface_mapper(posed):
  centers=graze_centers if posed else [Vector((0,y,z)) for z,y,rx,ry in core_sections]
  def mapped(param,side):
   s,angle=param;c=interpolation(centers,s);tangent=(interpolation(centers,min(10,s+.02))-interpolation(centers,max(0,s-.02))).normalized()
   radial=Vector((0,tangent.z,-tangent.y));r=interpolation([Vector((rx,ry,0)) for z,y,rx,ry in core_sections],s)
   return c+Vector((side*r.x*math.cos(angle),0,0))+radial*r.y*math.sin(angle)
  return mapped
 all_outputs=[]
 for posed,target in [(False,body),(True,grazing_body)]:
  unwrap(target)
  target.data.calc_loop_triangles();bvh=BVHTree.FromPolygons([game(v.co) for v in target.data.vertices],[t.vertices[:] for t in target.data.loop_triangles],all_triangles=True)
  def project(p):
   hit,n,_,_=bvh.find_nearest(p);return hit,n
  ribbons=[];strokes=[];mapping=surface_mapper(posed);serial=0
  def ribbon(label,points,width,mapper=None,branch=False):
   nonlocal serial
   serial+=1;points=[Vector(p) for p in points]
   def sample(t):return mapper(bezier(points,t)) if mapper else bezier(points,t)
   centers=[];widths=[]
   steps=240
   for i in range(steps+1):
    t=i/steps;p,n=project(sample(t));before=sample(max(0,t-.003));after=sample(min(1,t+.003));tangent=(after-before).normalized();across=n.cross(tangent).normalized()
    taper=(math.sin(math.pi*t)**.30 if not branch else .12+.88*(1-t)**.7)
    w=width*taper*(.86+.14*math.sin(t*4.7+serial*.71))
    centers.append(p);widths.append(w)
   strokes.append((centers,widths))
   # Keep editable Bezier centerlines in the source .blend; they never export.
   curve=bpy.data.curves.new(label+' | Bezier original','CURVE');curve.dimensions='3D';spline=curve.splines.new('BEZIER');knots=centers[::24];spline.bezier_points.add(len(knots)-1)
   for k,p in enumerate(knots):
    b=spline.bezier_points[k];b.co=xyz(p);b.handle_left_type='FREE';b.handle_right_type='FREE';d=(knots[min(k+1,len(knots)-1)]-knots[max(0,k-1)])/6;b.handle_left=xyz(p-d);b.handle_right=xyz(p+d)
   c=bpy.data.objects.new(label+' | editable path',curve);collection.objects.link(c);c.hide_render=True;c.hide_set(True)
  # Individually drawn, asymmetrical paths. Long neck bands sweep into the
  # shoulder; flank marks curve and fork; rump marks turn along the haunch.
  flows=[
   ([(1.05,1.48),(1.0,.60),(2.38,-.20),(2.58,-1.43)],.060),
   ([(1.72,1.50),(1.72,.76),(3.02,-.43),(3.0,-1.43)],.077),
   ([(2.45,1.49),(2.54,.60),(3.84,-.34),(3.51,-1.48)],.057),
   ([(3.12,1.51),(3.13,.82),(4.36,-.08),(3.97,-1.50)],.070),
   ([(3.81,1.49),(3.85,.28),(4.78,-.35),(4.29,-1.47)],.048),
   ([(4.40,1.50),(4.78,.83),(4.57,-.40),(4.94,-1.43)],.075),
   ([(5.01,1.50),(5.6,.44),(5.02,-.47),(5.42,-1.40)],.058),
   ([(5.67,1.49),(6.28,.38),(5.68,-.33),(5.91,-1.45)],.077),
   ([(6.45,1.49),(6.7,.47),(6.67,-.56),(6.22,-1.43)],.060),
   ([(7.13,1.50),(7.55,.61),(7.15,-.60),(6.62,-1.44)],.069),
   ([(7.86,1.50),(8.16,.56),(7.68,-.58),(7.08,-1.44)],.053),
   ([(8.53,1.50),(8.82,.65),(8.19,-.57),(7.56,-1.41)],.062),
   ([(9.23,1.50),(9.54,.69),(8.78,-.55),(8.14,-1.40)],.046),
   ([(9.84,1.50),(10,.60),(9.30,-.54),(8.79,-1.40)],.045),
  ]
  for side in [-1,1]:
   for i,(pts,width) in enumerate(flows):
    pts=[(max(.1,min(10,s+(side<0)*(.10*math.sin(i*1.7+a)))),a) for s,a in pts]
    ribbon(f'{"grazing" if posed else "standing"} {side} shoulder flank flow {i}',pts,width,lambda p,side=side:mapping(p,side))
   for i,pts in enumerate([[(3.07,.25),(3.22,-.08),(3.13,-.65),(2.92,-1.12)],[(4.65,.20),(4.87,-.13),(4.75,-.72),(4.65,-1.25)]]):
    ribbon(f'{side} tapered branch {i}',pts,.026,lambda p,side=side:mapping(p,side),True)
   # Haunch fans turn into the hindquarter rather than suddenly switching masks.
   for i,(y,z,width) in enumerate([(2.48,-1.31,.043),(2.20,-1.35,.050),(1.95,-1.24,.035)]):
    pts=[(side*.12,y+.10,z-.08),(side*.42,y+.04,z-.08),(side*.55,y-.10,z+.12),(side*.48,y-.23,z+.13)]
    ribbon(f'{side} curved haunch fan {i}',pts,width)
   # Limb marks follow the accepted knee/hock centerline and taper radii.
   # This avoids nearest-surface jumps from a fixed-Z imaginary cylinder.
   for rear in [False,True]:
    stations=([(0.12,-.97,.08,.10),(.25,-1.04,.085,.1),(.55,-1.1,.065,.075),(.77,-1.17,.095,.1),(.98,-1.02,.085,.11),(1.38,-.72,.15,.18),(1.77,-.9,.22,.26),(1.98,-1.02,.19,.24)] if rear else [(.12,1.07,.08,.10),(.23,1.0,.09,.1),(.4,.96,.061,.071),(.84,.93,.07,.085),(1.02,.92,.1,.12),(1.23,.88,.11,.12),(1.64,.82,.16,.18),(1.98,.77,.19,.24)])
    def limb_map(param,side=side,stations=stations):
     y,angle=param
     j=next((j for j in range(len(stations)-1) if stations[j+1][0]>=y),len(stations)-2)
     a=stations[j];b=stations[j+1];t=max(0,min(1,(y-a[0])/(b[0]-a[0])))
     z,rx,rz=[a[k]*(1-t)+b[k]*t for k in [1,2,3]]
     return Vector((side*(.43+rx*math.cos(angle)),y,z+rz*math.sin(angle)))
    for i,y in enumerate([.28,.47,.67,.88,1.10,1.32,1.52,1.72]):
     y+=side*.013*(i%3)+(.028 if rear and i%2 else 0)
     tilt=[-.045,.035,-.025,.065,-.055,.04,.075,-.035][i]*(1 if side>0 else -.8)
     start_angle=-2.15+[.0,.35,-.1,.6,.15,-.3,.1,.4][i]
     end_angle=1.95+[.0,-.2,.2,-.5,.1,-.15,.3,-.25][i]
     pts=[(y-tilt,start_angle),(y+.035,-.8),(y-.025,.8),(y+tilt,end_angle)]
     ribbon(f'{side} {rear} independent limb mark {i}',pts,[.014,.024,.018,.026,.019,.027,.024,.029][i],limb_map)
   # Fine nasal lines stay on the head, not concentric circles around the cheek.
   for i,x in enumerate([.025,.071,.122,.175,.22]):
    pts=[(side*x,3.47,1.25),(side*x*.92,3.51,1.62),(side*x*.87,3.15,2.0),(side*x*.80,3.01,2.25)]
    ribbon(f'{side} nasal longitudinal {i}',[direct_head(p) for p in pts] if posed else pts,.011+(i%2)*.004)
   for i,y in enumerate([3.02,3.10,3.20,3.29,3.37]):
    pts=[(side*.25,y,1.2),(side*.31,y-.02,1.42),(side*.24,y-.15,1.63),(side*.19,y-.25,1.88)]
    ribbon(f'{side} cheek sweep {i}',[direct_head(p) for p in pts] if posed else pts,.014+(i%2)*.005)
  mask=raster_surface_mask(target,strokes,posed,direct_head,game)
  import numpy as np
  materials=[]
  for young in [False,True]:
   if not posed:material=foalcoat if young else coat
   else:
    material=(foalcoat if young else coat).copy();material.name=('Foal' if young else 'Adult')+' | baked original grazing coat'
   target.data.materials.clear();target.data.materials.append(material)
   pale_rgb=np.array((.86,.80,.68) if young else (.86,.84,.76))
   dark_rgb=np.array((.105,.064,.035) if young else (.018,.023,.021))
   image=bpy.data.images.new(('Foal' if young else 'Adult')+(' lowered neck' if posed else ' standing')+' original surface coat',width=2048,height=2048,alpha=False)
   node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;material.node_tree.nodes.active=node
   shader=next(n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
   pixels=np.ones((2048,2048,4),dtype=np.float32)
   pixels[:,:,:3]=pale_rgb+(dark_rgb-pale_rgb)*mask[:,:,None]
   image.pixels.foreach_set(pixels.reshape(-1));image.update()
   material.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
   image.filepath_raw=str(art/(('foal' if young else 'adult')+('-grazing' if posed else '')+'-coat.png'));image.file_format='PNG';image.save();mark_origin(image.filepath_raw);image.pack();materials.append(material)
   print('BAKED',image.filepath_raw,flush=True)
  target.data.materials.clear();target.data.materials.append(materials[0]);all_outputs.append(materials)
 return all_outputs[1]
