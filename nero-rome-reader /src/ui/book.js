/* Full text: a table of contents (volumes; long volumes fold after eight chapters) and one chapter at a time with
   previous · contents · next, the place remembered, and links like …/#ch12. The text is dist/book.js (window.BOOK,
   built from data/book.txt), loaded on demand. With the optional counter service (server/visit-counter; its URL goes in
   build.config.json "counter") each chapter shows how many different visitors (salted IP hashes) have opened it. */
const COUNTER=/*__COUNTER__*/'';
const BK={cur:-1,counts:null};
function bookLoad(cb){if(window.BOOK){cb();return;}(window.__bookCbs=window.__bookCbs||[]).push(cb);if(window.__bookLoading)return;window.__bookLoading=1;
  window.bookLoaded=()=>{const q=window.__bookCbs||[];window.__bookCbs=[];q.forEach(f=>f());};
  const s=document.createElement('script');s.src='book.js';s.onerror=()=>{window.__bookLoading=0;alert('没有找到全文文件 book.js（需要用 npm run build 生成）');};document.head.appendChild(s);}
const bookApi=p=>COUNTER.replace(/\/+$/,'')+p;
function bookCounts(){if(!COUNTER)return Promise.resolve(null);return fetch(bookApi('/counts')).then(r=>r.json()).then(o=>BK.counts=o).catch(()=>null);}
function bookHit(n){if(!COUNTER)return Promise.resolve(null);return fetch(bookApi('/hit?ch='+n),{method:'POST'}).then(r=>r.json()).then(o=>{if(BK.counts)BK.counts[n]=o.n;return o.n;}).catch(()=>null);}
/* chapter -> sandbox state (AD 54 … 57 autumn) */
function bookState(n){return n<=14?0:n<=18?1:n<=22?2:n<=31?3:4;}
function bookLast(){try{return JSON.parse(localStorage.getItem('nero-book')||'null');}catch(e){return null;}}
function bookSave(o){try{localStorage.setItem('nero-book',JSON.stringify(o));}catch(e){}}
function bookToc(){bookLoad(()=>{const B=BOOK,R=$('#reader');let T=$('#btoc');if(!T){T=document.createElement('div');T.id='btoc';R.appendChild(T);}
  const last=bookLast(),cnt=n=>BK.counts&&BK.counts[n]!=null?`${BK.counts[n]} 人读过`:'';
  T.innerHTML=`<div class="btop"><button class="rbtn" data-act="close">✕ 关闭目录</button></div>
    <div class="binfo"><h2>${esc(B.title)}</h2><p class="bmeta">${esc(B.author)} 著 · ${B.tags.map(esc).join(' · ')} · ${(B.words/1e4).toFixed(1)} 万字 · ${B.chs.length} 章</p>
      <p class="bintro">${esc(B.intro)}</p>
      <div class="bacts"><button class="rbtn" data-act="start">从第 1 章读起</button>${last&&B.chs[last.i]?`<button class="rbtn" data-act="cont">继续读：第 ${B.chs[last.i].n} 章 ${esc(B.chs[last.i].t)}</button>`:''}<button class="rbtn" data-act="sample">示例摘录（带沙盘提示）</button></div></div>`+
    B.vols.map((v,vi)=>{const L=B.chs.map((c,i)=>[c,i]).filter(([c])=>c.v===vi);return `<section class="bvol"><h3>${esc(v)}</h3><div class="bgrid${L.length>8?' fold':''}">`+
      L.map(([c,i],j)=>`<a href="#ch${c.n}" data-i="${i}"${j>=8?' class="more"':''}><span>第${c.n}章 ${esc(c.t)}</span><em data-n="${c.n}">${cnt(c.n)}</em></a>`).join('')+`</div>`+
      (L.length>8?`<button class="rbtn bmore">展开全部（${L.length} 章）</button>`:'')+`</section>`;}).join('')+
    (B.notes.length?`<section class="bvol"><h3>作者注</h3><div class="bgrid"><a href="#notes" data-notes="1"><span>【注】${B.notes.length} 条</span><em></em></a></div></section>`:'');
  T.onclick=e=>{const a=e.target.closest('a,button');if(!a)return;e.preventDefault();
    if(a.classList.contains('bmore')){const g=a.previousElementSibling,f=g.classList.toggle('fold');a.textContent=f?`展开全部（${g.children.length} 章）`:'收起';return;}
    const act=a.dataset.act;if(act==='close'){T.hidden=true;return;}if(act==='start'){bookShow(0);return;}if(act==='cont'){bookShow(last.i,last.top);return;}
    if(act==='sample'){T.hidden=true;bookSample();return;}if(a.dataset.notes){bookNotes();return;}if(a.dataset.i!=null)bookShow(+a.dataset.i);};
  T.hidden=false;T.scrollTop=0;$('#reader').classList.remove('closed');
  bookCounts().then(o=>{if(!o)return;T.querySelectorAll('em[data-n]').forEach(e=>{const n=+e.dataset.n;e.textContent=o[n]!=null?`${o[n]} 人读过`:'';});});});}
function bookNav(i){const B=BOOK,nav=pos=>`<nav class="bnav ${pos}"><button class="rbtn" data-go="${i-1}"${i<=0?' disabled':''}>‹ 上一章</button><button class="rbtn" data-go="toc">目录</button><button class="rbtn" data-go="${i+1}"${i>=B.chs.length-1?' disabled':''}>下一章 ›</button></nav>`;return nav;}
function bookShow(i,top){bookLoad(()=>{const B=BOOK,c=B.chs[i];if(!c)return;BK.cur=i;const s=bookState(c.n);
  buildReader([{s,when:B.vols[c.v]||'',ch:`第${c.n}章 ${c.t}`,p:c.p,n:''}],'');
  const R=$('#rscroll'),art=R.querySelector('article'),nav=bookNav(i);art.classList.add('on');art.insertAdjacentHTML('afterbegin',nav('top'));art.insertAdjacentHTML('beforeend',nav('bot'));
  if(COUNTER){art.querySelector('h2').insertAdjacentHTML('afterend','<p class="bcount">　</p>');bookHit(c.n).then(n=>{const e=art.querySelector('.bcount');if(e)e.textContent=n!=null?`本章已有 ${n} 位读者（按不同 IP 计）`:'';});}
  art.querySelectorAll('.bnav button').forEach(b=>b.onclick=()=>{const g=b.dataset.go;if(g==='toc')bookToc();else bookShow(+g);});
  const T=$('#btoc');if(T)T.hidden=true;$('#reader').classList.remove('closed');
  R.style.scrollBehavior='auto';R.scrollTop=top||0;R.style.scrollBehavior='';
  if(s!==curS&&typeof setState==='function')setState(s);if(typeof W0!=='undefined'&&W0){W0.curCh=c.n;W0.ev={};applyGates();}
  bookSave({i,top:top||0});try{history.replaceState(null,'','#ch'+c.n);}catch(e){}});}
function bookNotes(){bookLoad(()=>{const B=BOOK;buildReader([{s:curS,when:'',ch:'作者注',p:B.notes,n:''}],'');const R=$('#rscroll'),art=R.querySelector('article');art.classList.add('on');
  art.insertAdjacentHTML('afterbegin','<nav class="bnav top"><button class="rbtn" data-go="toc">目录</button></nav>');art.querySelector('[data-go]').onclick=()=>bookToc();
  const T=$('#btoc');if(T)T.hidden=true;R.scrollTop=0;});}
function bookSample(){BK.cur=-1;try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}if(typeof window.__sampleReader==='function')window.__sampleReader();}
/* straight into the text: the chapter last read, else chapter 1 */
function bookRead(){bookLoad(()=>{const l=bookLast();if(l&&BOOK.chs[l.i])bookShow(l.i,l.top);else bookShow(0);});}
function bookInit(){const rh=$('.rhead');if(rh&&!$('#rread')){const r=document.createElement('button');r.className='rbtn rmain';r.id='rread';r.textContent='读正文';r.title='直接进入正文（接着上次读到的地方）';r.onclick=()=>bookRead();rh.insertBefore(r,rh.querySelector('label[for="txt"]')||rh.children[1]);}
  if(rh&&!$('#rtoc')){const b=document.createElement('button');b.className='rbtn';b.id='rtoc';b.textContent='目录';b.title='章节目录 · 全文阅读';b.onclick=()=>bookToc();rh.insertBefore(b,rh.querySelector('label[for="txt"]')||rh.children[1]);}
  const R=$('#rscroll');let tmr=0;R.addEventListener('scroll',()=>{if(BK.cur<0)return;clearTimeout(tmr);tmr=setTimeout(()=>bookSave({i:BK.cur,top:R.scrollTop}),400);});
  const go=()=>{const m=location.hash.match(/^#ch(\d+)$/);if(m)bookLoad(()=>{const i=BOOK.chs.findIndex(c=>c.n===+m[1]);if(i>=0&&i!==BK.cur)bookShow(i);});};
  window.addEventListener('hashchange',go);go();}
