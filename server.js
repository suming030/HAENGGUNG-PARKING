// ParkingFlow — public website connector prototype (not an approved official API)
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const PORT=Number(process.env.PORT)||8787;
const OFFICIAL='https://parking.suwonudc.co.kr/';
const NAMES={hwahong:'화홍문',jangan:'장안동',namsoo:'남수동',yeonmudong:'연무동'};
function parseOfficialText(input){
 const plain=input.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
 const results=[];
 for(const [id,name] of Object.entries(NAMES)){
 const re=new RegExp(name+'(?:\\s+(?:공영|주차장|공영주차장)){0,3}\\s+([0-9,]+)\\s*대\\s*가능\\s*\\/\\s*([0-9,]+)\\s*면');
 const m=plain.match(re);if(!m)continue;
 const free=Number(m[1].replaceAll(',','')),capacity=Number(m[2].replaceAll(',',''));
 if(Number.isSafeInteger(free)&&Number.isSafeInteger(capacity)&&capacity>0&&capacity<=10000&&free>=0&&free<=capacity)results.push({id,free,capacity});
 }
 return results;
}
let cache=null,pending=null;
async function getLive(){
 if(cache&&Date.now()-cache.timestamp<60000)return cache.value;
 if(pending)return pending;
 pending=(async()=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
 const r=await fetch(OFFICIAL,{signal:controller.signal,headers:{Accept:'text/html','Accept-Language':'ko-KR,ko;q=0.9'}});
 if(!r.ok)throw Error('공식 사이트 요청 실패: '+r.status);
 const spaces=parseOfficialText(await r.text());
 if(!spaces.length)throw Error('공식 페이지에서 잔여면수를 확인하지 못했습니다. 정식 API 연동이 필요할 수 있습니다.');
 const value={status:'ok',source:'수원도시공사 공개 페이지',sourceUrl:OFFICIAL,updatedAt:new Date().toISOString(),spaces};
 cache={timestamp:Date.now(),value};return value;
 }finally{clearTimeout(timer);}
 })();
 try{return await pending;}finally{pending=null;}
}
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
function handler(req,res){
 if(req.method!=='GET')return json(res,405,{status:'error',message:'GET only'});
 const url=new URL(req.url,'http://localhost:'+PORT);
 if(url.pathname==='/api/parking'){getLive().then(v=>json(res,200,v)).catch(e=>json(res,503,{status:'error',message:e.message,spaces:[],sourceUrl:OFFICIAL}));return;}
 if(url.pathname==='/health')return json(res,200,{status:'ok'});
 if(url.pathname!=='/'&&url.pathname!=='/index.html'){res.writeHead(404);return res.end('Not Found');}
 fs.readFile(path.join(__dirname,'index.html'),(error,html)=>{if(error){res.writeHead(500);return res.end('Error');}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
}
if(require.main===module)http.createServer(handler).listen(PORT,'0.0.0.0',()=>console.log('ParkingFlow: http://localhost:'+PORT));
module.exports={parseOfficialText,handler};
