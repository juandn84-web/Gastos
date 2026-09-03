const C='gastos-v17';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./icon.png'])));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const req=e.request;
  const isDoc=req.mode==='navigate'||(req.destination==='document')||/\.html($|\?)/.test(req.url);
  if(isDoc){
    // RED PRIMERO para el HTML: así una versión nueva entra siempre que haya conexión.
    e.respondWith(
      fetch(req,{cache:'no-store'}).then(res=>{
        const cp=res.clone();caches.open(C).then(c=>c.put(req,cp));
        return res;
      }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(r=>r||fetch(req).then(res=>{
      const cp=res.clone();caches.open(C).then(c=>c.put(req,cp));
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
