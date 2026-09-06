import * as THREE from 'three';

export class GameWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
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
    for (const box of this.colliders) {
      if (playerY + 0.1 >= box.minY && playerY + 0.5 <= box.maxY + 0.8) {
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

    if (this.alarmClockMesh) {
      if (this.interactiveObjects.alarmRinging) {
        this.alarmClockMesh.position.x = Math.sin(elapsed * 40) * 0.02;
        this.alarmClockMesh.rotation.z = Math.sin(elapsed * 35) * 0.08;
      }
    }
  }
}
