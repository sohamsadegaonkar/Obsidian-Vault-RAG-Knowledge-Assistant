import {safePath,LIMITS,parseVault} from './vault-engine.mjs';
const decoder=new TextDecoder('utf-8',{fatal:true});
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
async function inflate(bytes,max){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));const reader=stream.getReader(),parts=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('ZIP content exceeds its declared size.');parts.push(value);}}catch(e){await reader.cancel();throw e;}const out=new Uint8Array(size);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
export async function readZip(buffer){
  if(buffer.byteLength>5000000)throw new Error('Choose a ZIP smaller than 5 MB.');
  const v=new DataView(buffer),bytes=new Uint8Array(buffer);let eocd=-1;
  for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(v.getUint32(p,true)===0x06054b50&&p+22+v.getUint16(p+20,true)===bytes.length){eocd=p;break;}
  if(eocd<0)throw new Error('This file is not a valid ZIP archive.');
  if(v.getUint16(eocd+4,true)||v.getUint16(eocd+6,true))throw new Error('Multi-disk ZIP archives are not supported.');
  const count=v.getUint16(eocd+10,true),centralSize=v.getUint32(eocd+12,true);let pos=v.getUint32(eocd+16,true),declared=0;const notes=[];
  if(count>1000||pos+centralSize>eocd)throw new Error('This ZIP contains too many entries or an invalid index.');
  for(let i=0;i<count;i++){
    if(pos+46>eocd||v.getUint32(pos,true)!==0x02014b50)throw new Error('The ZIP index is damaged.');
    const flags=v.getUint16(pos+8,true),method=v.getUint16(pos+10,true),crc=v.getUint32(pos+16,true),compressed=v.getUint32(pos+20,true),size=v.getUint32(pos+24,true),nameLen=v.getUint16(pos+28,true),extraLen=v.getUint16(pos+30,true),commentLen=v.getUint16(pos+32,true),attrs=v.getUint32(pos+38,true),local=v.getUint32(pos+42,true);
    const end=pos+46+nameLen+extraLen+commentLen;if(end>eocd)throw new Error('The ZIP index is damaged.');
    const name=decoder.decode(bytes.slice(pos+46,pos+46+nameLen));pos=end;
    if(!/\.md$/i.test(name)||name.startsWith('__MACOSX/')||name.split('/').some(p=>p==='.obsidian'))continue;
    const path=safePath(name);
    if(flags&1)throw new Error('Password-protected ZIP files are not supported.');
    if(((attrs>>>16)&0xf000)===0xa000)throw new Error('Symbolic links are not accepted.');
    declared+=size;if(size>LIMITS.noteChars||declared>LIMITS.totalChars||notes.length>=LIMITS.notes)throw new Error('ZIP exceeds the note count or expanded-size limit.');
    if(local+30>bytes.length||v.getUint32(local,true)!==0x04034b50)throw new Error('A ZIP entry is damaged.');
    const offset=local+30+v.getUint16(local+26,true)+v.getUint16(local+28,true);
    if(offset+compressed>bytes.length)throw new Error('A ZIP entry is truncated.');
    const data=bytes.slice(offset,offset+compressed);let output;
    if(method===0)output=data;else if(method===8)output=await inflate(data,size);else throw new Error('Use a standard ZIP with store or deflate compression.');
    if(output.length!==size||crc32(output)!==crc)throw new Error('A ZIP entry failed its integrity check.');
    notes.push({path,content:decoder.decode(output)});
  }
  if(!notes.length)throw new Error('No Markdown notes were found in this ZIP.');
  parseVault(notes);return notes;
}
export async function importFiles(files){
  if(!files.length)throw new Error('Choose Markdown files or one ZIP.');
  if(files.length===1&&/\.zip$/i.test(files[0].name))return readZip(await files[0].arrayBuffer());
  if(files.length>LIMITS.notes)throw new Error('Choose up to 100 Markdown notes.');
  if(files.reduce((n,f)=>n+f.size,0)>LIMITS.totalChars)throw new Error('Choose notes totalling less than 1.5 MB.');
  const notes=[];for(const f of files){safePath(f.webkitRelativePath||f.name);if(f.size>LIMITS.noteChars)throw new Error('Each note must be smaller than 100 KB.');notes.push({path:f.webkitRelativePath||f.name,content:decoder.decode(await f.arrayBuffer())});}
  parseVault(notes);return notes;
}
