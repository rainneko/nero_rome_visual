#!/usr/bin/env node
// Syntax check of the concatenated program (the page runs it as one classic script).
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);const js=scripts.sort((a,b)=>b.length-a.length)[0];
const tmp=path.join(root,'dist/.check.js');fs.writeFileSync(tmp,js);try{execFileSync(process.execPath,['--check',tmp],{stdio:'inherit'});console.log('syntax ok');}finally{fs.unlinkSync(tmp);}
