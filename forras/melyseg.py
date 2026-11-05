import sys
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
W, H = im.size
# 518-es oldal, 14 többszöröse, arány megtartva
h = 518
w = 518  # a modell bemenete fix 518x518
x = np.asarray(im.resize((w, h), Image.BICUBIC), dtype=np.float32) / 255.0
x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
x = x.transpose(2, 0, 1)[None].astype(np.float32)
sess = ort.InferenceSession('/home/claude/work/depth_vits.onnx')
name = sess.get_inputs()[0].name
d = sess.run(None, {name: x})[0]
d = np.squeeze(d)
d = (d - d.min()) / (d.max() - d.min())
img = Image.fromarray((d * 255).astype(np.uint8)).resize((1024, int(1024 * H / W)), Image.BICUBIC)
img = img.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(3))
img.save(out)
print(w, h, d.shape, out)
