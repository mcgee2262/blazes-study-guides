// Prints [{file,text}] for every lesson slide, using the page's own lesson data and speech rules.
const fs=require("fs");const h=fs.readFileSync(process.argv[2],"utf8");
const block=h.split("//<LESSONS>")[1].split("//</LESSONS>")[0];
const grab=(start)=>{const i=h.indexOf(start);let j=h.indexOf("\n}",i);return h.slice(i,j+2)};
const code=block+"\nconst MK="+h.split("const MK=")[1].split(";\n")[0]+";\n"+grab("function say(s){")+"\n"+
 "const allSlides = t => [...t.slides,{h:\"Know this\",terms:t.terms}];\n"+grab("function slideSpeech(t,s){")+
 "\nconsole.log(JSON.stringify(T.flatMap(t=>allSlides(t).map((s,i)=>({file:`${t.id}-${i}`,text:slideSpeech(t,s)})))))";
eval(code);
