#!/usr/bin/env node
// Render the reader's own synthesized sounds to WAV for the edit, with the same voices as src/ui/app.js (pluck):
// the music-box Canon the reader played before music upload (03620ae), the wind chimes (bells) at each tier, and
// a rain bed (ffmpeg noise; the reader has no rain sound, so this one is a stand-in).
//
//   node tools/video/sounds.mjs [--out DIR]      (default ~/NeroRome-video/sound)
import puppeteer from 'puppeteer';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';

const argv=process.argv.slice(2),opt=k=>{const i=argv.indexOf('--'+k);return i>=0?argv[i+1]:null;};
const out=path.resolve(opt('out')||path.join(os.homedir(),'NeroRome-video/sound'));
{const v=path.join(os.homedir(),'NeroRome-video');try{if(fs.lstatSync(v).isSymbolicLink()&&!fs.existsSync(v)){console.error(`${v} points to ${fs.readlinkSync(v)}, which is not there: plug in the drive.`);process.exit(1);}}catch(e){}}
fs.mkdirSync(out,{recursive:true});const SR=48000;

function wav(file,L,R){const n=L.length,b=Buffer.alloc(44+n*4);b.write('RIFF',0);b.writeUInt32LE(36+n*4,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);
  b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*4,40);
  for(let i=0;i<n;i++){b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,L[i]))*32767),44+i*4);b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,R[i]))*32767),46+i*4);}
  fs.writeFileSync(path.join(out,file),b);console.log(file,(n/SR).toFixed(1)+' s');}

// Each score is a list of [time, frequency, gain, decay]; the page plays it through pluck() offline.
const BASS=[293.66,220,246.94,185,196,146.83,196,220],LEAD=[587.33,554.37,493.88,440,392,369.99,392,440,739.99,659.25,587.33,554.37,493.88,440,493.88,554.37];
function canon(steps){const S=[];for(let s=0;s<steps;s++){const t=s*.52;S.push([t,BASS[s%8]/2,.1,1.6],[t,LEAD[s%16],.12,1.2]);if(s>=2)S.push([t+.26,LEAD[(s-2)%16]*.5,.08,1.2]);}return S;}
function rng(seed){return()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;}
function bells(tiers,rounds,gap,seed){const r=rng(seed),F2=[1046.5,1174.6,1318.5,1567.9,1760],N=Math.min(14,tiers+2),S=[];   // one gust per round, as bells() plays on each state change
  for(let k=0;k<rounds;k++)for(let i=0;i<N;i++){const f=F2[i%5];S.push([k*gap+(i*(tiers>5?150:240)+r()*120)/1000,f*(r()<.5?1:1.5),.025+.006*tiers,2.4]);}return S;}

const browser=await puppeteer.launch({headless:true});
try{const page=await browser.newPage();
  const render=(score,dur,pan)=>page.evaluate(async(score,dur,pan,SR)=>{const ctx=new OfflineAudioContext(2,Math.ceil(dur*SR),SR);
    for(const[t,f,g,d]of score){const o=ctx.createOscillator(),o2=ctx.createOscillator(),G=ctx.createGain(),P=ctx.createStereoPanner();o.type='sine';o.frequency.value=f;o2.type='triangle';o2.frequency.value=f*3;
      G.gain.setValueAtTime(.0001,t);G.gain.exponentialRampToValueAtTime(g,t+.012);G.gain.exponentialRampToValueAtTime(.0001,t+d);P.pan.value=pan?(Math.sin(f*12.9898)*.5):0;   // chimes spread a little left and right
      o.connect(G);o2.connect(G);G.connect(P);P.connect(ctx.destination);o.start(t);o2.start(t);o.stop(t+d);o2.stop(t+d);}
    const b=await ctx.startRendering();return[Array.from(b.getChannelData(0)),Array.from(b.getChannelData(1))];},score,dur,pan,SR);
  const put=async(file,score,dur,pan=false)=>{const[L,R]=await render(score,dur,pan);wav(file,L,R);};
  await put('musicbox-canon.wav',canon(192),192*.52+1.6);   // 12 rounds of the 16-note lead, about 1:41
  await put('chimes-light.wav',bells(3,6,5,1),31,true);     // tiers 3 (AD 57 states), a gust every 5 s
  await put('chimes-temple.wav',bells(4,6,5,2),31,true);    // tiers 4 (AD 58)
  await put('chimes-full.wav',bells(9,6,5,3),32,true);      // tiers 9 (the finished city)
}finally{await browser.close();}

// Rain: pink noise for the hiss, brown for the body, different seeds per side so it is wide; a stand-in until a recording is chosen.
const ff=spawnSync('ffmpeg',['-y','-loglevel','error','-f','lavfi','-i','anoisesrc=c=pink:r=48000:a=0.5:s=7:d=120','-f','lavfi','-i','anoisesrc=c=pink:r=48000:a=0.5:s=11:d=120',
  '-f','lavfi','-i','anoisesrc=c=brown:r=48000:a=0.6:s=5:d=120','-filter_complex',
  '[0]highpass=f=500,lowpass=f=9000[l];[1]highpass=f=500,lowpass=f=9000[r];[2]lowpass=f=400,volume=0.5,asplit[b1][b2];[l][b1]amix=inputs=2:normalize=0[L];[r][b2]amix=inputs=2:normalize=0[R];[L][R]join=inputs=2:channel_layout=stereo,volume=0.6',
  path.join(out,'rain-standin.wav')],{stdio:'inherit'});
if(ff.status!==0)console.error('ffmpeg failed on the rain bed');else console.log('rain-standin.wav 120.0 s');
