import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,join,sep,extname} from 'node:path';
const root=resolve('.static-export');
const types={'.html':'text/html; charset=utf-8','.rsc':'text/x-component','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
createServer(async(req,res)=>{try{let file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403);return res.end()}if((await stat(file)).isDirectory())file=join(file,'index.html');const data=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(3102,'127.0.0.1',()=>console.log('MoodlIA preview http://127.0.0.1:3102/es/'));
