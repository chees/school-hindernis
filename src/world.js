import * as THREE from 'three';

export class GameWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.cameraOccluders = [];
    this.interactiveObjects = {};
    this.animatedObjects = [];

    // Verdiepingshoogtes
    this.UPPER_Y = 3.6;
    this.LOWER_Y = 0.0;

    // Trap afmetingen
    this.stairsConfig = {
      xMin: 2.2,
      xMax: 4.8,
      zTop: -0.5,
      zBottom: 5.5,
      yTop: this.UPPER_Y,
      yBottom: this.LOWER_Y
    };

    this.materials = this.createMaterials();
    this.buildWorld();
  }

  createMaterials() {
    return {
      wallUpper: new THREE.MeshStandardMaterial({ color: 0xdaeaf6, roughness: 0.8 }),
      wallLower: new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.8 }),
      wallAccent: new THREE.MeshStandardMaterial({ color: 0x88c0d0, roughness: 0.7 }),
      woodFloorUpper: new THREE.MeshStandardMaterial({ color: 0xc49a6c, roughness: 0.5 }),
      woodFloorLower: new THREE.MeshStandardMaterial({ color: 0xb58451, roughness: 0.45 }),
      
      // Decals / vloerkleden met polygonOffset om z-fighting met vloer/muur 100% te voorkomen
      rugBedroom: new THREE.MeshStandardMaterial({
        color: 0x6ca0dc,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      rugRunner: new THREE.MeshStandardMaterial({
        color: 0xbf5b49,
        roughness: 0.85,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      doormatMat: new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      posterColor1: new THREE.MeshStandardMaterial({
        color: 0xffa726,
        roughness: 0.5,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      posterColor2: new THREE.MeshStandardMaterial({
        color: 0xab47bc,
        roughness: 0.5,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      glowMarker: new THREE.MeshBasicMaterial({
        color: 0x4caf50,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3
      }),

      // Badkamer materialen
      bathroomTileFloor: new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        roughness: 0.25,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      bathroomTileWall: new THREE.MeshStandardMaterial({
        color: 0xf0fdfa,
        roughness: 0.35,
        metalness: 0.05
      }),
      bathroomRug: new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3
      }),
      porcelain: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.02
      }),
      toiletSeat: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        metalness: 0.9,
        roughness: 0.15
      }),
      showerGlass: new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.38,
        roughness: 0.05
      }),
      mirrorMat: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      }),
      waterMat: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1
      }),

      bedFrame: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.6 }),
      mattress: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
      blanket: new THREE.MeshStandardMaterial({ color: 0x3d72b4, roughness: 0.8 }),
      pillow: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
      woodFurniture: new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.5 }),
      wardrobeWood: new THREE.MeshStandardMaterial({ color: 0x51351e, roughness: 0.4 }),
      wardrobeInside: new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.6 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xe6b800, metalness: 0.7, roughness: 0.3 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 }),
      glass: new THREE.MeshStandardMaterial({ color: 0xccf2ff, transparent: true, opacity: 0.5, roughness: 0.1 }),
      leafGreen: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 }),
      potColor: new THREE.MeshStandardMaterial({ color: 0xd27d53, roughness: 0.7 }),
      alarmClock: new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.4 })
    };
  }

  buildWorld() {
    this.createLights();
    this.createUpperFloor();
    this.createStairs();
    this.createLowerFloor();
    this.createBathroom();
    this.createWardrobe();
    this.createDecorations();
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.75);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffae6, 1.15);
    sunLight.position.set(-10, 9, -12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 35;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.bias = -0.0008;
    sunLight.shadow.normalBias = 0.03;
    this.scene.add(sunLight);

    const hallLight = new THREE.PointLight(0xffdfba, 0.85, 14);
    hallLight.position.set(0, 2.6, 6);
    this.scene.add(hallLight);
  }

  // --- BOVENVERDIEPING ---
  createUpperFloor() {
    const y = this.UPPER_Y;

    // Slaapkamervloer: x: -8 tot 0, z: -8 tot 1.5
    const bedRoomFloorGeo = new THREE.BoxGeometry(8, 0.2, 9.5);
    const bedRoomFloor = new THREE.Mesh(bedRoomFloorGeo, this.materials.woodFloorUpper);
    bedRoomFloor.position.set(-4, y - 0.1, -3.25);
    bedRoomFloor.receiveShadow = true;
    this.scene.add(bedRoomFloor);

    // Vloerkleedje in slaapkamer (bovenop vloer met polygonOffset)
    const rugGeo = new THREE.PlaneGeometry(3.6, 3.0);
    rugGeo.rotateX(-Math.PI / 2);
    const rug = new THREE.Mesh(rugGeo, this.materials.rugBedroom);
    rug.position.set(-3.5, y + 0.002, -3);
    rug.receiveShadow = true;
    this.scene.add(rug);

    // Overloop vloer:
    // Deel links van trap: x: 0 tot 2.2, z: -8 tot 1.5
    const hallFloor1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 9.5), this.materials.woodFloorUpper);
    hallFloor1.position.set(1.1, y - 0.1, -3.25);
    hallFloor1.receiveShadow = true;
    this.scene.add(hallFloor1);

    // Deel boven de trap (noord): x: 2.2 tot 6.0, z: -8 tot -0.5
    const hallFloor2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 7.5), this.materials.woodFloorUpper);
    hallFloor2.position.set(4.1, y - 0.1, -4.25);
    hallFloor2.receiveShadow = true;
    this.scene.add(hallFloor2);

    this.cameraOccluders.push(bedRoomFloor, hallFloor1, hallFloor2);

    // MUREN BOVEN (Verzonken met 5cm in de vloerplaat om coplanair z-fighting met de vloer uit te sluiten)
    // Noordwand slaapkamer
    this.addWall(-4, y + 1.5, -8.0, 8.0, 3.1, 0.2, this.materials.wallUpper);
    // Linkerwand slaapkamer (West)
    this.addWall(-8.0, y + 1.5, -3.25, 0.2, 3.1, 9.3, this.materials.wallUpper);
    // Voorwand slaapkamer (Zuid)
    this.addWall(-4, y + 1.5, 1.5, 8.0, 3.1, 0.2, this.materials.wallUpper);

    // Tussenwand slaapkamer/gang met deuropening bij z = -2.6 tot -1.0
    // Noordelijk deel
    this.addWall(0, y + 1.5, -5.25, 0.2, 3.1, 5.3, this.materials.wallUpper);
    // Bovenkant deurpost
    this.addWall(0, y + 2.6, -1.8, 0.2, 0.8, 1.6, this.materials.wallUpper);
    // Zuidelijk deel
    this.addWall(0, y + 1.5, 0.25, 0.2, 3.1, 2.3, this.materials.wallUpper);

    // Noordwand overloop
    this.addWall(4.1, y + 1.5, -8.0, 3.8, 3.1, 0.2, this.materials.wallUpper);
    // Oostwand overloop
    this.addWall(6.0, y + 1.5, -4.25, 0.2, 3.1, 7.5, this.materials.wallUpper);

    // Hekwerk / Balustrade alleen op de bovenverdieping randen (geen overlap met trapleuning!)
    // Zuidrand overloop bij z = 1.5 (x: 0 tot 2.2)
    this.addBalustrade(1.1, y, 1.45, 2.2, 1.0, 0.08);
    // Noordrand trapgat rechts van trap (x: 4.8 tot 6.0 bij z = -0.5)
    this.addBalustrade(5.4, y, -0.5, 1.2, 1.0, 0.08);

    // Slaapkamerraam
    this.createWindow(-4, y + 1.6, -7.89, 2.8, 1.6);

    // Meubels
    this.createBed(-5.8, y, -5.5);
    this.createNightstandWithAlarm(-3.8, y, -6.8);
    this.createDesk(-6.6, y, -1.0);
  }

  // --- DE BADKAMER (WC, DOUCHE, WASTAFEL MET KRAAN) ---
  createBathroom() {
    const y = this.UPPER_Y;

    // 1. Badkamervloer: royale ruimte x: 2.2 tot 6.0, z: -8.0 tot -0.6 (3.8m breed x 7.4m diep)
    const tileGeo = new THREE.PlaneGeometry(3.78, 7.38);
    tileGeo.rotateX(-Math.PI / 2);
    const bathFloor = new THREE.Mesh(tileGeo, this.materials.bathroomTileFloor);
    bathFloor.position.set(4.1, y + 0.002, -4.3);
    bathFloor.receiveShadow = true;
    this.scene.add(bathFloor);

    // Zachte badmat voor de wastafel & douche
    const rugGeo = new THREE.PlaneGeometry(1.5, 0.9);
    rugGeo.rotateX(-Math.PI / 2);
    const bathRug = new THREE.Mesh(rugGeo, this.materials.bathroomRug);
    bathRug.position.set(4.5, y + 0.004, -3.8);
    bathRug.receiveShadow = true;
    this.scene.add(bathRug);

    // 2. Muren van de badkamer:
    // Westmuur (x = 2.2):
    // Noordelijk muurdeel: van z = -8.0 tot z = -2.8 (lengte 5.2m)
    this.addWall(2.2, y + 1.5, -5.4, 0.2, 3.1, 5.2, this.materials.bathroomTileWall);

    // Brede, open doorgang direct tegenover de slaapkamerdeur: z = -2.8 tot z = -0.8 (breedte 2.0 meter!)
    // Bovenkant deurpost boven de doorgang
    this.addWall(2.2, y + 2.65, -1.8, 0.2, 0.9, 2.0, this.materials.bathroomTileWall);

    // Zuidelijk hoekpaaltje naast de trap: van z = -0.8 tot z = -0.5 (lengte 0.3m)
    this.addWall(2.2, y + 1.5, -0.65, 0.2, 3.1, 0.3, this.materials.wallUpper);

    // Deurbordje "🚻 BADKAMER" boven de open ingang, gericht naar de gang en slaapkamer (-X)
    this.createBathroomSign(2.09, y + 2.35, -1.8);

    // Badkamerraam (matglas) aan de noordwand
    this.createWindow(3.6, y + 1.6, -7.89, 1.4, 1.2);

    // 3. HET TOILET (WC) - Ruim opgesteld aan de noordwand met een brede vrije looproute
    this.createToilet(3.6, y, -7.3);

    // 4. DE DOUCHE - Netjes in de noordoostelijke hoek
    this.createShower(5.2, y, -7.05);

    // 5. WASTAFEL MET KRAAN & SPIEGEL - Aan de oostwand
    this.createSink(5.72, y, -3.8);
  }

  createBathroomSign(x, y, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 80);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 248, 72);
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚻 BADKAMER', 128, 40);

    const signTex = new THREE.CanvasTexture(canvas);
    const signGeo = new THREE.PlaneGeometry(1.1, 0.35);
    const signMesh = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    signMesh.position.set(x, y, z);
    signMesh.rotation.y = -Math.PI / 2; // Kijkt richting -X (naar de gang en slaapkamerdeur)
    this.scene.add(signMesh);
  }

  createToilet(x, y, z) {
    const toiletGroup = new THREE.Group();
    toiletGroup.position.set(x, y, z);

    // Witte keramische toiletpot
    const bowlGeo = new THREE.BoxGeometry(0.40, 0.40, 0.54);
    const bowl = new THREE.Mesh(bowlGeo, this.materials.porcelain);
    bowl.position.set(0, 0.20, 0);
    bowl.castShadow = true;
    toiletGroup.add(bowl);

    // Wc-bril (donker antraciet)
    const seatGeo = new THREE.BoxGeometry(0.44, 0.05, 0.52);
    const seat = new THREE.Mesh(seatGeo, this.materials.toiletSeat);
    seat.position.set(0, 0.42, 0.01);
    toiletGroup.add(seat);

    // Water in de pot
    const waterGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
    this.toiletWaterMesh = new THREE.Mesh(waterGeo, this.materials.waterMat);
    this.toiletWaterMesh.position.set(0, 0.36, 0.04);
    toiletGroup.add(this.toiletWaterMesh);

    // Keramische spoelbak / reservoir aan de achterkant
    const tankGeo = new THREE.BoxGeometry(0.50, 0.56, 0.24);
    const tank = new THREE.Mesh(tankGeo, this.materials.porcelain);
    tank.position.set(0, 0.56, -0.32);
    tank.castShadow = true;
    toiletGroup.add(tank);

    // Glanzende chromen doordrukknop
    const buttonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12);
    const button = new THREE.Mesh(buttonGeo, this.materials.chrome);
    button.position.set(0, 0.85, -0.32);
    toiletGroup.add(button);

    // Toiletrolhouder aan de zijkant
    const holderArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.18), this.materials.chrome);
    holderArm.position.set(-0.35, 0.65, 0);
    toiletGroup.add(holderArm);

    const rollGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.14, 16);
    const roll = new THREE.Mesh(rollGeo, this.materials.mattress);
    roll.rotation.x = Math.PI / 2;
    roll.position.set(-0.35, 0.65, 0);
    toiletGroup.add(roll);

    this.scene.add(toiletGroup);

    // Collider voor toilet
    this.colliders.push({
      minX: x - 0.32, maxX: x + 0.32,
      minY: y, maxY: y + 1.2,
      minZ: z - 0.48, maxZ: z + 0.35
    });

    // Interactieve marker op de vloer (ruim voor het toilet)
    const markerGeo = new THREE.RingGeometry(0.50, 0.72, 32);
    markerGeo.rotateX(-Math.PI / 2);
    this.toiletMarker = new THREE.Mesh(markerGeo, this.materials.glowMarker);
    this.toiletMarker.position.set(x, y + 0.005, z + 0.85);
    this.scene.add(this.toiletMarker);

    // Zwevende gids-pijl / wc-indicator boven het toilet
    const arrowGeo = new THREE.ConeGeometry(0.20, 0.40, 16);
    arrowGeo.rotateX(Math.PI);
    this.toiletArrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8
    }));
    this.toiletArrow.position.set(x, y + 1.5, z + 0.85);
    this.scene.add(this.toiletArrow);

    this.interactiveObjects.toilet = {
      position: new THREE.Vector3(x, y, z + 0.85),
      radius: 2.0,
      used: false,
      onInteract: () => this.flushToilet()
    };
  }

  flushToilet() {
    this.interactiveObjects.toilet.used = true;
    if (this.toiletArrow) this.toiletArrow.visible = false;
    if (this.toiletMarker) this.toiletMarker.visible = false;

    // Kolkende wateranimatie in pot
    if (this.toiletWaterMesh) {
      const startTime = performance.now();
      const anim = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed < 2.0) {
          this.toiletWaterMesh.rotation.y += 0.25;
          const s = 0.8 + Math.sin(elapsed * 10) * 0.2;
          this.toiletWaterMesh.scale.set(s, 1, s);
          requestAnimationFrame(anim);
        } else {
          this.toiletWaterMesh.scale.set(1, 1, 1);
        }
      };
      requestAnimationFrame(anim);
    }
  }

  createShower(x, y, z) {
    const showerGroup = new THREE.Group();
    showerGroup.position.set(x, y, z);

    // Douchebak (verhoogd wit plateau)
    const trayGeo = new THREE.BoxGeometry(1.45, 0.10, 1.45);
    const tray = new THREE.Mesh(trayGeo, this.materials.porcelain);
    tray.position.set(0, 0.05, 0);
    showerGroup.add(tray);

    // Afvoerputje
    const drainGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);
    const drain = new THREE.Mesh(drainGeo, this.materials.chrome);
    drain.position.set(0, 0.105, 0);
    showerGroup.add(drain);

    // Glazen wand (Westzijde van de cabine: x = -0.70)
    const glassSideGeo = new THREE.BoxGeometry(0.03, 2.1, 1.4);
    const glassSide = new THREE.Mesh(glassSideGeo, this.materials.showerGlass);
    glassSide.position.set(-0.70, 1.10, 0);
    showerGroup.add(glassSide);

    // Glazen wand (Zuidzijde, halve inloopwand: z = 0.70, x van -0.70 tot 0.0)
    const glassFrontGeo = new THREE.BoxGeometry(0.72, 2.1, 0.03);
    const glassFront = new THREE.Mesh(glassFrontGeo, this.materials.showerGlass);
    glassFront.position.set(-0.35, 1.10, 0.70);
    showerGroup.add(glassFront);

    // Chromen hoekprofiel / paal
    const postGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.15, 8);
    const post = new THREE.Mesh(postGeo, this.materials.chrome);
    post.position.set(-0.70, 1.10, 0.70);
    showerGroup.add(post);

    // Chromen douchestang aan noordmuur
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.7, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.chrome);
    pole.position.set(0, 1.35, -0.68);
    showerGroup.add(pole);

    // Mengkraan met draaiknoppen
    const tapGeo = new THREE.BoxGeometry(0.18, 0.06, 0.08);
    const tap = new THREE.Mesh(tapGeo, this.materials.chrome);
    tap.position.set(0, 1.05, -0.65);
    showerGroup.add(tap);

    // Grote regendouchekop bovenin
    const headArm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.45), this.materials.chrome);
    headArm.position.set(0, 2.15, -0.45);
    showerGroup.add(headArm);

    const showerHeadGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
    const showerHead = new THREE.Mesh(showerHeadGeo, this.materials.chrome);
    showerHead.position.set(0, 2.13, -0.25);
    showerGroup.add(showerHead);

    // Geanimeerde douche regendruppels (partikels)
    this.showerParticlesGroup = new THREE.Group();
    this.showerParticlesGroup.position.set(0, 2.1, -0.25);
    const dropCount = 24;
    for (let i = 0; i < dropCount; i++) {
      const dropGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4);
      const drop = new THREE.Mesh(dropGeo, this.materials.waterMat);
      const radius = Math.random() * 0.15;
      const angle = Math.random() * Math.PI * 2;
      drop.position.set(Math.cos(angle) * radius, -Math.random() * 1.8, Math.sin(angle) * radius);
      this.showerParticlesGroup.add(drop);
    }
    this.showerParticlesGroup.visible = false;
    showerGroup.add(this.showerParticlesGroup);

    this.scene.add(showerGroup);

    // Douchecabine colliders (glaswanden)
    this.colliders.push({
      minX: x - 0.78, maxX: x - 0.62,
      minY: y, maxY: y + 2.2,
      minZ: z - 0.72, maxZ: z + 0.72
    });
    this.colliders.push({
      minX: x - 0.72, maxX: x + 0.02,
      minY: y, maxY: y + 2.2,
      minZ: z + 0.62, maxZ: z + 0.78
    });

    // Interactieve marker voor de douche
    const markerGeo = new THREE.RingGeometry(0.40, 0.60, 32);
    markerGeo.rotateX(-Math.PI / 2);
    this.showerMarker = new THREE.Mesh(markerGeo, this.materials.glowMarker);
    this.showerMarker.position.set(x + 0.35, y + 0.005, z + 1.1);
    this.scene.add(this.showerMarker);

    this.interactiveObjects.shower = {
      position: new THREE.Vector3(x + 0.35, y, z + 1.1),
      radius: 1.5,
      active: false,
      onInteract: () => this.toggleShower()
    };
  }

  toggleShower() {
    const shower = this.interactiveObjects.shower;
    shower.active = !shower.active;
    this.showerParticlesGroup.visible = shower.active;

    if (shower.active) {
      setTimeout(() => {
        shower.active = false;
        if (this.showerParticlesGroup) this.showerParticlesGroup.visible = false;
      }, 3500);
    }
  }

  createSink(x, y, z) {
    const sinkGroup = new THREE.Group();
    sinkGroup.position.set(x, y, z);

    // Badkamermeubel (wastafelkast)
    const cabinetGeo = new THREE.BoxGeometry(0.50, 0.72, 1.10);
    const cabinet = new THREE.Mesh(cabinetGeo, this.materials.woodFurniture);
    cabinet.position.set(0, 0.36, 0);
    cabinet.castShadow = true;
    sinkGroup.add(cabinet);

    // Handgrepen kast
    const handleGeo = new THREE.BoxGeometry(0.02, 0.12, 0.02);
    const h1 = new THREE.Mesh(handleGeo, this.materials.chrome);
    h1.position.set(-0.26, 0.45, -0.25);
    sinkGroup.add(h1);
    const h2 = new THREE.Mesh(handleGeo, this.materials.chrome);
    h2.position.set(-0.26, 0.45, 0.25);
    sinkGroup.add(h2);

    // Keramische wasbak
    const basinGeo = new THREE.BoxGeometry(0.46, 0.16, 0.85);
    const basin = new THREE.Mesh(basinGeo, this.materials.porcelain);
    basin.position.set(0, 0.80, 0);
    basin.castShadow = true;
    sinkGroup.add(basin);

    // Kraan (chromen mengkraan met gebogen uitloop)
    const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 8), this.materials.chrome);
    faucetBase.position.set(0.14, 0.95, 0);
    sinkGroup.add(faucetBase);

    const faucetSpout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.025), this.materials.chrome);
    faucetSpout.position.set(0.07, 1.01, 0);
    sinkGroup.add(faucetSpout);

    // Kraan waterstraal (geanimeerd)
    this.sinkWaterStream = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.18, 8), this.materials.waterMat);
    this.sinkWaterStream.position.set(0, 0.89, 0);
    this.sinkWaterStream.visible = false;
    sinkGroup.add(this.sinkWaterStream);

    // Grote spiegel boven wastafel aan de oostmuur (volledig vrij van z-fighting met wand en lijst)
    // De oostmuur bevindt zich op x = +0.18 ten opzichte van sinkGroup
    const mirrorFrameGeo = new THREE.BoxGeometry(0.02, 1.00, 0.90);
    const mirrorFrame = new THREE.Mesh(mirrorFrameGeo, this.materials.chrome);
    mirrorFrame.position.set(0.165, 1.55, 0);
    sinkGroup.add(mirrorFrame);

    const mirrorGeo = new THREE.BoxGeometry(0.01, 0.92, 0.82);
    const mirror = new THREE.Mesh(mirrorGeo, this.materials.mirrorMat);
    mirror.position.set(0.152, 1.55, 0);
    sinkGroup.add(mirror);

    // Zeeppompje
    const soapGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.10, 8);
    const soap = new THREE.Mesh(soapGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 }));
    soap.position.set(0.08, 0.93, 0.32);
    sinkGroup.add(soap);

    // Tandenborstelbeker met tandenborstels
    const cupGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.09, 8);
    const cup = new THREE.Mesh(cupGeo, new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 }));
    cup.position.set(0.08, 0.93, -0.32);
    sinkGroup.add(cup);

    this.scene.add(sinkGroup);

    // Collider voor wastafelmeubel
    this.colliders.push({
      minX: x - 0.30, maxX: x + 0.30,
      minY: y, maxY: y + 1.2,
      minZ: z - 0.60, maxZ: z + 0.60
    });

    // Interactieve marker voor de kraan
    const markerGeo = new THREE.RingGeometry(0.40, 0.60, 32);
    markerGeo.rotateX(-Math.PI / 2);
    this.sinkMarker = new THREE.Mesh(markerGeo, this.materials.glowMarker);
    this.sinkMarker.position.set(x - 0.75, y + 0.005, z);
    this.scene.add(this.sinkMarker);

    this.interactiveObjects.sink = {
      position: new THREE.Vector3(x - 0.75, y, z),
      radius: 1.5,
      active: false,
      onInteract: () => this.toggleSink()
    };
  }

  toggleSink() {
    const sink = this.interactiveObjects.sink;
    sink.active = !sink.active;
    this.sinkWaterStream.visible = sink.active;

    if (sink.active) {
      setTimeout(() => {
        sink.active = false;
        if (this.sinkWaterStream) this.sinkWaterStream.visible = false;
      }, 2500);
    }
  }

  // --- TRAP NAAR BENEDEN (VRIJ VAN Z-FIGHTING) ---
  createStairs() {
    const { xMin, xMax, zTop, zBottom, yTop, yBottom } = this.stairsConfig;
    const width = xMax - xMin;
    const length = zBottom - zTop;
    const height = yTop - yBottom;
    const stepCount = 13;
    const stepDepth = length / stepCount;
    const stepHeight = height / stepCount;
    const centerX = (xMin + xMax) / 2;

    const stairGroup = new THREE.Group();

    const treadThickness = 0.04;
    const riserThickness = 0.03;
    const riserHeight = stepHeight - treadThickness;

    for (let i = 0; i < stepCount; i++) {
      const topOfStepY = yTop - i * stepHeight;
      const stepZ = zTop + (i + 0.5) * stepDepth;

      // Houten trede plank bovenop (overhangt iets naar voren)
      const treadGeo = new THREE.BoxGeometry(width, treadThickness, stepDepth + 0.02);
      const treadMesh = new THREE.Mesh(treadGeo, this.materials.woodFurniture);
      treadMesh.position.set(centerX, topOfStepY - treadThickness / 2, stepZ);
      treadMesh.castShadow = true;
      treadMesh.receiveShadow = true;
      stairGroup.add(treadMesh);

      // Witte stootbord plint verticaal ONDER de trede (raakt exact de onderkant, 0 overlap!)
      const riserGeo = new THREE.BoxGeometry(width, riserHeight, riserThickness);
      const riserMesh = new THREE.Mesh(riserGeo, this.materials.wallLower);
      riserMesh.position.set(centerX, topOfStepY - treadThickness - riserHeight / 2, stepZ - stepDepth / 2 + riserThickness / 2);
      riserMesh.castShadow = true;
      stairGroup.add(riserMesh);

      this.cameraOccluders.push(treadMesh, riserMesh);
    }

    // Trapleuningen aan weerszijden
    this.createStairHandrail(xMax + 0.04, yBottom, yTop, zTop, zBottom, this.materials.brass, this.materials.metal);
    this.createStairHandrail(xMin - 0.04, yBottom, yTop, zTop, zBottom, this.materials.brass, this.materials.metal);

    this.scene.add(stairGroup);
  }

  createStairHandrail(x, yBot, yTop, zTop, zBot, railMat, postMat) {
    const railGroup = new THREE.Group();
    const length = Math.sqrt(Math.pow(zBot - zTop, 2) + Math.pow(yTop - yBot, 2));
    const angle = Math.atan2(yTop - yBot, zBot - zTop);

    // Schuine leuningbuis
    const railGeo = new THREE.CylinderGeometry(0.04, 0.04, length + 0.4, 8);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(x, (yTop + yBot) / 2 + 0.9, (zTop + zBot) / 2);
    rail.rotation.x = Math.PI / 2 + angle;
    railGroup.add(rail);

    // Spijlen
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const pZ = zTop + t * (zBot - zTop);
      const pY = yTop - t * (yTop - yBot);
      const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, pY + 0.45, pZ);
      railGroup.add(post);
    }

    this.scene.add(railGroup);

    this.colliders.push({
      minX: x - 0.18, maxX: x + 0.18,
      minY: yBot, maxY: yTop + 1.2,
      minZ: zTop, maxZ: zBot
    });
  }

  // --- BENEDENVERDIEPING ---
  createLowerFloor() {
    const y = this.LOWER_Y;

    // Vloer beneden: x: -8 tot 7, z: -4 tot 13.5
    const floorGeo = new THREE.BoxGeometry(15, 0.2, 17.5);
    const floor = new THREE.Mesh(floorGeo, this.materials.woodFloorLower);
    floor.position.set(-0.5, y - 0.1, 4.75);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.cameraOccluders.push(floor);

    // Rode gangloper (plane met polygonOffset om z-fighting volledig uit te sluiten)
    const runnerGeo = new THREE.PlaneGeometry(2.6, 9.5);
    runnerGeo.rotateX(-Math.PI / 2);
    const runner = new THREE.Mesh(runnerGeo, this.materials.rugRunner);
    runner.position.set(1.5, y + 0.002, 7.5);
    runner.receiveShadow = true;
    this.scene.add(runner);

    // Muren beneden (hoogte 3.35m, stoppen netjes 5cm onder de slaapkamervloerplaat)
    this.addWall(-0.5, y + 1.675, -4.0, 15.0, 3.35, 0.2, this.materials.wallLower);
    this.addWall(-0.5, y + 1.675, 13.5, 15.0, 3.35, 0.2, this.materials.wallLower);
    this.addWall(-8.0, y + 1.675, 4.75, 0.2, 3.35, 17.5, this.materials.wallLower);
    this.addWall(7.0, y + 1.675, 4.75, 0.2, 3.35, 17.5, this.materials.wallLower);

    // Voordeur beneden met deurmat
    this.createFrontDoor(1.5, y, 13.39);
    this.createCoatRack(-3.5, y, 13.0);
  }

  // --- DE KLEERKAST (HOLLE CONSTRUCTIE ZONDER INTERSECTIES) ---
  createWardrobe() {
    const x = -7.35;
    const y = this.LOWER_Y;
    const z = 7.5;

    const wardrobeGroup = new THREE.Group();
    wardrobeGroup.position.set(x, y, z);

    // Achterwand van de kast
    const backGeo = new THREE.BoxGeometry(0.04, 2.46, 2.16);
    const back = new THREE.Mesh(backGeo, this.materials.wardrobeInside);
    back.position.set(-0.42, 1.25, 0);
    wardrobeGroup.add(back);

    // Bovenkant kast
    const topGeo = new THREE.BoxGeometry(0.9, 0.04, 2.2);
    const top = new THREE.Mesh(topGeo, this.materials.wardrobeWood);
    top.position.set(0, 2.48, 0);
    wardrobeGroup.add(top);

    // Onderkant kast
    const bottomGeo = new THREE.BoxGeometry(0.9, 0.04, 2.2);
    const bottom = new THREE.Mesh(bottomGeo, this.materials.wardrobeWood);
    bottom.position.set(0, 0.02, 0);
    wardrobeGroup.add(bottom);

    // Linker zijwand
    const sideGeo = new THREE.BoxGeometry(0.9, 2.42, 0.04);
    const leftSide = new THREE.Mesh(sideGeo, this.materials.wardrobeWood);
    leftSide.position.set(0, 1.25, -1.08);
    leftSide.castShadow = true;
    wardrobeGroup.add(leftSide);

    // Rechter zijwand
    const rightSide = new THREE.Mesh(sideGeo, this.materials.wardrobeWood);
    rightSide.position.set(0, 1.25, 1.08);
    rightSide.castShadow = true;
    wardrobeGroup.add(rightSide);

    // Kledingrek stang binnenin
    const railGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.96, 8);
    const rail = new THREE.Mesh(railGeo, this.materials.metal);
    rail.rotation.x = Math.PI / 2;
    rail.position.set(0, 2.1, 0);
    wardrobeGroup.add(rail);

    // Hangende schoolkleren binnenin
    const shirtColors = [0x2563eb, 0xef4444, 0x10b981, 0xf59e0b];
    for (let i = 0; i < 4; i++) {
      const shirtGeo = new THREE.BoxGeometry(0.35, 0.8, 0.1);
      const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColors[i], roughness: 0.8 });
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.position.set(0, 1.6, -0.6 + i * 0.4);
      wardrobeGroup.add(shirt);
    }

    // Twee draaiende deuren aan de voorkant (x = 0.45)
    // Linker deur
    this.doorLeft = new THREE.Group();
    this.doorLeft.position.set(0.45, 1.25, -1.06);
    const doorPanelGeo = new THREE.BoxGeometry(0.04, 2.40, 1.05);
    const doorPanelLeft = new THREE.Mesh(doorPanelGeo, this.materials.wardrobeWood);
    doorPanelLeft.position.set(0, 0, 0.525);
    doorPanelLeft.castShadow = true;
    this.doorLeft.add(doorPanelLeft);

    const handleLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), this.materials.brass);
    handleLeft.position.set(0.04, 0, 0.95);
    this.doorLeft.add(handleLeft);
    wardrobeGroup.add(this.doorLeft);

    // Rechter deur
    this.doorRight = new THREE.Group();
    this.doorRight.position.set(0.45, 1.25, 1.06);
    const doorPanelRight = new THREE.Mesh(doorPanelGeo, this.materials.wardrobeWood);
    doorPanelRight.position.set(0, 0, -0.525);
    doorPanelRight.castShadow = true;
    this.doorRight.add(doorPanelRight);

    const handleRight = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), this.materials.brass);
    handleRight.position.set(0.04, 0, -0.95);
    this.doorRight.add(handleRight);
    wardrobeGroup.add(this.doorRight);

    this.scene.add(wardrobeGroup);

    // Kast camera occluder volume (onzichtbaar voor de ogen, detecteerbaar voor de camera)
    const wardrobeOccluder = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 2.5, 2.2),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    wardrobeOccluder.position.set(x, y + 1.25, z);
    this.scene.add(wardrobeOccluder);
    this.cameraOccluders.push(wardrobeOccluder);

    // Kast collider
    this.colliders.push({
      minX: x - 0.55, maxX: x + 0.55,
      minY: y, maxY: y + 2.6,
      minZ: z - 1.15, maxZ: z + 1.15
    });

    // Interactieve markering op de vloer
    const markerGeo = new THREE.RingGeometry(0.6, 0.85, 32);
    markerGeo.rotateX(-Math.PI / 2);
    this.wardrobeMarker = new THREE.Mesh(markerGeo, this.materials.glowMarker);
    this.wardrobeMarker.position.set(x + 1.6, y + 0.004, z);
    this.scene.add(this.wardrobeMarker);

    // Zwevende 3D pijl
    const arrowGeo = new THREE.ConeGeometry(0.25, 0.5, 16);
    arrowGeo.rotateX(Math.PI);
    this.wardrobeArrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({
      color: 0xffeb3b,
      emissive: 0xffc107,
      emissiveIntensity: 0.6
    }));
    this.wardrobeArrow.position.set(x + 1.6, y + 1.6, z);
    this.scene.add(this.wardrobeArrow);

    this.interactiveObjects.wardrobe = {
      position: new THREE.Vector3(x + 1.6, y, z),
      radius: 2.2,
      opened: false,
      onInteract: () => this.openWardrobe()
    };
  }

  openWardrobe() {
    if (this.interactiveObjects.wardrobe.opened) return;
    this.interactiveObjects.wardrobe.opened = true;

    this.wardrobeArrow.visible = false;
    this.wardrobeMarker.visible = false;

    this.animatedObjects.push({
      update: (dt) => {
        if (this.doorLeft.rotation.y > -Math.PI * 0.65) {
          this.doorLeft.rotation.y -= dt * 2.5;
        }
        if (this.doorRight.rotation.y < Math.PI * 0.65) {
          this.doorRight.rotation.y += dt * 2.5;
        }
      }
    });
  }

  // --- HULP ELEMENTEN (BED, WEKKER, BUREAU, DECORATIES) ---
  createBed(x, y, z) {
    const bed = new THREE.Group();
    bed.position.set(x, y, z);

    // Houten frame
    const frameGeo = new THREE.BoxGeometry(2.3, 0.35, 1.5);
    const frame = new THREE.Mesh(frameGeo, this.materials.bedFrame);
    frame.position.set(0, 0.175, 0);
    frame.castShadow = true;
    bed.add(frame);

    // Hoofdbord
    const headboardGeo = new THREE.BoxGeometry(0.18, 1.2, 1.5);
    const headboard = new THREE.Mesh(headboardGeo, this.materials.bedFrame);
    headboard.position.set(-1.06, 0.6, 0);
    headboard.castShadow = true;
    bed.add(headboard);

    // Matras (ligt direct op het frame op y = 0.35 + 0.11 = 0.46)
    const matGeo = new THREE.BoxGeometry(2.1, 0.22, 1.35);
    const mattress = new THREE.Mesh(matGeo, this.materials.mattress);
    mattress.position.set(0.04, 0.46, 0);
    bed.add(mattress);

    // Kussen (ligt op het matras)
    const pilGeo = new THREE.BoxGeometry(0.5, 0.12, 0.9);
    const pillow = new THREE.Mesh(pilGeo, this.materials.pillow);
    pillow.position.set(-0.7, 0.63, 0);
    pillow.castShadow = true;
    bed.add(pillow);

    // Deken
    const blanketGeo = new THREE.BoxGeometry(1.3, 0.12, 1.38);
    this.blanketMesh = new THREE.Mesh(blanketGeo, this.materials.blanket);
    this.blanketMesh.position.set(0.35, 0.58, 0);
    this.blanketMesh.castShadow = true;
    bed.add(this.blanketMesh);

    this.scene.add(bed);

    this.colliders.push({
      minX: x - 1.2, maxX: x + 1.2,
      minY: y, maxY: y + 1.4,
      minZ: z - 0.8, maxZ: z + 0.8
    });
  }

  uncoverBed() {
    if (!this.blanketMesh) return;
    const startX = this.blanketMesh.position.x;
    const startTime = performance.now();
    const animate = () => {
      const p = Math.min((performance.now() - startTime) / 800, 1.0);
      this.blanketMesh.position.x = startX + p * 0.5;
      this.blanketMesh.scale.x = 1.0 - p * 0.4;
      if (p < 1.0) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  coverBed() {
    if (!this.blanketMesh) return;
    this.blanketMesh.position.set(0.35, 0.58, 0);
    this.blanketMesh.scale.set(1, 1, 1);
  }

  createNightstandWithAlarm(x, y, z) {
    const stand = new THREE.Group();
    stand.position.set(x, y, z);

    // Nachtkastje
    const standGeo = new THREE.BoxGeometry(0.7, 0.65, 0.7);
    const standMesh = new THREE.Mesh(standGeo, this.materials.woodFurniture);
    standMesh.position.set(0, 0.325, 0);
    standMesh.castShadow = true;
    stand.add(standMesh);

    // Wekker bovenop (y = 0.65 + 0.09)
    const clockGeo = new THREE.BoxGeometry(0.24, 0.18, 0.12);
    this.alarmClockMesh = new THREE.Mesh(clockGeo, this.materials.alarmClock);
    this.alarmClockMesh.position.set(0, 0.74, 0);
    this.alarmClockMesh.castShadow = true;
    stand.add(this.alarmClockMesh);

    // Gouden belletjes
    const bellGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const bell1 = new THREE.Mesh(bellGeo, this.materials.brass);
    bell1.position.set(-0.08, 0.87, 0);
    stand.add(bell1);

    const bell2 = new THREE.Mesh(bellGeo, this.materials.brass);
    bell2.position.set(0.08, 0.87, 0);
    stand.add(bell2);

    this.scene.add(stand);

    this.colliders.push({
      minX: x - 0.4, maxX: x + 0.4,
      minY: y, maxY: y + 0.8,
      minZ: z - 0.4, maxZ: z + 0.4
    });
  }

  createDesk(x, y, z) {
    const desk = new THREE.Group();
    desk.position.set(x, y, z);

    const topGeo = new THREE.BoxGeometry(1.4, 0.08, 0.8);
    const top = new THREE.Mesh(topGeo, this.materials.woodFurniture);
    top.position.set(0, 0.75, 0);
    top.castShadow = true;
    desk.add(top);

    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75);
    const offsets = [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]];
    offsets.forEach(([dx, dz]) => {
      const leg = new THREE.Mesh(legGeo, this.materials.metal);
      leg.position.set(dx, 0.375, dz);
      desk.add(leg);
    });

    const bookColors = [0xef4444, 0x3b82f6, 0x10b981];
    bookColors.forEach((col, idx) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.22), new THREE.MeshStandardMaterial({ color: col }));
      book.position.set(-0.35, 0.81 + idx * 0.045, 0.1);
      desk.add(book);
    });

    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), this.materials.rugBedroom);
    chairSeat.position.set(0, 0.45, 0.7);
    desk.add(chairSeat);

    this.scene.add(desk);

    this.colliders.push({
      minX: x - 0.8, maxX: x + 0.8,
      minY: y, maxY: y + 0.9,
      minZ: z - 0.5, maxZ: z + 0.9
    });
  }

  createWindow(x, y, z, w, h) {
    const frameGeo = new THREE.BoxGeometry(w, h, 0.08);
    const frame = new THREE.Mesh(frameGeo, this.materials.bedFrame);
    frame.position.set(x, y, z);
    this.scene.add(frame);

    const glassGeo = new THREE.PlaneGeometry(w - 0.15, h - 0.15);
    const glass = new THREE.Mesh(glassGeo, this.materials.glass);
    glass.position.set(x, y, z + 0.042);
    this.scene.add(glass);
  }

  createFrontDoor(x, y, z) {
    const doorGeo = new THREE.BoxGeometry(1.6, 2.6, 0.08);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(x, y + 1.3, z);
    door.castShadow = true;
    this.scene.add(door);

    // Deurmat (plane met polygonOffset)
    const matGeo = new THREE.PlaneGeometry(1.4, 0.8);
    matGeo.rotateX(-Math.PI / 2);
    const mat = new THREE.Mesh(matGeo, this.materials.doormatMat);
    mat.position.set(x, y + 0.002, z - 0.6);
    mat.receiveShadow = true;
    this.scene.add(mat);
  }

  createCoatRack(x, y, z) {
    const rack = new THREE.Group();
    rack.position.set(x, y, z);

    const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.0, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.bedFrame);
    pole.position.set(0, 1.0, 0);
    rack.add(pole);

    const baseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 16);
    const base = new THREE.Mesh(baseGeo, this.materials.bedFrame);
    base.position.set(0, 0.03, 0);
    rack.add(base);

    const bagGeo = new THREE.BoxGeometry(0.35, 0.45, 0.25);
    const bagMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.7 });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.set(0.18, 1.25, 0);
    rack.add(bag);

    this.scene.add(rack);

    this.colliders.push({
      minX: x - 0.4, maxX: x + 0.4,
      minY: y, maxY: y + 2.0,
      minZ: z - 0.4, maxZ: z + 0.4
    });
  }

  createDecorations() {
    const plant = new THREE.Group();
    plant.position.set(5.5, this.LOWER_Y, 2.5);

    const potGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.6, 16);
    const pot = new THREE.Mesh(potGeo, this.materials.potColor);
    pot.position.set(0, 0.3, 0);
    pot.castShadow = true;
    plant.add(pot);

    for (let i = 0; i < 6; i++) {
      const leafGeo = new THREE.SphereGeometry(0.35, 8, 8);
      leafGeo.scale(1, 0.2, 1.8);
      const leaf = new THREE.Mesh(leafGeo, this.materials.leafGreen);
      leaf.position.set(0, 0.65, 0);
      leaf.rotation.y = (i * Math.PI) / 3;
      leaf.rotation.x = 0.4;
      plant.add(leaf);
    }
    this.scene.add(plant);

    this.colliders.push({
      minX: 5.1, maxX: 5.9,
      minY: this.LOWER_Y, maxY: this.LOWER_Y + 1.2,
      minZ: 2.1, maxZ: 2.9
    });

    // Posters aan de muur met polygonOffset
    const poster1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), this.materials.posterColor1);
    poster1.position.set(-1.8, this.UPPER_Y + 1.8, -7.89);
    this.scene.add(poster1);

    const poster2 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.4), this.materials.posterColor2);
    poster2.position.set(-7.89, this.UPPER_Y + 1.8, -4.5);
    poster2.rotation.y = Math.PI / 2;
    this.scene.add(poster2);
  }

  addWall(x, y, z, w, h, d, material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(geo, material);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);

    this.colliders.push({
      minX: x - w / 2, maxX: x + w / 2,
      minY: y - h / 2, maxY: y + h / 2,
      minZ: z - d / 2, maxZ: z + d / 2
    });

    this.cameraOccluders.push(wall);
  }

  addBalustrade(x, yBase, z, w, h, d) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const balustrade = new THREE.Mesh(geo, this.materials.bedFrame);
    balustrade.position.set(x, yBase + h / 2, z);
    balustrade.castShadow = true;
    this.scene.add(balustrade);

    this.colliders.push({
      minX: x - w / 2, maxX: x + w / 2,
      minY: yBase, maxY: yBase + h,
      minZ: z - d / 2, maxZ: z + d / 2
    });

    this.cameraOccluders.push(balustrade);
  }

  getCameraOccluders() {
    return this.cameraOccluders;
  }

  getGroundHeightAt(x, z) {
    const s = this.stairsConfig;

    if (x >= s.xMin && x <= s.xMax && z >= s.zTop && z <= s.zBottom) {
      const progress = (z - s.zTop) / (s.zBottom - s.zTop);
      return s.yTop - progress * (s.yTop - s.yBottom);
    }

    const isUpper = (x < s.xMin || z < s.zTop) && (x >= -8.2 && x <= 6.2 && z >= -8.2 && z <= 1.8);
    if (isUpper) {
      return this.UPPER_Y;
    }

    return this.LOWER_Y;
  }

  isOnStairs(x, z) {
    const s = this.stairsConfig;
    return x >= s.xMin && x <= s.xMax && z >= s.zTop && z <= s.zBottom;
  }

  checkCollision(newX, newZ, radius = 0.35, playerY = 0) {
    const playerFeet = playerY + 0.15;
    const playerHead = playerY + 1.35;
    for (const box of this.colliders) {
      if (playerFeet <= box.maxY && playerHead >= box.minY) {
        if (
          newX + radius > box.minX &&
          newX - radius < box.maxX &&
          newZ + radius > box.minZ &&
          newZ - radius < box.maxZ
        ) {
          return true;
        }
      }
    }
    return false;
  }

  update(dt, elapsed) {
    for (const anim of this.animatedObjects) {
      anim.update(dt, elapsed);
    }

    if (this.wardrobeArrow && this.wardrobeArrow.visible) {
      this.wardrobeArrow.position.y = this.LOWER_Y + 1.6 + Math.sin(elapsed * 4) * 0.15;
      this.wardrobeArrow.rotation.y += dt * 1.8;
    }

    if (this.toiletArrow && this.toiletArrow.visible) {
      this.toiletArrow.position.y = this.UPPER_Y + 1.45 + Math.sin(elapsed * 4.5) * 0.12;
      this.toiletArrow.rotation.y += dt * 2.0;
    }

    if (this.showerParticlesGroup && this.showerParticlesGroup.visible) {
      for (const drop of this.showerParticlesGroup.children) {
        drop.position.y -= dt * 3.2;
        if (drop.position.y < -1.8) {
          drop.position.y = 0;
        }
      }
    }

    if (this.alarmClockMesh) {
      if (this.interactiveObjects.alarmRinging) {
        this.alarmClockMesh.position.x = Math.sin(elapsed * 40) * 0.02;
        this.alarmClockMesh.rotation.z = Math.sin(elapsed * 35) * 0.08;
      }
    }
  }
}
