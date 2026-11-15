import json, urllib.request, urllib.parse, time, os
H={'User-Agent':'BotDokon/1.0 (demo catalog; github.com/uzbekistango2026-spec/botdokon)'}
Q={'tv':['smart tv living room','television wall mounted','oled television','flat screen tv'],
   'fr':['refrigerator kitchen','stainless steel refrigerator','fridge freezer'],
   'wm':['washing machine','front loading washing machine','laundry room washer'],
   'ac':['air conditioner indoor unit','split air conditioner','air conditioning wall unit'],
   'vc':['vacuum cleaner','cordless vacuum cleaner','robot vacuum cleaner'],
   'mw':['microwave oven','microwave kitchen'],
   'bn':['modern living room television','modern kitchen interior','laundry room interior','electronics store']}
os.makedirs('cand',exist_ok=True); src={}
for k,qs in Q.items():
    n=0; seen=set()
    for q in qs:
        u='https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':q,'page_size':20,'license_type':'commercial','size':'large','mature':'false'})
        try: d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=40))
        except Exception as e: print('ERR',q,e); time.sleep(5); continue
        for r in d.get('results',[]):
            if n>=28 or r['url'] in seen: continue
            seen.add(r['url']); n+=1; name=f'cand/{k}_{n:02d}.jpg'
            try:
                b=urllib.request.urlopen(urllib.request.Request(r['url'],headers=H),timeout=40).read()
                if len(b)<15000: n-=1; continue
                open(name,'wb').write(b); src[name]={'url':r['url'],'title':r.get('title'),'creator':r.get('creator'),'license':r.get('license'),'landing':r.get('foreign_landing_url')}; print('OK',name,len(b))
            except Exception as e: n-=1; print('ERR',name,e)
        time.sleep(2)
json.dump(src,open('cand/sources.json','w'),ensure_ascii=False,indent=1)
