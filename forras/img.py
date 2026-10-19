# Café Nana v2: minden fotó ugyanazt a „házi” színkezelést kapja, hogy a különböző forrású képek egy családnak hassanak.
import sys, os
from PIL import Image, ImageOps, ImageEnhance
R='/home/claude/katlan-borozo-demo/raw/'; O='/home/claude/cafe-nana2/site/img/'
os.makedirs(O, exist_ok=True)
def load(f): return ImageOps.exif_transpose(Image.open(R+f)).convert('RGB')
def box(im, b): return im.crop(b)
def crop_ar(im, ar, cx=0.5, cy=0.5):
    w,h=im.size
    if w/h > ar: nw=int(h*ar); x=int(min(max(cx*w-nw/2,0),w-nw)); return im.crop((x,0,x+nw,h))
    nh=int(w/ar); y=int(min(max(cy*h-nh/2,0),h-nh)); return im.crop((0,y,w,y+nh))
def neutral(im, strength=0.85, ratio=(1.035,1.0,0.925)):
    # v2.3: a semlegesnek szánt (kevéssé telített, középtónusú) felületek, például falak, abroszok, tányérok
    # színét egy közös, krémes fehér felé húzza, így a narancsosra szűrt és a természetes fotók egy családba kerülnek.
    # A fekete és a fehér a helyén marad (csatornánkénti gamma).
    import numpy as np
    s=np.asarray(im.resize((400,max(1,round(400*im.height/im.width)))),dtype=np.float32).reshape(-1,3)
    mx=s.max(1); mn=s.min(1); L=s.mean(1); sat=(mx-mn)/np.maximum(mx,1)
    lo,hi=np.percentile(L,30),np.percentile(L,97)
    sel=s[(L>=lo)&(L<=hi)&(sat<np.percentile(sat,45))&(mx<250)]
    if len(sel)<200: sel=s[(L>=lo)&(sat<np.percentile(sat,60))]
    if len(sel)<200: return im
    m=np.clip(sel.mean(0),1,254); r=np.array(ratio,dtype=np.float32); t=np.clip(m.mean()*r/r.mean(),1,254)
    gam=np.clip(1+(np.log(t/255)/np.log(m/255)-1)*strength,0.7,1.45)
    lut=[[int(min(255,max(0,round(255*(v/255)**g)))) for v in range(256)] for g in gam]
    return Image.merge('RGB',[c.point(l) for c,l in zip(im.split(),lut)])
def house(im, bright=1.0, contrast=1.0, sat=1.0, warm=0.0, wb=0.85):
    if wb: im=neutral(im, wb)
    im=ImageEnhance.Brightness(im).enhance(bright)
    im=ImageEnhance.Contrast(im).enhance(contrast)
    im=ImageEnhance.Color(im).enhance(0.86*sat)
    # matt, meleg árnyékok: a fekete sötét kakaóbarna, a fehér krémes
    lo=(26,20,18); hi=(252,247,238)
    chans=[]
    for i,c in enumerate(im.split()):
        w=warm*(1 if i==0 else (0.35 if i==1 else -0.8))
        chans.append(c.point(lambda v,i=i,w=w: max(0,min(255,int(lo[i]+(hi[i]-lo[i])*v/255*(1+w))))))
    return Image.merge('RGB',chans)
def save(im, name, widths, q=78):
    for w in widths:
        x=im.copy()
        if x.width>w: x=x.resize((w, round(x.height*w/x.width)), Image.LANCZOS)
        p=O+'%s-%d.webp'%(name,w); x.save(p,'WEBP',quality=q,method=6)
        print(name, w, x.size, os.path.getsize(p)//1024,'KB')
def only(n): return len(sys.argv)<2 or n in sys.argv[1:]

if only('hero'):
    # v2.3: a nyitott szárnyas ajtó a szalonból a pult felé (Google-helyfotó, muapi-val 4x felskálázva).
    # 3:4-es eredeti, alul vágva 4:5-re; a fotós jelzése (© KISKLAU) a fájlban marad, a lábléc is feltünteti.
    im=load('cn-mu-a5ea-up.png'); im=im.crop((0,0,im.width,round(im.width*1.25))).resize((4000,5000), Image.LANCZOS)
    im=house(im,1.0,1.03,0.95,0.0)
    save(im,'hero',[4000,3200,2800,2000,1400,1000],q=72)
if only('villa'):
    # v2.3: a mai villa a kupolával, a feliratos homlokzattal és a balluszteres lépcsővel (natív 3000 px-es Google-helyfotó)
    im=load('cn-g34-pxvzeym0SID.jpg'); im=im.crop((520,250,3000,250+round(2480*580/890)))
    save(house(im,1.0,1.0,0.8,0.0),'villa',[1800,1100],q=76)
if only('interior'):
    # erősen narancsosra szűrt eredeti: két menet semlegesítés, kisebb telítettség, hogy a terasz mellett egy családba tartozzon
    save(house(neutral(load('cn-mu-int86-up.png'),1.0),1.0,1.02,0.8,0.0,wb=1.0),'szalon',[1600,900])
    # v2.3: a terasz (Google-helyfotó, muapi-val felskálázva) a korábbi belső terem helyett
    save(crop_ar(house(load('cn-mu-ea8e-up.png'),1.0,1.02,0.92),4/5,0.5,0.6),'terasz',[1100,700])
if only('cakes'):
    save(crop_ar(house(load('cn-wp-94.jpg'),1.0,1.03),4/5,0.5,0.5),'vitrin',[1000,640])
    save(crop_ar(house(load('cn-wp-93.jpg'),1.0,1.02),4/5,0.5,0.55),'kremes',[1000,640])
    save(crop_ar(house(load('cn-mu-wheel98-up.png'),1.0,1.02,0.95),1.0,0.5,0.5),'szeletek',[1500,1100,700])
    save(crop_ar(house(load('cn-mu-pek96-up.png'),1.0,1.03),4/5,0.5,0.5),'pekaru',[1000,640])
    save(crop_ar(house(load('cn-mu-slice-up.png'),1.0,1.02),5/4,0.5,0.5),'szelet',[1300,800])
    save(crop_ar(house(load('cn-wp-89.jpg'),1.0,1.03),4/5,0.45,0.5),'pult',[1000,640])
if only('menu'):
    # v2.2: a kis kivágások muapi-val felskálázott forrásból (e863, wp-95, b9a4), a limonádé a nagyobb Wolt eredetiből;
    # 720 px az egér melletti képhez (260 px × Retina), 200 px a mobil bélyegképhez
    E=load('cn-mu-e863-up.png'); fe=E.width/1920
    W95=load('cn-mu-wp95-up.png'); fw=W95.width/843
    L=load('cn-wolt-3e31-big.jpg'); fl=L.width/1920
    sc=lambda b,f: tuple(round(v*f) for v in b)
    items=[
      ('m-benedict', box(E,sc((1340,680,1660,1080),fe))),
      ('m-avokado',  box(load('cn-g34-yqdmE8WmDWo.jpg'),(300,900,2700,3900))),
      ('m-bagel',    box(E,sc((170,620,550,1080),fe))),
      ('m-salata',   box(E,sc((1428,0,1812,480),fe))),
      ('m-szeletek', crop_ar(load('cn-mu-wheel98-up.png'),4/5)),
      ('m-kremes',   crop_ar(load('cn-wp-93.jpg'),4/5,0.5,0.6)),
      ('m-narancs',  crop_ar(load('cn-mu-slice-up.png'),4/5,0.45,0.5)),
      ('m-pekaru',   crop_ar(load('cn-mu-pek96-up.png'),4/5,0.5,0.5)),
      ('m-box',      box(load('cn-wolt-3e2c.jpg'),(560,100,1440,1000))),
      ('m-torta',    box(W95,sc((492,457,790,830),fw))),
      ('m-kave',     (lambda K: crop_ar(box(K,sc((200,1050,1250,1800),K.width/1440)),4/5,0.35,0.5))(load('cn-mu-hero97-up.png'))),
      ('m-jeges',    crop_ar(load('cn-mu-b9a4-up.png'),4/5,0.35,0.5)),
      ('m-limonade', box(L,sc((820,180,1180,630),fl))),
      ('m-elvitel',  crop_ar(load('cn-wp-88.jpg'),4/5,0.5,0.7)),
    ]
    for n,im in items:
        im=crop_ar(im,4/5)
        if im.width<720: print('  kicsi forrás', n, im.size)
        if im.width<720: im=im.resize((720,900),Image.LANCZOS)
        save(house(im,1.0,1.03),n,[720,200],q=80)
