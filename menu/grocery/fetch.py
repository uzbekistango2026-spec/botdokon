import csv, json, time, urllib.request, urllib.parse, os
H={'User-Agent':'BotDokon/1.0 (demo catalog)'}
DB={'food':'world.openfoodfacts.org','products':'world.openproductsfacts.org','beauty':'world.openbeautyfacts.org','petfood':'world.openpetfoodfacts.org'}
out={}
for r in csv.DictReader(open('list.tsv'),delimiter='\t'):
    q=urllib.parse.quote(r['query']); host=DB[r['db']]
    url=f'https://{host}/cgi/search.pl?search_terms={q}&search_simple=1&action=process&json=1&page_size=12&fields=code,product_name,image_front_url'
    try:
        d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers=H),timeout=30))
        ps=[p for p in d.get('products',[]) if p.get('image_front_url')]
        if not ps: print('NONE',r['key']); continue
        u=ps[0]['image_front_url'].replace('.400.jpg','.full.jpg') if False else ps[0]['image_front_url']
        img=urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30).read()
        open(r['key']+'.jpg','wb').write(img); out[r['key']]={'src':f'https://{host}/product/{ps[0]["code"]}','name':ps[0].get('product_name','')}
        print('OK',r['key'],len(img))
    except Exception as e: print('ERR',r['key'],e)
    time.sleep(1.2)
json.dump(out,open('sources.json','w'),ensure_ascii=False,indent=1)
