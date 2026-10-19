# Café Nana, Sopron (v2.4)

Statikus weboldal (HTML, CSS, JS, GSAP), build nélkül.

- `site/`: a kész oldal, ez kerül a Netlifyra (`netlify.toml`: publish = "site")
- `forras/img.py`: a képek feldolgozása (színkezelés, méretek)
- `teszt/`: Playwright-tesztek (képernyőképek, akadásmérés, a hero fedése, a fotós jelzése)
- `docs/`: kutatás, változásnapló, a szövegek előtte–utána

Helyi megnyitás: `cd site && python3 -m http.server 8766`
