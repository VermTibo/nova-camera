# NOVA — Camera System

Een lokale, interactieve camera-configurator, gebouwd met React, TypeScript, Vite, Three.js, React Three Fiber, Drei en Zustand. De NOVA-studio toont een Sony Alpha-geïnspireerd cameramodel op basis van `public/camera.jpg`; configuraties, specificaties en prijzen blijven conceptgegevens.

## Visuele referenties

- `public/camera.jpg`: zwarte Sony Alpha-body, taps toelopende zoeker met Sony-logo, diepe rubberen grip, Alpha-badge, koperen lensvatting en FE-lens met G-badge. De standaardconfiguratie gebruikt een matte zwarte body met 24–70mm-lens.
- `public/font-modern.png`: TT Burn Condensed als stijlreferentie; in overleg wordt de lokaal beschikbare Anton gebruikt als gecondenseerd alternatief. Dit is niet de exacte TT Burn-font. Licentie: `public/fonts/Anton-LICENSE.txt`.
- `public/kleur-modern.png`: Pure Black `#000000`, Cobalt Blue `#3478F7`, Tangerine `#EC562E` en Petal Peach `#F3D2C6`, toegepast op de studio, configurator, dialogen en Shot Lab.
- `public/cut off error.png`: canvas vult nu de volledige viewer. Kadrering en zoomgrens houden het hele model binnen de ruimte tussen titel en bediening, ook bij roteren, accessoires en exploded view. De fullscreenknop vergroot de viewer zelf.


## Starten

Node.js 20.19+ (of 22.12+) en npm:

```bash
npm install
npm run dev
```

Open het lokale adres dat Vite toont, doorgaans http://localhost:5173.

```bash
npm run build    # TypeScript-controle en productie-build in dist/
npm run preview  # Productie-build lokaal bekijken
npm test         # Tests van configuratie, prijzen, URL en opslag
```

## Bediening

- Sleep om te draaien; scroll of pinch om te zoomen. Inzoomen stopt bij de volledige modelkadrering; Hero herstelt het standaardstandpunt. De minimale afstand wordt voor elke kijkhoek en schermverhouding opnieuw berekend. Pannen is uitgeschakeld.
- Klik op body, lens, grip of accessoires om de bijbehorende configuratie te openen.
- Hero, Front, Back, Top, Side en Detail animeren naar vaste standpunten.
- EXPLODE scheidt lens, mount, grip, achterpaneel en accessoires. ASSEMBLE voegt ze weer samen.
- Product, Technical en Cinematic staan onderaan. Detail houdt het volledige model scherp; Cinematic draait langzaam rond het systeem.
- Op mobiel staat de configuratie onder het model. Sleep de handgreep omhoog of tik erop om het paneel uit te klappen.
- Details bevat opslaan, laden, gravering, mount en accentkleur.
- Share configuration kopieert een volledige URL en toont deze ook in een kopieerbaar tekstveld.
- Reset vraagt bevestiging. Een opgeslagen configuratie blijft behouden.
- Geluid staat standaard uit.

## Configuratie

Drie bodyvarianten uit dezelfde modulaire familie, vier standaardkleuren plus vrije kleurkeuze, drie finishes, drie gripmaterialen, zeven afzonderlijk geparametriseerde lenzen, lensfinish, zonnekap, UV/ND-filter, twee viewfinders of geen viewfinder, scharnierend display, sensortype, mountadapter, accent en gravering.

Accessoires: cage, top handle, side handle, flitser, microfoon, monitor, battery grip, strap en rails. Handles vereisen de cage; deze wordt automatisch toegevoegd. De prijs telt deze afhankelijkheid mee. Het verwijderen van de cage verwijdert ook beide handles.

De bodyfamilie gebruikt een gemeenschappelijke behuizing. De labels A7 III, A7R en A7C gebruiken intern nog de identifiers N1, N1R en N1C, zodat bestaande deel-URLs en opgeslagen configuraties blijven werken. Het zijn conceptvarianten, geen drie geïmporteerde scans.

## 3D-opbouw

Het model is volledig lokaal en parametrisch opgebouwd. Er zijn geen externe GLB-, HDR- of texturebestanden nodig. Afgeronde panelen, lensringen, instanced kartelingen, schroeven, lensvatting, sensor, diafragma, glaslagen, bedieningsknoppen en accessoires zijn afzonderlijke geometrieën.

PBR-materialen gebruiken lokale procedurele microtexturen voor rubber, leer, hout en geborsteld metaal. Studio-softboxes worden in een reflectieomgeving gerenderd. Dit is een gegenereerde studio-environment, geen fotografische HDRI. De Anton UI-font wordt lokaal geladen met systeemfonts als fallback. Merkaanduidingen op het 3D-model gebruiken afzonderlijke decals voor een herkenbare Sony-uitstraling.

De 3D-code wordt apart en lazy geladen. De pixelratio is begrensd. Gekartelde ringen gebruiken instancing. Procedurele textures en geometrieën worden bij vervanging opgeruimd. Scherptediepteblur is uitgeschakeld zodat gravering en lensdetails in alle standen scherp blijven. Lensopschriften volgen de cilindrische behuizing; de frontgravering volgt de lensring. Decals behouden de letterverhoudingen en gebruiken anisotrope filtering. Werkelijke framesnelheid hangt af van GPU, resolutie en accessoires; 60 FPS is een streefwaarde, geen garantie.

## Bronstructuur

```text
src/
  components/     Configurator en toegankelijke native dialog
  data/           Lens- en accessoirecatalogus
  scene/          Body, lens, accessoires, materialen, studio en diagnostiek
  state/          Zustand-store, URL-validatie, prijsberekening en tests
  styles/         Responsive vormgeving
  App.tsx         Productervaring en presentatiebediening
```

URL-data wordt gevalideerd; onbekende keuzes vallen terug op veilige defaults. Zowel een volledige `?config=...`-URL als bijvoorbeeld `?body=titanium&lens=85mm&cage=true` wordt ondersteund. Opgeslagen configuraties zijn lokaal aan browser en origin gebonden. Er is geen backend of checkout.

Voeg `?debug=true` toe voor FPS, draw calls, polygonenaantal, camerapositie en configuratiestate. Bij een bestaande query voeg je `&debug=true` toe.

## Toegankelijkheid en herstel

Toetsenbordbediening, focusstijlen, benoemde knoppen, switch-state en native modals met focusbeheer. De vaste camerastandpunten bieden een alternatief voor dragbediening. Reduced-motion schakelt de belangrijkste overgangen en automatische rotatie uit. Bij uitval van WebGL verschijnt een herstelmelding terwijl de configuratie beschikbaar blijft.

## Validatie

Tien geautomatiseerde tests controleren prijzen, alle lenzen, ongeldige invoer, URL-roundtrips, cage-afhankelijkheden, niet-muteren van defaults en save/reset/load met geïsoleerde opslag. Daarnaast zijn rendering, configuratie-interacties, deel-URL, reset, mobiele layout en paneelbediening in de browser gecontroleerd. Er is geen test op een fysiek touchscreen uitgevoerd.

## Shot Lab

De knop **Shot Lab / Play** opent een lokale, geïllustreerde camera-simulator zonder webcamtoegang. Drie opdrachten oefenen een stilleven, bewegende fietser en nachtscène. Focusafstand, diafragma, sluitertijd en ISO wijzigen de live preview. De lichtmeter toont onder- of overbelichting; de focusmarkering geeft aan of het onderwerp scherp is.

Elke foto krijgt maximaal 100 punten: focus 40, belichting 40 en bewegingsscherpte 20. Belichting gebruikt `log2(diafragma² × sluitertijdnoemer × 100 / ISO)` ten opzichte van de scene-EV. Dit is een vereenvoudigde leer-simulator, geen volledige optische simulatie. Na de opname volgt uitleg, opnieuw proberen of de volgende opdracht. Na drie foto's verschijnt het gemiddelde met scores per scène. Speldata blijft alleen in het geheugen; sluiten of opnieuw spelen begint opnieuw en wijzigt de camera-configuratie niet.

Sliders werken met toetsenbord en aanraking. Escape sluit de dialoog. Reduced-motion schakelt de sluiterflits uit. Vijf extra tests controleren haalbare hoge scores, belichtingsstops, bewegingsonscherpte, focus en scoregrenzen.

## Automatische camerakadrering

De viewer meet de volledige 3D-assembly en berekent een veilige afstand op basis van zowel de horizontale als verticale beeldhoek. Lenswissels, accessoires, exploded view en venster-resizes werken de begrenzing opnieuw bij. Tijdens assemblage-animaties worden de grenzen per frame gemeten. De beginpositie en standaardaanzichten houden het model volledig in beeld. Handmatig zoomen en Detail laten bewuste close-ups toe; Hero herstelt de volledige kadrering. De canvas blijft binnen de stage, vrij van de titel en onderste bediening. Korte schermen kunnen de pagina verticaal scrollen.


## Photo Studio

Open **STUDIO** naast EXPLODE om de belichting te regisseren. Showroom, Golden hour en Blue hour veranderen de lichtkleuren, reflecties en achtergrond. Lichtintensiteit en draaisnelheid zijn instelbaar; de draaitafel respecteert reduced motion. **CAPTURE POSTER** downloadt een PNG van 1920 × 1440 met de actuele kijkhoek, cameranaam, lens en gekozen lichtstijl. De export gebeurt lokaal in de browser. Studio-instellingen gelden voor de huidige sessie; configuratielinks blijven uitsluitend de cameraconfiguratie delen.
