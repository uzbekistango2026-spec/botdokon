import urllib.request, os
H={'User-Agent':'Mozilla/5.0'}
os.makedirs('raw',exist_ok=True)
for line in open('ids.txt'):
    k,*ids=line.split()
    for i in ids:
        try: open(f'raw/{k}__{i}.jpg','wb').write(urllib.request.urlopen(urllib.request.Request(f'https://images.unsplash.com/photo-{i}?w=1400&q=80&fm=jpg',headers=H),timeout=60).read()); print('OK',k,i)
        except Exception as e: print('ERR',k,i,e)
