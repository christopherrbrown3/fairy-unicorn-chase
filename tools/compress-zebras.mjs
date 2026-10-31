// Run through the pinned npm-exec packages in build-zebras.mjs. Geometry is
// Meshopt encoded without quantization or lossy filters; coat WebP is lossless.
import { createRequire } from "node:module";
import { dirname, join, delimiter } from "node:path";
import { readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
let dependencyRequire;
for (const bin of (process.env.PATH || "").split(delimiter)) {
  if (!bin.endsWith("node_modules/.bin")) continue;
  const candidate = createRequire(join(dirname(bin), "zebra-compression.cjs"));
  try {
    const path = candidate.resolve("@gltf-transform/core");
    const pkg = JSON.parse(await readFile(join(dirname(path), "../package.json"), "utf8"));
    if (pkg.version === "4.3.0") { dependencyRequire = candidate; break; }
  } catch { /* Try the next npm-exec dependency directory. */ }
}
if (!dependencyRequire) throw new Error("Use build-zebras.mjs with pinned glTF Transform 4.3.0 dependencies");
const { NodeIO } = dependencyRequire("@gltf-transform/core");
const { ALL_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP } = dependencyRequire("@gltf-transform/extensions");
const { MeshoptEncoder, MeshoptDecoder } = dependencyRequire("meshoptimizer");
const sharp = dependencyRequire("sharp");
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder,
});
const [input, output, reportPath] = process.argv.slice(2);
if (!input || !output || !reportPath) throw new Error("Expected input.glb output.glb report.json");
const document = await io.read(input);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const decodedRGBA = image => sharp(Buffer.from(image)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const maps = [];
for (const texture of document.getRoot().listTextures()) {
  const original = await decodedRGBA(texture.getImage());
  const encoded = await sharp(Buffer.from(texture.getImage())).webp({ lossless: true, effort: 6 }).toBuffer();
  const converted = await decodedRGBA(encoded);
  if (!original.data.equals(converted.data) || original.info.width !== converted.info.width || original.info.height !== converted.info.height)
    throw new Error(`Lossless WebP changed decoded pixels: ${texture.getName()}`);
  texture.setImage(encoded).setMimeType("image/webp");
  maps.push({ name: texture.getName(), width: original.info.width, height: original.info.height,
    decodedRGBAHash: hash(original.data), encodedBytes: encoded.length });
}
document.createExtension(EXTTextureWebP).setRequired(true);
// QUANTIZE here selects unfiltered byte encoding. No quantize transform runs:
// existing float positions, normals and UVs keep their exact decoded values.
document.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({
  method: EXTMeshoptCompression.EncoderMethod.QUANTIZE,
});
await io.write(output, document);
const decoded = await io.read(output);
const meshesBefore = document.getRoot().listMeshes(), meshesAfter = decoded.getRoot().listMeshes();
if (meshesBefore.length !== meshesAfter.length) throw new Error("Meshopt changed mesh inventory");
const canonicalTriangles = indices => {
  const result = [];
  for (let i = 0; i < indices.length; i += 3) {
    const t = Array.from(indices.slice(i, i + 3));
    const start = t.indexOf(Math.min(...t));
    result.push([t[start], t[(start + 1) % 3], t[(start + 2) % 3]].join(","));
  }
  return result.sort().join(";");
};
let triangles = 0;
for (let i = 0; i < meshesBefore.length; i++) {
  const before = meshesBefore[i].listPrimitives(), after = meshesAfter[i].listPrimitives();
  if (before.length !== after.length) throw new Error("Meshopt changed primitive inventory");
  for (let p = 0; p < before.length; p++) {
    for (const semantic of before[p].listSemantics()) {
      const a = before[p].getAttribute(semantic).getArray(), b = after[p].getAttribute(semantic).getArray();
      if (a.length !== b.length || a.some((value, index) => value !== b[index]))
        throw new Error(`Meshopt changed decoded ${semantic}: ${meshesBefore[i].getName()}`);
    }
    const a = before[p].getIndices().getArray(), b = after[p].getIndices().getArray();
    if (canonicalTriangles(a) !== canonicalTriangles(b)) throw new Error("Meshopt changed oriented triangles");
    triangles += b.length / 3;
  }
}
for (let i = 0; i < maps.length; i++) {
  const rgba = await decodedRGBA(decoded.getRoot().listTextures()[i].getImage());
  if (hash(rgba.data) !== maps[i].decodedRGBAHash) throw new Error("Embedded WebP decoded pixels differ");
}
const roots = decoded.getRoot().listScenes()[0].listChildren().map(node => node.getName()).sort();
const expected = ["adult-grazing", "adult-looking", "adult-walking", "foal-grazing", "foal-looking", "foal-walking"];
if (JSON.stringify(roots) !== JSON.stringify(expected)) throw new Error("Compressed scene does not have exactly six roots");
const report = { codec: "glTF Transform 4.3.0 / lossless unquantized Meshopt + lossless WebP",
  inputBytes: (await stat(input)).size, outputBytes: (await stat(output)).size,
  sha256: hash(await readFile(output)), roots, meshCount: meshesAfter.length, decodedTriangles: triangles,
  exactDecodedVertexAttributes: true, exactOrientedTriangles: true, exactDecodedCoatPixels: true, maps,
  estimatedRGBAWithMipBytes: maps.reduce((sum, map) => sum + map.width * map.height * 4 * 4 / 3, 0) };
await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
