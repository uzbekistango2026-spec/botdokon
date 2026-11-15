import urllib.request, io, os
from PIL import Image
H={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}
os.makedirs('raw',exist_ok=True)
for line in open('ids.txt'):
    k,*ids=line.split()
    for i in ids:
        fn=f'raw/{k}__{i}.jpg'
        if os.path.exists(fn): continue
        try:
            b=urllib.request.urlopen(urllib.request.Request(f'https://unsplash.com/photos/{i}/download?force=true&w=1600',headers=H),timeout=60).read()
            im=Image.open(io.BytesIO(b)).convert('RGB'); im.thumbnail((1600,1600)); im.save(fn,quality=84); print('OK',fn,im.size)
        except Exception as e: print('ERR',k,i,e)
