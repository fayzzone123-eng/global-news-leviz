const FEEDS = [
  {name:"BBC World", url:"https://feeds.bbci.co.uk/news/world/rss.xml"},
  {name:"BBC Top News", url:"https://feeds.bbci.co.uk/news/rss.xml"},
  {name:"BBC Business", url:"https://feeds.bbci.co.uk/news/business/rss.xml"},
  {name:"BBC Technology", url:"https://feeds.bbci.co.uk/news/technology/rss.xml"},
  {name:"DW English", url:"https://rss.dw.com/rdf/rss-en-top"},
  {name:"The Guardian World", url:"https://www.theguardian.com/world/rss"},
  {name:"NPR World", url:"https://feeds.npr.org/1004/rss.xml"}
];
const cors = origin => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=180"
});
function text(el, tag){ return el.getElementsByTagName(tag)[0]?.textContent?.trim() || ""; }
function parseFeed(xml, source){
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if(doc.querySelector("parsererror")) return [];
  const rss = [...doc.getElementsByTagName("item")];
  const atom = [...doc.getElementsByTagName("entry")];
  const nodes = rss.length ? rss : atom;
  return nodes.map(n=>{
    const title = text(n,"title");
    const linkEl = n.getElementsByTagName("link")[0];
    const link = linkEl?.getAttribute("href") || linkEl?.textContent?.trim() || "";
    const pubDate = text(n,"pubDate") || text(n,"published") || text(n,"updated") || text(n,"date");
    const description = text(n,"description") || text(n,"summary") || text(n,"content");
    return {title,link,pubDate,description,source};
  }).filter(x=>x.title && /^https?:\/\//i.test(x.link));
}
export default {
 async fetch(request, env, ctx){
  const url = new URL(request.url);
  if(request.method === "OPTIONS") return new Response(null,{headers:cors(request.headers.get("Origin"))});
  if(url.pathname === "/api/health") return Response.json({ok:true,service:"GLOBAL NEWS LEVI"}, {headers:cors(request.headers.get("Origin"))});
  if(url.pathname !== "/api/news") return new Response("Not found",{status:404});
  const results = await Promise.allSettled(FEEDS.map(async feed=>{
    const res = await fetch(feed.url,{headers:{"User-Agent":"GlobalNewsLevi/1.0 (+RSS reader)","Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml, */*"}, signal:AbortSignal.timeout(9000)});
    if(!res.ok) throw new Error(`${feed.name}: HTTP ${res.status}`);
    const xml = await res.text();
    return parseFeed(xml,feed.name);
  }));
  const items = [];
  const errors = [];
  let feedsOk = 0;
  results.forEach((r,i)=>{
    if(r.status==="fulfilled"){feedsOk++;items.push(...r.value)}
    else errors.push({source:FEEDS[i].name,message:String(r.reason?.message||r.reason).slice(0,180)});
  });
  const seen = new Set();
  const unique = items.filter(x=>{
    const key=(x.link||"").split("?")[0] || x.title.toLowerCase();
    if(seen.has(key)) return false; seen.add(key); return true;
  }).sort((a,b)=>(Date.parse(b.pubDate)||0)-(Date.parse(a.pubDate)||0)).slice(0,80);
  return Response.json({items:unique,feedsOk,feedsTotal:FEEDS.length,errors,generatedAt:new Date().toISOString()}, {headers:cors(request.headers.get("Origin"))});
 }
};