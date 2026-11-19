// Prints [{file,text}] for each slide of a template-style guide (plain-text slides).
const fs=require("fs");const h=fs.readFileSync(process.argv[2],"utf8");
const block=h.slice(h.indexOf("const T = ["),h.indexOf("const MIXUPS"));
const i=h.indexOf("function slideSpeech(t,s){");const fn=h.slice(i,h.indexOf("\n}",i)+2);
eval(block+"\nconst allSlides = t => [...t.slides,{h:\"Know these terms\",terms:t.terms}];\n"+fn+
 "\nconsole.log(JSON.stringify(T.flatMap(t=>allSlides(t).map((s,i)=>({file:`${t.id}-${i}`,text:slideSpeech(t,s)})))))");
