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
