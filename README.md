# 🎒 School Hindernis 3D

Een meeslepende 3D webgame ontworpen om soepel te draaien op zowel **telefoons** als **Chromebooks** (en pc's/laptops).

## 📖 Verhaallijn
Je kruipt in de huid van een leerling. Je wordt 's ochtends wakker met het geluid van de tikkende en trillende wekker. De schoolbel wacht niet! Je stapt uit bed, navigeert door de overloop, daalt via de houten trap af naar de benedenverdieping en bereikt de kleerkast. Zodra je de kast opent, trek je je schoolkleding en boekentas aan!

---

## 🎮 Besturing

### 💻 Chromebook / PC / Laptop:
* **Lopen**: `W`, `A`, `S`, `D` of de `Pijltjestoetsen` (camera-relatief)
* **Rondkijken**: Klik en sleep met de **muis**
* **Springen**: `Spatiebalk`
* **Interactie (Opstaan / Kast openen)**: `E` of `Enter` (of klik op het scherm)
* **Geluid**: Klik op 🔊/🔇 in de menubalk
* **Volledig scherm**: Klik op ⛶

### 📱 Mobiele Telefoon / Touchscreens:
* **Lopen**: Virtuele analoge joystick aan de linkerzijde
* **Rondkijken**: Veeg met je vinger over de rechterhelft van het scherm
* **Springen**: Tik op de 👟 **Spring** knop
* **Interactie (Opstaan / Kast openen)**: Tik op de 🚪 **Kast** actieknop (licht op zodra je bij de kast staat)

---

## ⚡ URL Shortcuts (Directe Spel- & Scène-starters)

Via URL query parameters kun je direct in elke fase van het spel springen (handig voor testen, demonstraties en direct spelen):

### 🎯 Scène & Voortgang

| Parameter | Beschrijving | Voorbeeldlink (Lokaal) |
| :--- | :--- | :--- |
| `?gym=1` *(of `?scene=gym`)* | **Gymzaal (Apenkooien)**: Start direct bovenop de start-turnkast voor de 3 slingerende touwen en de grote valmat! | [localhost:5173/?gym=1](http://localhost:5173/?gym=1) |
| `?school=1` *(of `?scene=school`)* | **Schoolgang**: Start direct aangekleed met schooltas bij de dubbele schooldeuren voor kluisje #7. | [localhost:5173/?school=1](http://localhost:5173/?school=1) |
| `?drive=1` *(of `?scene=drive`)* | **Autorijden**: Start direct achter het stuur van de auto op de weg naar school. | [localhost:5173/?drive=1](http://localhost:5173/?drive=1) |
| `?car=1` *(of `?scene=car`)* | **Oprijlaan**: Start buiten naast de gezinsauto, klaar om in te stappen. | [localhost:5173/?car=1](http://localhost:5173/?car=1) |
| `?door=1` | **Voordeur**: Start beneden met schoolkleding, tas en alle 5 speurtocht-items al verzameld. | [localhost:5173/?door=1](http://localhost:5173/?door=1) |
| `?wardrobe=1` | **Kledingkast Studio**: Start direct voor de kledingkast met de outfit-keuzemenu's geopend. | [localhost:5173/?wardrobe=1](http://localhost:5173/?wardrobe=1) |
| `?speurtocht=1` | **Speurtocht**: Start boven op de overloop met de tas gepakt en de zoektocht naar de 5 spullen actief. | [localhost:5173/?speurtocht=1](http://localhost:5173/?speurtocht=1) |
| `?bag=1` | **Bovenverdieping**: Start direct uit bed bij de overloop. | [localhost:5173/?bag=1](http://localhost:5173/?bag=1) |
| `?autostart=1` | **Direct wakker**: Slaat de "Word wakker!" welkomstknop over en start direct in de slaapkamer. | [localhost:5173/?autostart=1](http://localhost:5173/?autostart=1) |
| `?victory=1` | **Overwinning**: Triggert direct het eindscherm / kluisje voltooid. | [localhost:5173/?victory=1](http://localhost:5173/?victory=1) |

### ⛅ Weer & Instellingen

| Parameter | Beschrijving | Voorbeeld |
| :--- | :--- | :--- |
| `?weather=sunny` | Zonnig ochtendweer (T-shirt / korte broek aanbevolen). | `?weather=sunny` |
| `?weather=rainy` | Regenachtig weer met regendruppels op de ramen (trui / lange broek aanbevolen). | `?weather=rainy` |
| `?weather=chilly` | Fris / herfstweer. | `?weather=chilly` |
| `?time=30` | Pas de timer aan in seconden (bijv. `30` voor een snelle 30-seconden test). | `?time=30` |

*Tip: Parameters kunnen ook gecombineerd worden, bijvoorbeeld:*
* `https://school-hindernis-897563108562.europe-west4.run.app/?gym=1`
* `http://localhost:5173/?school=1&weather=rainy`

---

## 🚀 Lokaal Draaien

1. Installeer afhankelijkheden:
   ```bash
   npm install
   ```

2. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```
   *Tip*: Open het getoonde netwerk-adres op je telefoon binnen hetzelfde wifi-netwerk om het direct op je mobiel te spelen!

3. Bouwen voor productie:
   ```bash
   npm run build
   ```

---

## 🛠️ Technische Kenmerken
* **Three.js**: Geoptimaliseerde WebGL rendering met ochtendzon schaduwen en fog effect.
* **Web Audio API**: Real-time audiosynthese voor de wekker, houten voetstappen, sprongen en klerenfeest. Geen externe mp3-bestanden vereist.
* **Fysica**: Vloeiende trapbeklimming, zwaartekracht, botsingsdetectie en wall-sliding.
* **Responsief**: Schaalbaar voor zowel portret- als landschapsoriëntatie op alle schermresoluties.
