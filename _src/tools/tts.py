# Generates audio/<voice>/<file>.mp3 for each slide with edge-tts. Skips existing files and failures.
import asyncio, json, os, sys, edge_tts
items=json.load(open(sys.argv[1])); out=sys.argv[2]
VOICES={"andrew":"en-US-AndrewNeural","ava":"en-US-AvaNeural"}
async def main():
    for key,voice in VOICES.items():
        os.makedirs(f"{out}/{key}",exist_ok=True)
        for it in items:
            path=f"{out}/{key}/{it['file']}.mp3"
            if os.path.exists(path) and os.path.getsize(path)>1000: continue
            try:
                await asyncio.wait_for(edge_tts.Communicate(it["text"],voice,rate="-5%").save(path+".part"),45)
                os.replace(path+".part",path); print("ok",path,flush=True)
            except Exception as e:
                print("FAIL",path,repr(e)[:80],flush=True)
                if os.path.exists(path+".part"): os.remove(path+".part")
asyncio.run(main())
