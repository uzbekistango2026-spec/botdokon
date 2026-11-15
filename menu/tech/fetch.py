import json, urllib.request, urllib.parse, time, os, sys
H={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36','Accept':'application/json'}
need={'tv':10,'fr':9,'wm':9,'ac':6,'vc':6,'mw':5,'bn':6}
src={}; seen=set()
for line in open('q.tsv'):
    k,qs=line.rstrip('\n').split('\t'); got=[]
    for q in qs.split('|'):
        for page in (1,2):
            if len(got)>=need[k]: break
            u='https://unsplash.com/napi/search/photos?'+urllib.parse.urlencode({'query':q,'per_page':30,'page':page})
            try: d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30))
            except Exception as e: print('ERR',q,e); time.sleep(3); continue
            for r in d.get('results',[]):
                if len(got)>=need[k]: break
                if r['id'] in seen or r.get('premium') or 'plus.unsplash' in r['urls']['raw']: continue
                if k!='bn' and r['width']<r['height']*0.6: continue
                seen.add(r['id']); got.append(r)
            time.sleep(1.5)
    for i,r in enumerate(got,1):
        name=f'{k}{i:02d}'; url=r['urls']['raw']+('&w=1400&h=700&fit=crop' if k=='bn' else '&w=800&h=800&fit=crop')+'&q=80&fm=jpg'
        try:
            open(name+'.jpg','wb').write(urllib.request.urlopen(urllib.request.Request(url,headers=H),timeout=40).read())
            src[name]={'id':r['id'],'alt':r.get('alt_description') or '','by':r['user']['name']}; print('OK',name,r['id'],src[name]['alt'][:60])
        except Exception as e: print('ERR',name,e)
json.dump(src,open('sources.json','w'),ensure_ascii=False,indent=1)
