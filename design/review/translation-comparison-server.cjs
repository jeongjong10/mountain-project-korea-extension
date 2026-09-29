const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const server = http.createServer((req,res) => {
  if(req.url !== '/'){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(__dirname,'translation-comparison.html')));
});
server.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({port:server.address().port})));
process.on('SIGINT',()=>server.close(()=>process.exit()));
