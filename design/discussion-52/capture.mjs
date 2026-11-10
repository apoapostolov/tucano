import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('./',import.meta.url);
const browser=await chromium.launch({channel:'chrome',headless:true});
const specs=[
['a-focused-thread',1440,900,'a'],
['b-inline-thread',1440,980,'b'],
['workspace-switcher',860,650,'workspace'],
['channel-context',1440,1000,'context'],
['reply-intent',1000,700,'replies'],
['a-mobile',390,844,'a'],
['a-dark',1440,900,'a','dark']
];
const report=[];
for(const [name,width,height,view,theme] of specs){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.goto(new URL('mockups.html',root).href+'?view='+view+(theme?'&theme='+theme:''));
 await page.evaluate(()=>document.fonts.ready);
 if(name==='a-mobile')await page.locator('.messages').evaluate(e=>e.scrollTop=e.scrollHeight);
 await page.screenshot({path:fileURLToPath(new URL(name+'.png',root))});
 const metrics=await page.evaluate(()=>{
  const bad=[];for(const e of document.querySelectorAll('button,textarea,.msg,.readerbar,.composer,.task,.permissiontable,.wsrow')){
   const r=e.getBoundingClientRect();if(r.left<-.5||r.right>innerWidth+.5)bad.push({tag:e.tagName,cls:e.className,text:e.innerText?.slice(0,60),left:r.left,right:r.right});
  }
  return {bodyWidth:document.body.scrollWidth,viewport:innerWidth,horizontalOverflow:bad,scrollRegions:[...document.querySelectorAll('.messages,.sheetcontent')].map(e=>({cls:e.className,client:e.clientHeight,scroll:e.scrollHeight}))};
 });
 report.push({name,...metrics});await page.close();
}
writeFileSync(new URL('capture-report.json',root),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));await browser.close();
