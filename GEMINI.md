# Project Richtlijnen: School Hindernis

Dit document bevat permanente kwaliteitscontroles en richtlijnen voor 3D modeling, Three.js geometrie en UI binnen dit project.

---

## 1. Voorkom Z-Fighting (Flikkerende Oppervlakken)
- **Geen coplanaire vlakken**: Plaats nooit twee meshes, vlakken of beugels op exact dezelfde coördinaat (zelfde X, Y of Z).
- **Duidelijke dieptelagen**: Hanteer een strikte fysieke hiërarchie met meetbare afstand (minstens 5 tot 10 mm offset):
  - `Muur` ➔ `Montagesteunen / beugels (achter de plaat)` ➔ `Achterplaat / frame` ➔ `Canvas / sign mesh`.
- **Montagesteunen en beslag**:
  - Wandbeugels moeten strikt **achter** het paneel in de muur vallen of buiten het zichtvlak blijven.
  - Hoekbeslag of sierlijsten mogen het canvasoppervlak niet doorkruisen of overlappen op gelijke diepte.
- **PolygonOffset**:
  - Gebruik voor vlakken die vlak voor een ander vlak liggen (borden, vloerkleden, posters, lijnen) altijd `polygonOffset` op het materiaal:
    ```javascript
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
    ```

---

## 2. Voorkom Gespiegelde Objecten & Teksten
- **2D Canvas Textures**:
  - Teken tekst en graphics standaard van links naar rechts (`x = 0` is links, `x = width` is rechts).
  - Vermijd `ctx.scale(-1, 1)` tenzij na visuele verificatie strikt noodzakelijk.
- **3D Orientatie & Rotatie**:
  - Let bij `PlaneGeometry` en `CircleGeometry` op de winding en rotatie: wanneer een vlak geroteerd wordt met `rotation.y = Math.PI` om naar `-Z` te kijken, staat de voorkant van het vlak naar de toeschouwer gericht.
  - Controleer altijd of tekst en cijfers vanuit het spelersperspectief correct van links naar rechts leesbaar zijn.
- **Klokken & Wijzers**:
  - Cijfer 12 staat bovenaan, 3 rechts (+X), 6 onderaan (-Y) en 9 links (-X).
  - Rotatie met de klok mee vanaf 12 uur naar 3 uur is een **negatieve** rotatie om de Z-as (`rotation.z = -angle`).

---

## 3. Zichtlijnen en Overkappingen
- Houd rekening met het perspectief vanaf de grond (spelerhoogte 1.0 - 1.6m en camera-invalshoek).
- Zorg dat luifels, afdakjes of balken het zicht op borden, klokken en interactieve objecten niet blokkeren vanuit de naderingshoek (schoolplein, gang, oprit).

---

## 4. Workflow & Deployment
- Deploy niet automatisch na elke wijziging naar Google Cloud Run.
- Test en bouw lokaal (`npm run build`, `http://localhost:5173`), commit en push naar Git.
- Pas deployen naar Cloud Run als de gebruiker hier expliciet om vraagt.
