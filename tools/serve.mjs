// Strict static server for testing both the custom-domain root and repository subpath.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.glb':'model/gltf-binary','.ttf':'font/ttf','.woff2':'font/woff2','.png':'image/png'};
createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.startsWith('/fairy-unicorn-chase/'))path=path.slice('/fairy-unicorn-chase'.length);if(path==='/'||path==='')path='/index.html';const file=resolve(root,'.'+path);if(!file.startsWith(root+'/'))throw Error('Outside root');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Static game at http://127.0.0.1:4173'));
