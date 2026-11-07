#!/usr/bin/env node
// Assemble a cut from a timeline: clips and title cards in order, dissolves between them, captions burned in,
// and a sound mix brought to -14 LUFS. Timeline format: tools/video/README.md, "Rough cuts".
//
//   node tools/video/cut.mjs tools/video/cuts/rough-zh.json [--out FILE]
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';

const argv=process.argv.slice(2),opt=k=>{const i=argv.indexOf('--'+k);return i>=0?argv[i+1]:null;};
const file=argv.find((a,i)=>!a.startsWith('--')&&argv[i-1]!=='--out');if(!file){console.error('Usage: node tools/video/cut.mjs <timeline.json> [--out FILE]');process.exit(1);}
const home=p=>p.replace(/^~(?=\/)/,os.homedir());
{const v=path.join(os.homedir(),'NeroRome-video');try{if(fs.lstatSync(v).isSymbolicLink()&&!fs.existsSync(v)){console.error(`${v} points to ${fs.readlinkSync(v)}, which is not there: plug in the drive.`);process.exit(1);}}catch(e){}}   // the folder may be a link to an external drive
const T=JSON.parse(fs.readFileSync(file,'utf8')),W=T.width||1920,H=T.height||1080,fps=T.fps||30,root=home(T.root||'~/NeroRome-video/footage'),soundRoot=home(T.sound||'~/NeroRome-video/sound');
const out=path.resolve(home(opt('out')||T.out||'~/NeroRome-video/cuts/cut.mp4'));fs.mkdirSync(path.dirname(out),{recursive:true});
if(spawnSync('ffmpeg',['-version']).status!==0){console.error('ffmpeg not found (README: installing ffmpeg on this Mac)');process.exit(1);}

// Inputs: a clip is a stretch of a file, a card is black with centred text. Each is scaled, retimed and made BT.709 4:2:0.
const args=['-y','-loglevel','error'],chains=[],subs=[],sounds=[];let len=0,prev=null;
const ts=s=>{const h=Math.floor(s/3600),m=Math.floor(s/60)%60,x=(s%60).toFixed(2).padStart(5,'0');return `${h}:${String(m).padStart(2,'0')}:${x}`;};
const esc=t=>t.replace(/\\/g,'\\\\').replace(/{/g,'\\{').replace(/}/g,'\\}');
T.clips.forEach((c,i)=>{const dur=c.dur;if(!(dur>0))throw new Error(`clip ${i}: dur missing`);
  if(c.card){args.push('-f','lavfi','-t',String(dur),'-i',`color=c=black:s=${W}x${H}:r=${fps}`);}
  else{const f=path.join(root,c.file);if(!fs.existsSync(f))throw new Error('missing '+f);args.push('-ss',String(c.in||0),'-t',String(dur),'-i',f);}
  chains.push(`[${i}:v]scale=${W}:${H}:in_color_matrix=bt709:out_color_matrix=bt709,fps=${fps},format=yuv420p,setpts=PTS-STARTPTS[v${i}]`);
  const fade=i?Math.max(1/fps,c.fade??0):0,start=i?len-fade:0;   // a hard cut is a one-frame dissolve
  if(i){chains.push(`[${prev}][v${i}]xfade=transition=fade:duration=${fade.toFixed(3)}:offset=${start.toFixed(3)}[x${i}]`);prev=`x${i}`;}else prev='v0';
  len=start+dur;
  for(const s of c.sound||[])sounds.push({...s,at:start+(s.at||0)});   // a clip's sounds are timed from the clip's start
  const lines=c.card||c.text;if(lines){const[a,b]=c.textAt||[c.card?.4:1,dur-(c.card?.4:.6)];
    subs.push(`Dialogue: 0,${ts(start+a)},${ts(start+b)},${c.card?'Card':'Cap'},,0,0,0,,{\\fad(300,300)}${lines.map(esc).join('\\N')}`);}
  if(c.note){const[a,b]=c.noteAt||[0,dur];subs.push(`Dialogue: 1,${ts(start+a)},${ts(start+b)},Note,,0,0,0,,{\\fad(400,400)}${esc(c.note)}`);}});

// Captions: the same font as the burned-in subtitle test (Hiragino Sans GB has the CJK glyphs), white with a soft dark edge.
const font=T.font||'Hiragino Sans GB',ass=path.join(os.tmpdir(),'cut-'+process.pid+'.ass');
fs.writeFileSync(ass,`[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 2\n\n[V4+ Styles]\n`+
  'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'+
  `Style: Cap,${font},${Math.round(H*.042)},&H00FFFFFF,&H00FFFFFF,&H40000000,&H80000000,0,0,0,0,100,100,2,0,1,${(H/360).toFixed(1)},${(H/540).toFixed(1)},2,120,120,${Math.round(H*.07)},1\n`+
  `Style: Note,${font},${Math.round(H*.022)},&H30FFFFFF,&H30FFFFFF,&H80000000,&H00000000,0,0,0,0,100,100,1,0,1,${(H/720).toFixed(1)},0,3,40,${Math.round(H*.035)},${Math.round(H*.03)},1\n`+
  `Style: Card,${font},${Math.round(H*.05)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,4,0,1,0,0,5,160,160,0,1\n\n`+
  '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'+subs.join('\n')+'\n');
chains.push(`[${prev}]subtitles=filename='${ass.replace(/'/g,"\\'")}'[vout]`);

// Sound: every piece is placed on the timeline (timeline-level `audio` in seconds from the start, clip `sound` from the
// clip's start), mixed, then brought to -14 LUFS integrated with a -1 dBTP limiter.
for(const s of T.audio||[])sounds.push(s);
let mix=null,gain=0;
if(sounds.length){mix=path.join(os.tmpdir(),'cut-'+process.pid+'.wav');const a=['-y','-loglevel','error'],g=[];
  sounds.forEach((s,k)=>{const f=path.join(soundRoot,s.file);if(!fs.existsSync(f))throw new Error('missing '+f);const d=Math.min(s.dur??len-s.at,len-s.at);
    if(s.loop)a.push('-stream_loop','-1');a.push('-ss',String(s.in||0),'-t',String(d),'-i',f);
    const fi=s.fadeIn??0,fo=s.fadeOut??0,ms=Math.round(s.at*1000);
    g.push(`[${k}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${s.gain??0}dB`+(fi?`,afade=t=in:d=${fi}`:'')+(fo?`,afade=t=out:st=${Math.max(0,d-fo)}:d=${fo}`:'')+`,adelay=${ms}|${ms}[a${k}]`);});
  g.push(sounds.map((s,k)=>`[a${k}]`).join('')+`amix=inputs=${sounds.length}:normalize=0:duration=longest,apad=whole_dur=${len.toFixed(3)},atrim=0:${len.toFixed(3)}[aout]`);
  a.push('-filter_complex',g.join(';'),'-map','[aout]','-c:a','pcm_s24le',mix);
  if(spawnSync('ffmpeg',a,{stdio:['ignore','inherit','inherit']}).status!==0){console.error('ffmpeg failed on the sound mix');process.exit(1);}
  const m=spawnSync('ffmpeg',['-hide_banner','-i',mix,'-af','ebur128','-f','null','-'],{encoding:'utf8'}).stderr.match(/I:\s+(-?[\d.]+) LUFS\s*$/m);
  gain=m?-14-parseFloat(m[1]):0;}
if(mix)args.push('-i',mix);
args.push('-filter_complex',chains.join(';')+(mix?`;[${T.clips.length}:a]volume=${gain.toFixed(2)}dB,alimiter=limit=0.891:level=false[am]`:''),'-map','[vout]',...(mix?['-map','[am]','-c:a','aac','-b:a','256k']:['-an']),'-c:v','libx264','-preset','medium','-crf',String(T.crf||18),'-pix_fmt','yuv420p',
  '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv','-movflags','+faststart',out);
const t0=Date.now(),r=spawnSync('ffmpeg',args,{stdio:['ignore','inherit','inherit']});fs.rmSync(ass,{force:true});if(mix)fs.rmSync(mix,{force:true});
if(r.status!==0){console.error('ffmpeg failed');process.exit(1);}
console.log(`${T.clips.length} pieces, ${sounds.length} sounds${mix?` (${gain>=0?'+':''}${gain.toFixed(1)} dB to -14 LUFS)`:''}, ${len.toFixed(1)} s -> ${out} (${((Date.now()-t0)/1000).toFixed(0)} s)`);
