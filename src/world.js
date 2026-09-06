import * as THREE from 'three';

export class GameWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.cameraOccluders = [];
    this.interactiveObjects = {};
    this.animatedObjects = [];
    this.speurtochtItems = {};

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
      glass: new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.22,
        roughness: 0.05,
        metalness: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      windowFrame: new THREE.MeshStandardMaterial({ color: 0x242e38, roughness: 0.45 }),
      windowSill: new THREE.MeshStandardMaterial({ color: 0x3d4852, roughness: 0.35 }),
      roofGlass: new THREE.MeshStandardMaterial({
        color: 0xcfe7f7,
        transparent: true,
        opacity: 0.25,
        roughness: 0.08,
        metalness: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      roofBeam: new THREE.MeshStandardMaterial({ color: 0x2a343d, roughness: 0.5 }),
      roofGutter: new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.35 }),
      leafGreen: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 }),
      potColor: new THREE.MeshStandardMaterial({ color: 0xd27d53, roughness: 0.7 }),
      alarmClock: new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.4 }),

      // Bureaustoel materialen
      chairDarkFrame: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.5 }),
      chairChrome: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 }),
      chairCushion: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.55, metalness: 0.08 }),
      chairAccent: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.15 }),
      chairPad: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75 }),

      // Keuken materialen
      kitchenCounter: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }),
      kitchenTop: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 }),
      kitchenFloor: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.6,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      fridgeMat: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.35, roughness: 0.3 }),
      stoveMat: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }),

      // Speurtocht & Schoolspullen materialen
      itemGold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 }),
      itemBookCover: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }),
      itemPages: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 }),
      itemBottle: new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.15 }),
      itemLunchbox: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 }),
      itemPencilCase: new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.5 }),
      itemPencilLead: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 }),
      itemAccentRed: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }),
      backpackDeskMat: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 }),
      backpackPocketMat: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 }),

      // Buiten, Auto en School materialen
      grass: new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 }),
      gardenPavement: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 }),
      drivewayAsphalt: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 }),
      roadAsphalt: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }),
      roadMarking: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
      sidewalkMat: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.7 }),
      fenceWood: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }),
      treeLeaves: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 }),
      treeLeaves2: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 }),
      carPaint: new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.45, roughness: 0.25 }),
      carGlass: new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.6, roughness: 0.1 }),
      carTire: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }),
      carRim: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.85, roughness: 0.2 }),
      carHeadlight: new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.7 }),
      carTaillight: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6 }),
      schoolBrick: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }),
      schoolWallInterior: new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 }),
      schoolFloorCheck: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 }),
      schoolDoorMat: new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.4 }),
      lockerYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.3, roughness: 0.4 }),
      lockerBlue: new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.3, roughness: 0.4 }),
      lockerGreen: new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.3, roughness: 0.4 }),
      lockerPink: new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.3, roughness: 0.4 }),
      lockerInside: new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, roughness: 0.5 }),

      // Woonkamer & Eethoek materialen
      sofaFabric: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }), // Stijlvol warm leisteen/antraciet textiel
      sofaCushionYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.75 }), // Warm mosterdgeel sierkussen
      sofaCushionTeal: new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.75 }), // Fris cyaan/teal sierkussen
      sofaWoodLegs: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 }),
      coffeeTableWood: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 }), // Warm eiken salontafelblad
      coffeeTableLegs: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 }), // Zwart staal
      livingRug: new THREE.MeshStandardMaterial({
        color: 0xeeece8,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      }),
      livingRugBorder: new THREE.MeshStandardMaterial({
        color: 0xd6d3d1,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3
      }),
      tvStandWood: new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.45 }), // Donker modern tv-meubel
      tvFrame: new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.6, roughness: 0.2 }),
      tvScreen: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.18,
        roughness: 0.15,
        metalness: 0.2
      }),
      soundbarMat: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35, metalness: 0.4 }),
      consoleMat: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 }),
      lampBrass: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 }),
      lampShadeWarm: new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfef08a,
        emissiveIntensity: 0.4,
        roughness: 0.6
      }),
      diningTableWood: new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.4 }), // Massief eiken
      diningChairSeat: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }),
      diningChairLegs: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 }),
      fruitBowlMat: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }),
      fruitApple: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }),
      fruitBanana: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }),
      cupMat: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25 }),
      magazineMat: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 })
    };
  }

  buildWorld() {
    this.createLights();
    this.createUpperFloor();
    this.createStairs();
    this.createLowerFloor();
    this.createKitchen();
    this.createLivingRoom();
    this.createBathroom();
    this.createWardrobe();
    this.createDecorations();
    this.createSchoolBag(-6.6, this.UPPER_Y, -1.0);
    this.createSpeurtochtItems();
    this.createRoof();
    this.createOutdoorEnvironment();
    this.createCar();
    this.createSchoolAndLockers();
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.8);
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

    // Buitenverlichting en schoolverlichting
    const outdoorLight = new THREE.DirectionalLight(0xfffbeb, 0.95);
    outdoorLight.position.set(12, 22, 55);
    this.scene.add(outdoorLight);

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
    // Noordwand slaapkamer met een royale raamopening (x: -5.4 tot -2.6, y: y+0.8 tot y+2.4)
    this.addWall(-6.7, y + 1.55, -8.0, 2.6, 3.1, 0.2, this.materials.wallUpper); // Links van raam
    this.addWall(-1.3, y + 1.55, -8.0, 2.6, 3.1, 0.2, this.materials.wallUpper); // Rechts van raam
    this.addWall(-4.0, y + 0.4, -8.0, 2.8, 0.8, 0.2, this.materials.wallUpper);  // Onder raam (borstwering)
    this.addWall(-4.0, y + 2.75, -8.0, 2.8, 0.7, 0.2, this.materials.wallUpper); // Boven raam

    // Linkerwand slaapkamer (West, x = -8.0) met een zijraam voor natuurlijk avondlicht (z: -3.9 tot -2.1)
    this.addWall(-8.0, y + 1.55, -5.9, 0.2, 3.1, 4.0, this.materials.wallUpper);  // Noordelijk muurdeel
    this.addWall(-8.0, y + 1.55, -0.35, 0.2, 3.1, 3.5, this.materials.wallUpper); // Zuidelijk muurdeel
    this.addWall(-8.0, y + 0.45, -3.0, 0.2, 0.9, 1.8, this.materials.wallUpper);  // Onder raam (borstwering)
    this.addWall(-8.0, y + 2.7, -3.0, 0.2, 0.8, 1.8, this.materials.wallUpper);   // Boven raam
    this.createWindow(-8.0, y + 1.6, -3.0, 1.8, 1.4, 'x'); // Slaapkamer westraam

    // Voorwand slaapkamer (Zuid)
    this.addWall(-4, y + 1.55, 1.5, 8.0, 3.1, 0.2, this.materials.wallUpper);

    // Tussenwand slaapkamer/gang met deuropening bij z = -2.6 tot -0.9
    // Noordelijk deel: van z = -7.9 tot z = -2.6
    this.addWall(0, y + 1.55, -5.25, 0.2, 3.1, 5.3, this.materials.wallUpper);
    // Bovenkant deurpost: sluit exact aan van z = -2.60 tot z = -0.90 (d = 1.7m), hoogte 0.9m van y+2.20 tot y+3.10
    this.addWall(0, y + 2.65, -1.75, 0.2, 0.9, 1.7, this.materials.wallUpper);
    // Zuidelijk deel: van z = -0.9 tot z = 1.4
    this.addWall(0, y + 1.55, 0.25, 0.2, 3.1, 2.3, this.materials.wallUpper);

    // Noordwand overloop en gang met open raam
    this.addWall(0.15, y + 1.55, -8.0, 0.3, 3.1, 0.2, this.materials.wallUpper); // Links van raam
    this.addWall(2.05, y + 1.55, -8.0, 0.3, 3.1, 0.2, this.materials.wallUpper); // Rechts van raam
    this.addWall(1.1, y + 0.45, -8.0, 1.6, 0.9, 0.2, this.materials.wallUpper);  // Onder raam
    this.addWall(1.1, y + 2.7, -8.0, 1.6, 0.8, 0.2, this.materials.wallUpper);   // Boven raam
    this.createWindow(1.1, y + 1.6, -8.0, 1.6, 1.4, 'z');

    // Noordwand badkamer (x: 2.2 tot 6.0) met raamopening boven het toilet (x: 2.9 tot 4.3)
    this.addWall(2.55, y + 1.55, -8.0, 0.7, 3.1, 0.2, this.materials.wallUpper); // Links van badkamerraam
    this.addWall(5.15, y + 1.55, -8.0, 1.7, 3.1, 0.2, this.materials.wallUpper); // Rechts van badkamerraam
    this.addWall(3.6, y + 0.5, -8.0, 1.4, 1.0, 0.2, this.materials.wallUpper);   // Onder badkamerraam
    this.addWall(3.6, y + 2.65, -8.0, 1.4, 0.9, 0.2, this.materials.wallUpper);  // Boven badkamerraam

    // Oostwand overloop
    this.addWall(6.0, y + 1.5, -4.25, 0.2, 3.1, 7.5, this.materials.wallUpper);

    // Hekwerk / Balustrade alleen op de bovenverdieping randen (geen overlap met trapleuning!)
    // Zuidrand overloop bij z = 1.5 (x: 0 tot 2.2)
    this.addBalustrade(1.1, y, 1.45, 2.2, 1.0, 0.08);
    // Noordrand trapgat rechts van trap (x: 4.8 tot 6.0 bij z = -0.5)
    this.addBalustrade(5.4, y, -0.5, 1.2, 1.0, 0.08);

    // Slaapkamer noordraam (met uitzicht over de achtertuin en lucht)
    this.createWindow(-4, y + 1.6, -8.0, 2.8, 1.6, 'z');

    // Meubels
    this.createBed(-5.8, y, -5.5);
    this.createNightstandWithAlarm(-3.8, y, -6.8);
    this.createDesk(-6.6, y, -1.0);
    this.createBookcase(-0.25, y, -4.5);
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
    // Noordelijk muurdeel: van z = -8.0 tot z = -2.8 (lengte 5.2m, top y+3.10)
    this.addWall(2.2, y + 1.55, -5.4, 0.2, 3.1, 5.2, this.materials.bathroomTileWall);

    // Brede, open doorgang direct tegenover de slaapkamerdeur: z = -2.8 tot z = -0.8 (breedte 2.0 meter!)
    // Bovenkant deurpost boven de doorgang (sluit naadloos aan van z = -2.80 tot z = -0.80, top y+3.10)
    this.addWall(2.2, y + 2.65, -1.8, 0.2, 0.9, 2.0, this.materials.bathroomTileWall);

    // Zuidelijk hoekpaaltje naast de trap: van z = -0.8 tot z = -0.5 (lengte 0.3m, top y+3.10)
    this.addWall(2.2, y + 1.55, -0.65, 0.2, 3.1, 0.3, this.materials.bathroomTileWall);

    // Deurbordje "🚻 BADKAMER" boven de open ingang, gericht naar de gang en slaapkamer (-X)
    this.createBathroomSign(2.09, y + 2.35, -1.8);

    // Badkamerraam aan de noordwand met echt doorkijkglas boven het toilet
    this.createWindow(3.6, y + 1.6, -8.0, 1.4, 1.2, 'z');

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

      // Dichte onderbouw onder elke trede tot aan de begane grond (sluit de hele ruimte onder de trap hermetisch af)
      const underHeight = topOfStepY - treadThickness;
      if (underHeight > 0.04) {
        const underGeo = new THREE.BoxGeometry(width, underHeight, stepDepth + 0.005);
        const underMesh = new THREE.Mesh(underGeo, this.materials.wallLower);
        underMesh.position.set(centerX, underHeight / 2, stepZ);
        underMesh.castShadow = true;
        underMesh.receiveShadow = true;
        stairGroup.add(underMesh);
        this.cameraOccluders.push(underMesh);
      }

      this.cameraOccluders.push(treadMesh, riserMesh);
    }

    // Dichte muren rondom en achter het stuk onder de trap (volledig afgesloten met muren)
    // 1. Achterwand direct achter de trap (z = -0.75) over de volle breedte tot aan de oostwand
    this.addWall(4.55, yBottom + 1.675, -0.75, 4.9, 3.35, 0.2, this.materials.wallLower);

    // 2. Westwand van de holte achter de trap (van z = -4.0 tot z = -0.65 bij x = 2.12)
    this.addWall(xMin - 0.08, yBottom + 1.675, -2.35, 0.16, 3.35, 3.3, this.materials.wallLower);

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
    // 1. Noordwand beneden (z = -4.0, x: -8.0 tot 7.0) met raamopening voor de keuken (x: -5.6 tot -4.0)
    this.addWall(-6.8, y + 1.675, -4.0, 2.4, 3.35, 0.2, this.materials.wallLower);  // Links van keukenraam
    this.addWall(-4.8, y + 0.65, -4.0, 1.6, 1.3, 0.2, this.materials.wallLower);   // Onder keukenraam
    this.addWall(-4.8, y + 2.825, -4.0, 1.6, 1.05, 0.2, this.materials.wallLower); // Boven keukenraam
    this.addWall(1.5, y + 1.675, -4.0, 11.0, 3.35, 0.2, this.materials.wallLower);  // Rechts van keukenraam tot oostwand

    // 2. Zuidwand beneden met voordeur en groot panoramisch voorraam op de oprit/tuin
    this.addWall(-3.65, y + 1.675, 13.5, 8.7, 3.35, 0.2, this.materials.wallLower); // Links van voordeur
    this.addWall(1.5, y + 2.975, 13.5, 1.6, 0.75, 0.2, this.materials.wallLower);   // Boven voordeur
    // Rechts van voordeur: voorraam (x: 3.45 tot 5.85) met direct zicht op de geparkeerde auto en oprit
    this.addWall(2.875, y + 1.675, 13.5, 1.15, 3.35, 0.2, this.materials.wallLower); // Tussen deur en voorraam
    this.addWall(4.65, y + 0.4, 13.5, 2.4, 0.8, 0.2, this.materials.wallLower);      // Onder voorraam
    this.addWall(4.65, y + 2.875, 13.5, 2.4, 0.95, 0.2, this.materials.wallLower);   // Boven voorraam
    this.addWall(6.425, y + 1.675, 13.5, 1.15, 3.35, 0.2, this.materials.wallLower); // Rechts van voorraam
    this.createWindow(4.65, y + 1.6, 13.5, 2.4, 1.6, 'z'); // Zuidelijk voorraam beneden

    // 3. Westwand beneden (x = -8.0, z: -4.0 tot 13.5) met zijraam bij de eethoek (z: 1.5 tot 3.3)
    this.addWall(-8.0, y + 1.675, -1.25, 0.2, 3.35, 5.5, this.materials.wallLower); // Noordelijk muurdeel
    this.addWall(-8.0, y + 0.45, 2.4, 0.2, 0.9, 1.8, this.materials.wallLower);     // Onder zijraam eethoek
    this.addWall(-8.0, y + 2.825, 2.4, 0.2, 1.05, 1.8, this.materials.wallLower);   // Boven zijraam eethoek
    this.addWall(-8.0, y + 1.675, 8.4, 0.2, 3.35, 10.2, this.materials.wallLower);  // Zuidelijk muurdeel
    this.createWindow(-8.0, y + 1.6, 2.4, 1.8, 1.4, 'x'); // Westelijk zijraam eethoek

    // 4. Oostwand beneden (x = 7.0, z: -4.0 tot 13.5) met groot ostraam in de living (z: 3.5 tot 5.7)
    this.addWall(7.0, y + 1.675, -0.25, 0.2, 3.35, 7.5, this.materials.wallLower); // Noordelijk muurdeel
    this.addWall(7.0, y + 0.4, 4.6, 0.2, 0.8, 2.2, this.materials.wallLower);      // Onder ostraam
    this.addWall(7.0, y + 2.875, 4.6, 0.2, 0.95, 2.2, this.materials.wallLower);   // Boven ostraam
    this.addWall(7.0, y + 1.675, 9.6, 0.2, 3.35, 7.8, this.materials.wallLower);   // Zuidelijk muurdeel
    this.createWindow(7.0, y + 1.6, 4.6, 2.2, 1.6, 'x'); // Oostelijk zijraam living

    // Voordeur beneden met deurmat
    this.createFrontDoor(1.5, y, 13.39);
    this.createCoatRack(-3.5, y, 13.0);
  }

  // --- DE KEUKEN BENEDEN ---
  createKitchen() {
    const y = this.LOWER_Y;

    // 1. Keukenvloer tegelzone (x: -7.9 tot -1.5, z: -3.9 tot 1.2)
    const tileGeo = new THREE.PlaneGeometry(6.4, 5.1);
    tileGeo.rotateX(-Math.PI / 2);
    const kitchenTile = new THREE.Mesh(tileGeo, this.materials.kitchenFloor);
    kitchenTile.position.set(-4.7, y + 0.003, -1.35);
    kitchenTile.receiveShadow = true;
    this.scene.add(kitchenTile);

    // 2. Keukenblok / Aanrecht langs de noordwand (x: -6.5 tot -2.5 bij z = -3.5)
    // Onderkasten
    const counterBaseGeo = new THREE.BoxGeometry(4.0, 0.86, 0.8);
    const counterBase = new THREE.Mesh(counterBaseGeo, this.materials.kitchenCounter);
    counterBase.position.set(-4.5, y + 0.43, -3.5);
    counterBase.castShadow = true;
    counterBase.receiveShadow = true;
    this.scene.add(counterBase);

    // Aanrechtblad (gepolijst composiet / wit marmer)
    const counterTopGeo = new THREE.BoxGeometry(4.06, 0.05, 0.86);
    const counterTop = new THREE.Mesh(counterTopGeo, this.materials.kitchenTop);
    counterTop.position.set(-4.5, y + 0.885, -3.5);
    counterTop.castShadow = true;
    counterTop.receiveShadow = true;
    this.scene.add(counterTop);

    // RVS Spoelbak (x = -4.8, z = -3.45)
    const sinkGeo = new THREE.BoxGeometry(0.7, 0.02, 0.5);
    const sink = new THREE.Mesh(sinkGeo, this.materials.metal);
    sink.position.set(-4.8, y + 0.912, -3.45);
    this.scene.add(sink);

    const sinkInnerGeo = new THREE.BoxGeometry(0.6, 0.03, 0.4);
    const sinkInner = new THREE.Mesh(sinkInnerGeo, this.materials.kitchenCounter);
    sinkInner.position.set(-4.8, y + 0.91, -3.45);
    this.scene.add(sinkInner);

    // Chromen Keukenkraan met elegante boog
    const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 12), this.materials.chrome);
    faucetBase.position.set(-4.8, y + 1.02, -3.65);
    this.scene.add(faucetBase);

    const faucetSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 12), this.materials.chrome);
    faucetSpout.rotation.x = Math.PI / 3;
    faucetSpout.position.set(-4.8, y + 1.16, -3.58);
    this.scene.add(faucetSpout);

    // Inductiekookplaat (x = -3.1, z = -3.45)
    const stoveGeo = new THREE.BoxGeometry(0.8, 0.02, 0.55);
    const stove = new THREE.Mesh(stoveGeo, this.materials.stoveMat);
    stove.position.set(-3.1, y + 0.912, -3.45);
    this.scene.add(stove);

    // Kookzones (4 ringen)
    const ringOffsets = [
      { x: -0.22, z: -0.13 }, { x: 0.22, z: -0.13 },
      { x: -0.22, z: 0.13 }, { x: 0.22, z: 0.13 }
    ];
    for (const ro of ringOffsets) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.09, 16), this.materials.kitchenTop);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(-3.1 + ro.x, y + 0.924, -3.45 + ro.z);
      this.scene.add(ring);
    }

    // Afzuigkap boven het fornuis
    const hoodGeo = new THREE.BoxGeometry(0.9, 0.15, 0.5);
    const hood = new THREE.Mesh(hoodGeo, this.materials.metal);
    hood.position.set(-3.1, y + 2.1, -3.55);
    hood.castShadow = true;
    this.scene.add(hood);

    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 12);
    const pipe = new THREE.Mesh(pipeGeo, this.materials.metal);
    pipe.position.set(-3.1, y + 2.5, -3.55);
    this.scene.add(pipe);

    // 3. Koelkast in de hoek (x = -7.3, z = -3.35)
    const fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(-7.3, y, -3.35);

    const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.15, 0.8), this.materials.fridgeMat);
    fridgeBody.position.set(0, 1.075, 0);
    fridgeBody.castShadow = true;
    fridgeGroup.add(fridgeBody);

    // Handgrepen koelkast
    const handleFridge1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), this.materials.chrome);
    handleFridge1.position.set(0.35, 1.35, 0.42);
    fridgeGroup.add(handleFridge1);

    const handleFridge2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), this.materials.chrome);
    handleFridge2.position.set(0.35, 0.65, 0.42);
    fridgeGroup.add(handleFridge2);

    this.scene.add(fridgeGroup);

    // 4. Bovenkastjes aan de noordmuur (naast de koelkast, links van het raam)
    const upperCabGeo = new THREE.BoxGeometry(1.2, 0.7, 0.35);
    const upperCab = new THREE.Mesh(upperCabGeo, this.materials.kitchenCounter);
    upperCab.position.set(-6.1, y + 2.1, -3.75);
    upperCab.castShadow = true;
    this.scene.add(upperCab);

    // 5. Keukenraam direct boven de spoelbak (met echt doorkijkglas naar de achtertuin)
    this.createWindow(-4.8, y + 1.8, -4.0, 1.6, 1.0, 'z');

    // 6. Colliders voor de keuken
    // Koelkast collider
    this.colliders.push({
      minX: -7.75, maxX: -6.85,
      minY: y, maxY: y + 2.2,
      minZ: -3.8, maxZ: -2.9
    });

    // Aanrecht collider
    this.colliders.push({
      minX: -6.55, maxX: -2.45,
      minY: y, maxY: y + 1.0,
      minZ: -3.95, maxZ: -3.05
    });

    this.cameraOccluders.push(counterBase, fridgeBody);
  }

  // --- DE WOONKAMER & EETHOEK BENEDEN ---
  createLivingRoom() {
    const y = this.LOWER_Y;

    // ==========================================
    // 1. ZITHOEK (LIVING ROOM LOUNGE)
    // ==========================================

    // A. Warm geweven woonkamer vloerkleed met rand
    const rugGeo = new THREE.PlaneGeometry(2.8, 2.4);
    rugGeo.rotateX(-Math.PI / 2);
    const rug = new THREE.Mesh(rugGeo, this.materials.livingRug);
    rug.position.set(-5.6, y + 0.003, 10.8);
    rug.receiveShadow = true;
    this.scene.add(rug);

    const rugBorderGeo = new THREE.PlaneGeometry(2.94, 2.54);
    rugBorderGeo.rotateX(-Math.PI / 2);
    const rugBorder = new THREE.Mesh(rugBorderGeo, this.materials.livingRugBorder);
    rugBorder.position.set(-5.6, y + 0.002, 10.8);
    rugBorder.receiveShadow = true;
    this.scene.add(rugBorder);

    // B. Grote Moderne Loungebank / Hoekbank (naar het westen gericht, met gezicht naar de TV)
    const sofaGroup = new THREE.Group();

    // 1) Houten conische pootjes onder de bank
    const legPositions = [
      [-3.95, 9.65], [-3.95, 12.0],
      [-4.75, 9.65], [-4.75, 10.9],
      [-5.45, 11.45], [-5.45, 12.0]
    ];
    const legGeo = new THREE.CylinderGeometry(0.032, 0.02, 0.14, 8);
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(legGeo, this.materials.sofaWoodLegs);
      leg.position.set(lx, y + 0.07, lz);
      leg.castShadow = true;
      sofaGroup.add(leg);
    }

    // 2) Bank basis/onderstel (plint)
    const baseMainGeo = new THREE.BoxGeometry(0.9, 0.16, 2.4);
    const baseMain = new THREE.Mesh(baseMainGeo, this.materials.sofaFabric);
    baseMain.position.set(-4.35, y + 0.22, 10.8);
    baseMain.castShadow = true;
    baseMain.receiveShadow = true;
    sofaGroup.add(baseMain);

    // Chaise longue / L-uitbouw onderstel
    const baseChaiseGeo = new THREE.BoxGeometry(0.8, 0.16, 0.8);
    const baseChaise = new THREE.Mesh(baseChaiseGeo, this.materials.sofaFabric);
    baseChaise.position.set(-5.15, y + 0.22, 11.75);
    baseChaise.castShadow = true;
    baseChaise.receiveShadow = true;
    sofaGroup.add(baseChaise);

    // 3) Zachte dikke zitkussens (zithoogte ca. 0.46m - 0.48m)
    const cushion1 = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.14, 0.76), this.materials.sofaFabric);
    cushion1.position.set(-4.35, y + 0.37, 9.98);
    cushion1.castShadow = true;
    sofaGroup.add(cushion1);

    const cushion2 = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.14, 0.76), this.materials.sofaFabric);
    cushion2.position.set(-4.35, y + 0.37, 10.8);
    cushion2.castShadow = true;
    sofaGroup.add(cushion2);

    const cushion3 = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.14, 0.76), this.materials.sofaFabric);
    cushion3.position.set(-4.35, y + 0.37, 11.62);
    cushion3.castShadow = true;
    sofaGroup.add(cushion3);

    const chaiseCushion = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.76), this.materials.sofaFabric);
    chaiseCushion.position.set(-5.16, y + 0.37, 11.62);
    chaiseCushion.castShadow = true;
    sofaGroup.add(chaiseCushion);

    // 4) Rugleuning achteraan (aan de oostkant van de bank, rug naar de overloop/hal)
    const backrestGeo = new THREE.BoxGeometry(0.2, 0.44, 2.5);
    const backrest = new THREE.Mesh(backrestGeo, this.materials.sofaFabric);
    backrest.position.set(-3.85, y + 0.58, 10.8);
    backrest.castShadow = true;
    sofaGroup.add(backrest);

    // 3x zachte rugleuningkussens
    for (let i = 0; i < 3; i++) {
      const bCushion = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.72), this.materials.sofaFabric);
      bCushion.position.set(-4.0, y + 0.58, 9.98 + i * 0.82);
      bCushion.rotation.z = 0.08;
      bCushion.castShadow = true;
      sofaGroup.add(bCushion);
    }

    // 5) Armleuningen
    const armNorth = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.26, 0.16), this.materials.sofaFabric);
    armNorth.position.set(-4.35, y + 0.46, 9.54);
    armNorth.castShadow = true;
    sofaGroup.add(armNorth);

    const armSouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.8), this.materials.sofaFabric);
    armSouth.position.set(-5.62, y + 0.46, 11.75);
    armSouth.castShadow = true;
    sofaGroup.add(armSouth);

    // 6) Sierkussens (Mosterdgeel en Fris Teal)
    const pillowGeo = new THREE.BoxGeometry(0.1, 0.3, 0.3);

    const pillow1 = new THREE.Mesh(pillowGeo, this.materials.sofaCushionYellow);
    pillow1.position.set(-4.2, y + 0.52, 9.68);
    pillow1.rotation.set(0.1, 0.3, 0.15);
    pillow1.castShadow = true;
    sofaGroup.add(pillow1);

    const pillow2 = new THREE.Mesh(pillowGeo, this.materials.sofaCushionTeal);
    pillow2.position.set(-4.25, y + 0.50, 9.85);
    pillow2.rotation.set(-0.1, -0.2, 0.1);
    pillow2.castShadow = true;
    sofaGroup.add(pillow2);

    const pillow3 = new THREE.Mesh(pillowGeo, this.materials.sofaCushionYellow);
    pillow3.position.set(-5.4, y + 0.50, 11.75);
    pillow3.rotation.set(0.15, 1.4, 0.1);
    pillow3.castShadow = true;
    sofaGroup.add(pillow3);

    this.scene.add(sofaGroup);

    // Colliders voor de bank
    this.colliders.push({
      minX: -4.85, maxX: -3.75,
      minY: y, maxY: y + 0.50,
      minZ: 9.5, maxZ: 12.1
    });
    this.colliders.push({
      minX: -5.65, maxX: -4.85,
      minY: y, maxY: y + 0.50,
      minZ: 11.35, maxZ: 12.1
    });
    this.colliders.push({
      minX: -3.98, maxX: -3.7,
      minY: y, maxY: y + 0.9,
      minZ: 9.5, maxZ: 12.1
    });

    // C. Design Salontafel
    const tableGroup = new THREE.Group();
    tableGroup.position.set(-6.1, y, 10.8);

    const coffeeTop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 1.15), this.materials.coffeeTableWood);
    coffeeTop.position.set(0, 0.40, 0);
    coffeeTop.castShadow = true;
    coffeeTop.receiveShadow = true;
    tableGroup.add(coffeeTop);

    const cLegGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.38, 8);
    const cLegCoords = [
      [-0.28, -0.48], [-0.28, 0.48],
      [0.28, -0.48], [0.28, 0.48]
    ];
    for (const [cx, cz] of cLegCoords) {
      const cLeg = new THREE.Mesh(cLegGeo, this.materials.coffeeTableLegs);
      cLeg.position.set(cx, 0.19, cz);
      cLeg.castShadow = true;
      tableGroup.add(cLeg);
    }

    // Koffiemok
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 16), this.materials.cupMat);
    mug.position.set(0.12, 0.465, -0.22);
    mug.castShadow = true;
    tableGroup.add(mug);

    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.01, 0.28), this.materials.magazineMat);
    mag.position.set(-0.08, 0.425, 0.15);
    mag.rotation.y = 0.25;
    mag.castShadow = true;
    tableGroup.add(mag);

    this.scene.add(tableGroup);

    this.colliders.push({
      minX: -6.5, maxX: -5.7,
      minY: y, maxY: y + 0.48,
      minZ: 10.2, maxZ: 11.4
    });

    // D. Modern TV-Meubel & Grote Smart Flatscreen Televisie
    const tvUnitGroup = new THREE.Group();
    tvUnitGroup.position.set(-7.6, y, 10.8);

    // 1) Dressoir romp
    const tvStand = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.46, 2.1), this.materials.tvStandWood);
    tvStand.position.set(0, 0.25, 0);
    tvStand.castShadow = true;
    tvStand.receiveShadow = true;
    tvUnitGroup.add(tvStand);

    // 4 pootjes
    const tvLegGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.06, 8);
    for (const [tx, tz] of [[-0.18, -0.95], [-0.18, 0.95], [0.18, -0.95], [0.18, 0.95]]) {
      const tLeg = new THREE.Mesh(tvLegGeo, this.materials.coffeeTableLegs);
      tLeg.position.set(tx, 0.03, tz);
      tvUnitGroup.add(tLeg);
    }

    // Open middenvak met console
    const openShelf = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.65), this.materials.wardrobeInside);
    openShelf.position.set(0.02, 0.32, 0);
    tvUnitGroup.add(openShelf);

    // Console
    const consoleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.35), this.materials.consoleMat);
    consoleMesh.position.set(0.04, 0.28, 0);
    consoleMesh.castShadow = true;
    tvUnitGroup.add(consoleMesh);

    const consoleLight = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.06), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    consoleLight.position.set(0.175, 0.29, 0);
    tvUnitGroup.add(consoleLight);

    // 2) Soundbar
    const soundbar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 1.1), this.materials.soundbarMat);
    soundbar.position.set(0.08, 0.51, 0);
    soundbar.castShadow = true;
    tvUnitGroup.add(soundbar);

    // 3) TV Voet & Standaard
    const tvBase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.45), this.materials.tvFrame);
    tvBase.position.set(-0.02, 0.49, 0);
    tvUnitGroup.add(tvBase);

    const tvPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.12), this.materials.tvFrame);
    tvPillar.position.set(-0.02, 0.61, 0);
    tvUnitGroup.add(tvPillar);

    // 4) Grote Flatscreen Televisie (1.55m breed, 0.88m hoog)
    const tvFrameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.88, 1.55), this.materials.tvFrame);
    tvFrameMesh.position.set(-0.02, 1.15, 0);
    tvFrameMesh.castShadow = true;
    tvUnitGroup.add(tvFrameMesh);

    // Scherm met subtiele cyan glow
    const tvScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.82), this.materials.tvScreen);
    tvScreenMesh.position.set(0.007, 1.15, 0);
    tvScreenMesh.rotation.y = Math.PI / 2;
    tvUnitGroup.add(tvScreenMesh);

    const tvLed = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    tvLed.position.set(0.007, 0.73, 0.72);
    tvUnitGroup.add(tvLed);

    this.scene.add(tvUnitGroup);

    this.colliders.push({
      minX: -7.88, maxX: -7.3,
      minY: y, maxY: y + 1.65,
      minZ: 9.7, maxZ: 11.9
    });

    // E. Staande Booglamp (in de zuidwesthoek)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-7.3, y, 12.6);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 20), this.materials.lampBrass);
    lampBase.position.set(0, 0.02, 0);
    lampGroup.add(lampBase);

    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 12), this.materials.lampBrass);
    lampPole.position.set(0, 0.92, 0);
    lampGroup.add(lampPole);

    const lampArch = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.02), this.materials.lampBrass);
    lampArch.position.set(0.18, 1.81, -0.15);
    lampGroup.add(lampArch);

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.28, 20, 1, true), this.materials.lampShadeWarm);
    shade.position.set(0.36, 1.70, -0.15);
    shade.castShadow = true;
    lampGroup.add(shade);

    const warmLight = new THREE.PointLight(0xffedd5, 0.45, 4.2);
    warmLight.position.set(0.36, 1.62, -0.15);
    lampGroup.add(warmLight);

    this.scene.add(lampGroup);

    this.colliders.push({
      minX: -7.55, maxX: -7.05,
      minY: y, maxY: y + 1.85,
      minZ: 12.35, maxZ: 12.85
    });

    // F. Grote Kamerplant (Monstera in terracotta pot)
    const plantGroup = new THREE.Group();
    plantGroup.position.set(-7.3, y, 9.2);

    const potGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.55, 16);
    const pot = new THREE.Mesh(potGeo, this.materials.potColor);
    pot.position.set(0, 0.275, 0);
    pot.castShadow = true;
    plantGroup.add(pot);

    const soilGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.04, 16);
    const soil = new THREE.Mesh(soilGeo, new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 }));
    soil.position.set(0, 0.53, 0);
    plantGroup.add(soil);

    for (let i = 0; i < 8; i++) {
      const leafGeo = new THREE.SphereGeometry(0.28, 8, 8);
      leafGeo.scale(1.2, 0.15, 2.0);
      const leaf = new THREE.Mesh(leafGeo, this.materials.leafGreen);
      leaf.position.set(0, 0.65, 0);
      leaf.rotation.y = (i * Math.PI) / 4 + 0.2;
      leaf.rotation.x = 0.42 + (i % 2) * 0.1;
      leaf.castShadow = true;
      plantGroup.add(leaf);
    }
    this.scene.add(plantGroup);

    this.colliders.push({
      minX: -7.65, maxX: -6.95,
      minY: y, maxY: y + 1.2,
      minZ: 8.85, maxZ: 9.55
    });

    // G. Wandplank boven de TV met boeken en vetplantje
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(-7.75, y + 1.95, 10.8);

    const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 1.8), this.materials.coffeeTableWood);
    shelfBoard.castShadow = true;
    shelfGroup.add(shelfBoard);

    for (const sz of [-0.7, 0.7]) {
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.16, 0.02), this.materials.coffeeTableLegs);
      bracket.position.set(0, -0.08, sz);
      shelfGroup.add(bracket);
    }

    const bookColors = [0x2563eb, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6];
    for (let i = 0; i < 5; i++) {
      const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.6 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.045), bookMat);
      b.position.set(0, 0.105, -0.55 + i * 0.05);
      shelfGroup.add(b);
    }

    const miniPot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.08, 12), this.materials.potColor);
    miniPot.position.set(0, 0.055, 0.5);
    shelfGroup.add(miniPot);
    const miniPlant = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), this.materials.leafGreen);
    miniPlant.position.set(0, 0.11, 0.5);
    shelfGroup.add(miniPlant);

    this.scene.add(shelfGroup);

    // ==========================================
    // 2. EETHOEK (DINING AREA)
    // ==========================================

    const diningGroup = new THREE.Group();
    diningGroup.position.set(-5.2, y, 2.4);

    // A. Massief Eiken Eettafel (1.6m x 0.95m x 0.76m)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.95), this.materials.diningTableWood);
    tableTop.position.set(0, 0.735, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    diningGroup.add(tableTop);

    const tLegGeo = new THREE.BoxGeometry(0.07, 0.71, 0.07);
    const tLegCoords = [
      [-0.70, -0.38], [-0.70, 0.38],
      [0.70, -0.38], [0.70, 0.38]
    ];
    for (const [tx, tz] of tLegCoords) {
      const leg = new THREE.Mesh(tLegGeo, this.materials.diningChairLegs);
      leg.position.set(tx, 0.355, tz);
      leg.castShadow = true;
      diningGroup.add(leg);
    }

    // Fruitschaal met fruit
    const fruitBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.09, 0.07, 16), this.materials.fruitBowlMat);
    fruitBowl.position.set(0, 0.795, 0);
    fruitBowl.castShadow = true;
    diningGroup.add(fruitBowl);

    const apple1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this.materials.fruitApple);
    apple1.position.set(-0.04, 0.84, 0.03);
    apple1.castShadow = true;
    diningGroup.add(apple1);

    const apple2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this.materials.fruitApple);
    apple2.position.set(0.05, 0.835, -0.02);
    apple2.castShadow = true;
    diningGroup.add(apple2);

    const banana = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), this.materials.fruitBanana);
    banana.rotation.z = 0.45;
    banana.rotation.y = 0.8;
    banana.position.set(0.01, 0.85, 0.04);
    banana.castShadow = true;
    diningGroup.add(banana);

    // B. 4 Moderne Eetkamerstoelen
    const chairCoords = [
      { x: -0.42, z: -0.72, rotY: 0 },
      { x: 0.42, z: -0.72, rotY: 0 },
      { x: -0.42, z: 0.72, rotY: Math.PI },
      { x: 0.42, z: 0.72, rotY: Math.PI }
    ];

    for (const c of chairCoords) {
      const chair = new THREE.Group();
      chair.position.set(c.x, 0, c.z);
      chair.rotation.y = c.rotY;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.42), this.materials.diningChairSeat);
      seat.position.set(0, 0.46, 0);
      seat.castShadow = true;
      chair.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.40, 0.04), this.materials.diningChairSeat);
      back.position.set(0, 0.68, -0.19);
      back.castShadow = true;
      chair.add(back);

      const cLegGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.44, 8);
      for (const [px, pz] of [[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]]) {
        const cLeg = new THREE.Mesh(cLegGeo, this.materials.diningChairLegs);
        cLeg.position.set(px, 0.22, pz);
        cLeg.castShadow = true;
        chair.add(cLeg);
      }

      diningGroup.add(chair);
    }

    // C. Hanglamp boven de eettafel
    const lampCord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1.15, 6), this.materials.coffeeTableLegs);
    lampCord.position.set(0, 2.75, 0);
    diningGroup.add(lampCord);

    const lampDome = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.28, 0.22, 20, 1, true), this.materials.tvStandWood);
    lampDome.position.set(0, 2.10, 0);
    lampDome.castShadow = true;
    diningGroup.add(lampDome);

    const diningLight = new THREE.PointLight(0xfff7ed, 0.40, 3.8);
    diningLight.position.set(0, 2.0, 0);
    diningGroup.add(diningLight);

    this.scene.add(diningGroup);

    // Eettafel & stoelen colliders
    this.colliders.push({
      minX: -6.05, maxX: -4.35,
      minY: y, maxY: y + 0.85,
      minZ: 1.88, maxZ: 2.92
    });
    this.colliders.push({
      minX: -5.85, maxX: -4.55,
      minY: y, maxY: y + 0.9,
      minZ: 1.45, maxZ: 1.85
    });
    this.colliders.push({
      minX: -5.85, maxX: -4.55,
      minY: y, maxY: y + 0.9,
      minZ: 2.95, maxZ: 3.35
    });

    this.cameraOccluders.push(tvStand, backrest, tableTop);
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

    // Sluit eventuele eerdere animatie uit
    this.wardrobeAnimating = true;
  }

  closeWardrobe() {
    this.wardrobeAnimating = false;
    if (this.interactiveObjects.wardrobe) {
      this.interactiveObjects.wardrobe.opened = false;
    }
    if (this.doorLeft) this.doorLeft.rotation.y = 0;
    if (this.doorRight) this.doorRight.rotation.y = 0;
    if (this.wardrobeArrow) this.wardrobeArrow.visible = true;
    if (this.wardrobeMarker) this.wardrobeMarker.visible = true;
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
    this.mattressMesh = new THREE.Mesh(matGeo, this.materials.mattress);
    this.mattressMesh.position.set(0.04, 0.46, 0);
    bed.add(this.mattressMesh);

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

    // Hoofdbord collider (voorkomt springen/vallen door het houten hoofdbord naar de westmuur)
    this.colliders.push({
      minX: x - 1.25, maxX: x - 0.92,
      minY: y, maxY: y + 1.4,
      minZ: z - 0.78, maxZ: z + 0.78
    });

    // Bedframe zijranden collider op vloerniveau (zodat je er op de vloer niet doorheen loopt, maar er wel OP kunt springen)
    this.colliders.push({
      minX: x - 0.95, maxX: x + 1.18,
      minY: y, maxY: y + 0.52,
      minZ: z - 0.78, maxZ: z + 0.78
    });
  }

  isOnBed(x, z, currentY = null) {
    // Bed is gecentreerd op (-5.8, UPPER_Y, -5.5)
    // Matras bereik: X van -6.85 tot -4.75, Z van -6.20 tot -4.80
    const inBedBounds = (x >= -6.85 && x <= -4.75 && z >= -6.20 && z <= -4.80);
    if (!inBedBounds) return false;

    // Moet zich op de bovenverdieping bevinden (niet eronder op de begane grond)
    if (currentY !== null && currentY < (this.UPPER_Y + this.LOWER_Y) / 2) {
      return false;
    }
    return true;
  }

  bounceBed() {
    this.bedBounceAnimating = true;
    this.bedBounceTimer = 0;
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

    // Vloermarker bij het nachtkastje
    const markerGeo = new THREE.RingGeometry(0.35, 0.55, 32);
    markerGeo.rotateX(-Math.PI / 2);
    this.alarmMarker = new THREE.Mesh(markerGeo, this.materials.glowMarker);
    this.alarmMarker.position.set(x, y + 0.005, z + 0.65);
    this.alarmMarker.visible = false;
    this.scene.add(this.alarmMarker);

    // Richtingspijl boven de wekker
    const arrowGeo = new THREE.ConeGeometry(0.16, 0.32, 16);
    arrowGeo.rotateX(Math.PI);
    this.alarmArrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xd97706,
      emissiveIntensity: 0.85
    }));
    this.alarmArrow.position.set(x, y + 1.45, z);
    this.alarmArrow.visible = false;
    this.scene.add(this.alarmArrow);

    this.interactiveObjects.alarmClock = {
      position: new THREE.Vector3(x, y, z + 0.65),
      radius: 1.8,
      ringing: false
    };

    this.colliders.push({
      minX: x - 0.4, maxX: x + 0.4,
      minY: y, maxY: y + 0.8,
      minZ: z - 0.4, maxZ: z + 0.4
    });
  }

  startAlarmClock() {
    this.interactiveObjects.alarmRinging = true;
    if (this.interactiveObjects.alarmClock) {
      this.interactiveObjects.alarmClock.ringing = true;
    }
    if (this.alarmMarker) this.alarmMarker.visible = true;
    if (this.alarmArrow) this.alarmArrow.visible = true;
  }

  stopAlarmClock() {
    this.interactiveObjects.alarmRinging = false;
    if (this.interactiveObjects.alarmClock) {
      this.interactiveObjects.alarmClock.ringing = false;
    }
    if (this.alarmMarker) this.alarmMarker.visible = false;
    if (this.alarmArrow) this.alarmArrow.visible = false;
    if (this.alarmClockMesh) {
      this.alarmClockMesh.position.x = 0;
      this.alarmClockMesh.rotation.z = 0;
    }
  }

  resetAlarmClock() {
    this.stopAlarmClock();
  }

  createBookcase(x, y, z) {
    const bookcase = new THREE.Group();
    bookcase.position.set(x, y, z);

    // Afmetingen kast: w: 0.45m (steekt uit van x = 0 muur), d: 1.4m (langs z-as), h: 2.1m
    const caseMat = this.materials.woodFurniture;
    const shelfGeo = new THREE.BoxGeometry(0.42, 0.04, 1.34);
    const sideGeo = new THREE.BoxGeometry(0.44, 2.1, 0.04);
    const backGeo = new THREE.BoxGeometry(0.03, 2.1, 1.34);

    // Achterwand (tegen de muur op x = 0)
    const backMesh = new THREE.Mesh(backGeo, caseMat);
    backMesh.position.set(0.20, 1.05, 0);
    backMesh.castShadow = true;
    bookcase.add(backMesh);

    // Zijpanelen
    const sideL = new THREE.Mesh(sideGeo, caseMat);
    sideL.position.set(0, 1.05, -0.67);
    sideL.castShadow = true;
    bookcase.add(sideL);

    const sideR = new THREE.Mesh(sideGeo, caseMat);
    sideR.position.set(0, 1.05, 0.67);
    sideR.castShadow = true;
    bookcase.add(sideR);

    // Boven- en onderkant
    const topMesh = new THREE.Mesh(shelfGeo, caseMat);
    topMesh.position.set(0, 2.08, 0);
    topMesh.castShadow = true;
    bookcase.add(topMesh);

    const bottomMesh = new THREE.Mesh(shelfGeo, caseMat);
    bottomMesh.position.set(0, 0.08, 0);
    bottomMesh.castShadow = true;
    bookcase.add(bottomMesh);

    // Tussenplanken (y = 0.55, 1.05, 1.55)
    const shelfYs = [0.55, 1.05, 1.55];
    shelfYs.forEach(sy => {
      const shelf = new THREE.Mesh(shelfGeo, caseMat);
      shelf.position.set(0, sy, 0);
      shelf.castShadow = true;
      bookcase.add(shelf);
    });

    // Boekenrijen op de planken
    const bookMats = [
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }), // rood
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 }), // blauw
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 }), // groen
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 }), // geel/oranje
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.5 })  // paars
    ];

    // Plank 1 (y = 1.05): Boekenreeks
    for (let i = 0; i < 9; i++) {
      const bH = 0.28 + (i % 3) * 0.04;
      const bD = 0.05 + (i % 2) * 0.02;
      const bGeo = new THREE.BoxGeometry(0.24, bH, bD);
      const bMesh = new THREE.Mesh(bGeo, bookMats[i % bookMats.length]);
      bMesh.position.set(-0.04, 1.07 + bH / 2, -0.55 + i * 0.075);
      bMesh.castShadow = true;
      bookcase.add(bMesh);
    }

    // Plank 2 (y = 1.55): Enkele encyclopedieën en boekensteun
    for (let i = 0; i < 6; i++) {
      const bH = 0.32;
      const bGeo = new THREE.BoxGeometry(0.26, bH, 0.06);
      const bMesh = new THREE.Mesh(bGeo, bookMats[(i + 2) % bookMats.length]);
      bMesh.position.set(-0.04, 1.57 + bH / 2, 0.15 + i * 0.07);
      bMesh.castShadow = true;
      bookcase.add(bMesh);
    }

    this.scene.add(bookcase);

    this.colliders.push({
      minX: x - 0.25, maxX: x + 0.25,
      minY: y, maxY: y + 2.1,
      minZ: z - 0.72, maxZ: z + 0.72
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

    this.scene.add(desk);

    // Prachtige, realistische ergonomische bureaustoel op wieltjes
    this.createOfficeChair(x, y, z + 0.65, -0.15);

    this.colliders.push({
      minX: x - 0.8, maxX: x + 0.8,
      minY: y, maxY: y + 1.05,
      minZ: z - 0.5, maxZ: z + 0.95
    });
  }

  createOfficeChair(x, y, z, rotationY = -0.15) {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(x, y, z);
    chairGroup.rotation.y = rotationY;

    // --- 1. WIELKRUIS & ZWENKWIELEN (5-Sterren Basis) ---
    // Centrale naafdop
    const hubGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.05, 16);
    const hub = new THREE.Mesh(hubGeo, this.materials.chairDarkFrame);
    hub.position.set(0, 0.08, 0);
    hub.castShadow = true;
    chairGroup.add(hub);

    // 5 wielpoten (spaken) verdeeld over 360 graden (elke 72°)
    const legRadius = 0.28;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const legGroup = new THREE.Group();
      legGroup.rotation.y = angle;

      // Schuine pootstang
      const spokeGeo = new THREE.BoxGeometry(0.045, 0.024, legRadius);
      const spoke = new THREE.Mesh(spokeGeo, this.materials.chairDarkFrame);
      spoke.position.set(0, 0.058, legRadius / 2);
      spoke.rotation.x = 0.05;
      spoke.castShadow = true;
      legGroup.add(spoke);

      // Caster houder (verticaal asje aan uiteinde)
      const pinGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.035, 8);
      const pin = new THREE.Mesh(pinGeo, this.materials.chairChrome);
      pin.position.set(0, 0.045, legRadius);
      legGroup.add(pin);

      // Dubbel zwenkwieltje (twin-wheel caster)
      const wheelWidth = 0.012;
      const wheelRadius = 0.025;
      const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 12);

      const leftWheel = new THREE.Mesh(wheelGeo, this.materials.chairPad);
      leftWheel.rotation.z = Math.PI / 2;
      leftWheel.position.set(-0.016, wheelRadius, legRadius);
      leftWheel.castShadow = true;
      legGroup.add(leftWheel);

      const rightWheel = new THREE.Mesh(wheelGeo, this.materials.chairPad);
      rightWheel.rotation.z = Math.PI / 2;
      rightWheel.position.set(0.016, wheelRadius, legRadius);
      rightWheel.castShadow = true;
      legGroup.add(rightWheel);

      // Wielkapje bovenop het zwenkwiel
      const capGeo = new THREE.BoxGeometry(0.044, 0.02, 0.038);
      const cap = new THREE.Mesh(capGeo, this.materials.chairDarkFrame);
      cap.position.set(0, wheelRadius + 0.016, legRadius);
      legGroup.add(cap);

      chairGroup.add(legGroup);
    }

    // --- 2. HYDRAULISCHE GASVEER (Piston) ---
    // Onderste zwarte cilindrische mantel
    const pistonBaseGeo = new THREE.CylinderGeometry(0.036, 0.042, 0.16, 16);
    const pistonBase = new THREE.Mesh(pistonBaseGeo, this.materials.chairDarkFrame);
    pistonBase.position.set(0, 0.17, 0);
    pistonBase.castShadow = true;
    chairGroup.add(pistonBase);

    // Bovenste glanzende chroom stang (telescopisch)
    const pistonChromeGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.18, 16);
    const pistonChrome = new THREE.Mesh(pistonChromeGeo, this.materials.chairChrome);
    pistonChrome.position.set(0, 0.31, 0);
    pistonChrome.castShadow = true;
    chairGroup.add(pistonChrome);

    // Kraag / ring tussen mantel en gasveer
    const collarGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.02, 16);
    const collar = new THREE.Mesh(collarGeo, this.materials.chairDarkFrame);
    collar.position.set(0, 0.24, 0);
    chairGroup.add(collar);

    // --- 3. KANTELMECHANISME & HOOGTEHENDEL ONDER DE ZITTING ---
    // Mechanismebehuizing
    const mechBoxGeo = new THREE.BoxGeometry(0.24, 0.04, 0.22);
    const mechBox = new THREE.Mesh(mechBoxGeo, this.materials.chairDarkFrame);
    mechBox.position.set(0, 0.40, 0.02);
    mechBox.castShadow = true;
    chairGroup.add(mechBox);

    // Verstelhendel (aan rechterzijde van de stoel)
    const leverBarGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.14, 8);
    const leverBar = new THREE.Mesh(leverBarGeo, this.materials.chairChrome);
    leverBar.rotation.z = Math.PI / 2;
    leverBar.position.set(0.18, 0.40, 0.04);
    chairGroup.add(leverBar);

    // Hendelknop / paddle
    const paddleGeo = new THREE.BoxGeometry(0.04, 0.012, 0.03);
    const paddle = new THREE.Mesh(paddleGeo, this.materials.chairPad);
    paddle.position.set(0.26, 0.40, 0.04);
    chairGroup.add(paddle);

    // Kantelweerstand draaiknop (centraal onderkant)
    const knobGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12);
    const knob = new THREE.Mesh(knobGeo, this.materials.chairDarkFrame);
    knob.position.set(0, 0.35, -0.05);
    chairGroup.add(knob);

    // --- 4. ERGONOMISCHE ZITTING (Seat Cushion) ---
    // Zwarte bodemplaat
    const seatBaseGeo = new THREE.BoxGeometry(0.48, 0.025, 0.48);
    const seatBase = new THREE.Mesh(seatBaseGeo, this.materials.chairDarkFrame);
    seatBase.position.set(0, 0.435, 0);
    seatBase.castShadow = true;
    chairGroup.add(seatBase);

    // Hoofdkussen zitting (gestoffeerd in koningsblauw)
    const seatGeo = new THREE.BoxGeometry(0.47, 0.065, 0.47);
    const seat = new THREE.Mesh(seatGeo, this.materials.chairCushion);
    seat.position.set(0, 0.475, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    chairGroup.add(seat);

    // Ergonomische "waterfall" afronding aan de voorzijde van de zitting
    const waterfallGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.47, 12);
    const waterfall = new THREE.Mesh(waterfallGeo, this.materials.chairCushion);
    waterfall.rotation.z = Math.PI / 2;
    waterfall.position.set(0, 0.475, -0.235);
    waterfall.castShadow = true;
    chairGroup.add(waterfall);

    // Zijranden / dijbeenondersteuning lichte profilering
    const contourGeo = new THREE.BoxGeometry(0.06, 0.02, 0.42);
    const leftContour = new THREE.Mesh(contourGeo, this.materials.chairAccent);
    leftContour.position.set(-0.205, 0.515, 0.01);
    chairGroup.add(leftContour);
    const rightContour = new THREE.Mesh(contourGeo, this.materials.chairAccent);
    rightContour.position.set(0.205, 0.515, 0.01);
    chairGroup.add(rightContour);

    // --- 5. RUGLEUNING MET RUGGENGRAAT EN LENDENSTEUN ---
    // Steunbalk / wervelkolom achterop (zwart mat frame)
    const spineGroup = new THREE.Group();
    spineGroup.position.set(0, 0.43, 0.22); // Aan de achterkant van de zitting (+Z)

    // Horizontale koppelstang vanuit mechanisme naar achteren
    const spineBottomGeo = new THREE.BoxGeometry(0.09, 0.035, 0.12);
    const spineBottom = new THREE.Mesh(spineBottomGeo, this.materials.chairDarkFrame);
    spineBottom.position.set(0, 0, 0.05);
    spineBottom.castShadow = true;
    spineGroup.add(spineBottom);

    // Verticale ruggengraat met ergonomische knik omhoog
    const spineUpGeo = new THREE.BoxGeometry(0.08, 0.48, 0.04);
    const spineUp = new THREE.Mesh(spineUpGeo, this.materials.chairDarkFrame);
    spineUp.position.set(0, 0.26, 0.10);
    spineUp.rotation.x = -0.10;
    spineUp.castShadow = true;
    spineGroup.add(spineUp);

    chairGroup.add(spineGroup);

    // Hoofdrugleuning (ademende mesh + kussen)
    const backGroup = new THREE.Group();
    backGroup.position.set(0, 0.74, 0.28);
    backGroup.rotation.x = -0.10; // ergonomische lighoek (~6 graden)

    // Buitenframe van de rugleuning
    const backFrameGeo = new THREE.BoxGeometry(0.44, 0.48, 0.03);
    const backFrame = new THREE.Mesh(backFrameGeo, this.materials.chairDarkFrame);
    backFrame.castShadow = true;
    backGroup.add(backFrame);

    // Binnenvlak: ademend mesh / bekleding
    const backMeshGeo = new THREE.BoxGeometry(0.40, 0.44, 0.04);
    const backCushion = new THREE.Mesh(backMeshGeo, this.materials.chairCushion);
    backCushion.position.set(0, 0, -0.01);
    backCushion.castShadow = true;
    backGroup.add(backCushion);

    // Lendensteunkussen (Lumbar support)
    const lumbarGeo = new THREE.BoxGeometry(0.34, 0.11, 0.035);
    const lumbar = new THREE.Mesh(lumbarGeo, this.materials.chairPad);
    lumbar.position.set(0, -0.10, -0.03);
    lumbar.castShadow = true;
    backGroup.add(lumbar);

    // Bovenste hoofd- / schoudersteun afronding
    const topCurveGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.44, 12);
    const topCurve = new THREE.Mesh(topCurveGeo, this.materials.chairDarkFrame);
    topCurve.rotation.z = Math.PI / 2;
    topCurve.position.set(0, 0.24, 0);
    backGroup.add(topCurve);

    chairGroup.add(backGroup);

    // --- 6. ARMLEUNINGEN (Links en Rechts) ---
    [-1, 1].forEach((side) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.26, 0.43, 0.04);

      // Horizontale montagebeugel onder de zitting
      const mountGeo = new THREE.BoxGeometry(0.06, 0.03, 0.12);
      const mount = new THREE.Mesh(mountGeo, this.materials.chairDarkFrame);
      mount.position.set(-side * 0.02, 0, 0);
      armGroup.add(mount);

      // Verticale T-staander met chroom accent
      const postGeo = new THREE.BoxGeometry(0.04, 0.20, 0.05);
      const post = new THREE.Mesh(postGeo, this.materials.chairDarkFrame);
      post.position.set(0, 0.10, 0);
      post.castShadow = true;
      armGroup.add(post);

      const postChromeGeo = new THREE.BoxGeometry(0.032, 0.09, 0.042);
      const postChrome = new THREE.Mesh(postChromeGeo, this.materials.chairChrome);
      postChrome.position.set(0, 0.15, 0);
      armGroup.add(postChrome);

      // Armlegger (zacht donker kussen)
      const padGeo = new THREE.BoxGeometry(0.08, 0.032, 0.24);
      const pad = new THREE.Mesh(padGeo, this.materials.chairPad);
      pad.position.set(0, 0.21, 0.01);
      pad.castShadow = true;
      armGroup.add(pad);

      chairGroup.add(armGroup);
    });

    this.scene.add(chairGroup);
    return chairGroup;
  }

  createWindow(x, y, z, w, h, facing = 'z') {
    const windowGroup = new THREE.Group();
    windowGroup.position.set(x, y, z);

    const frameT = 0.07; // profieldikte kozijn
    const frameD = 0.16; // diepte kozijn in de muur
    const frameMat = this.materials.windowFrame;
    const sillMat = this.materials.windowSill;
    const glassMat = this.materials.glass;

    // 1. Bovendorpel van het kozijn
    const topGeo = new THREE.BoxGeometry(w, frameT, frameD);
    const topMesh = new THREE.Mesh(topGeo, frameMat);
    topMesh.position.set(0, h / 2 - frameT / 2, 0);
    topMesh.castShadow = true;
    windowGroup.add(topMesh);

    // 2. Onderdorpel / Vensterbank (iets breder en dieper)
    const sillGeo = new THREE.BoxGeometry(w + 0.08, frameT * 1.15, frameD + 0.08);
    const sillMesh = new THREE.Mesh(sillGeo, sillMat);
    sillMesh.position.set(0, -h / 2 + frameT / 2, 0);
    sillMesh.castShadow = true;
    windowGroup.add(sillMesh);

    // 3. Linker en rechter zijstijlen
    const sideH = h - frameT * 2;
    const sideGeo = new THREE.BoxGeometry(frameT, sideH, frameD);
    const leftMesh = new THREE.Mesh(sideGeo, frameMat);
    leftMesh.position.set(-w / 2 + frameT / 2, 0, 0);
    leftMesh.castShadow = true;
    windowGroup.add(leftMesh);

    const rightMesh = new THREE.Mesh(sideGeo, frameMat);
    rightMesh.position.set(w / 2 - frameT / 2, 0, 0);
    rightMesh.castShadow = true;
    windowGroup.add(rightMesh);

    // 4. Authentieke tussenroeden (muntins/transom) voor ramen vanaf 1.2m breed
    if (w >= 1.2) {
      const mullionGeo = new THREE.BoxGeometry(0.038, sideH, frameD * 0.6);
      const mullion = new THREE.Mesh(mullionGeo, frameMat);
      mullion.position.set(0, 0, 0);
      windowGroup.add(mullion);
    }
    if (h >= 1.3) {
      const transomGeo = new THREE.BoxGeometry(w - frameT * 2, 0.035, frameD * 0.6);
      const transom = new THREE.Mesh(transomGeo, frameMat);
      transom.position.set(0, 0.12, 0);
      windowGroup.add(transom);
    }

    // 5. Dubbelzijdig kristalhelder vensterglas (volledig doorkijkbaar naar buiten)
    const glassW = w - frameT * 2;
    const glassH = h - frameT * 2;
    const glassGeo = new THREE.PlaneGeometry(glassW, glassH);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 0, 0);
    windowGroup.add(glass);

    // 6. Orientatie en Collider
    if (facing === 'x') {
      windowGroup.rotation.y = Math.PI / 2;
      this.colliders.push({
        minX: x - 0.15, maxX: x + 0.15,
        minY: y - h / 2, maxY: y + h / 2,
        minZ: z - w / 2, maxZ: z + w / 2
      });
    } else {
      this.colliders.push({
        minX: x - w / 2, maxX: x + w / 2,
        minY: y - h / 2, maxY: y + h / 2,
        minZ: z - 0.15, maxZ: z + 0.15
      });
    }

    this.scene.add(windowGroup);
  }

  createFrontDoor(x, y, z) {
    // Scharnierende voordeur (draait open om x - 0.8)
    this.frontDoorGroup = new THREE.Group();
    this.frontDoorGroup.position.set(x - 0.8, y, z);

    const doorGeo = new THREE.BoxGeometry(1.6, 2.6, 0.08);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0.8, 1.3, 0);
    door.castShadow = true;
    this.frontDoorGroup.add(door);

    // Messing deurklink
    const handleGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8);
    const handle = new THREE.Mesh(handleGeo, this.materials.brass);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(1.48, 1.25, -0.06);
    this.frontDoorGroup.add(handle);

    this.scene.add(this.frontDoorGroup);
    this.cameraOccluders.push(door);

    // Deurmat (plane met polygonOffset)
    const matGeo = new THREE.PlaneGeometry(1.4, 0.8);
    matGeo.rotateX(-Math.PI / 2);
    const mat = new THREE.Mesh(matGeo, this.materials.doormatMat);
    mat.position.set(x, y + 0.002, z - 0.6);
    mat.receiveShadow = true;
    this.scene.add(mat);

    // Gouden vloermarker voor de voordeur (wordt actief als alle spullen verzameld zijn)
    const doorMarkerGeo = new THREE.RingGeometry(0.60, 0.90, 32);
    doorMarkerGeo.rotateX(-Math.PI / 2);
    this.frontDoorMarker = new THREE.Mesh(doorMarkerGeo, new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    }));
    this.frontDoorMarker.position.set(x, y + 0.005, z - 0.8);
    this.frontDoorMarker.visible = false;
    this.scene.add(this.frontDoorMarker);

    // Zwevende gouden richtingspijl boven de voordeur
    const doorArrowGeo = new THREE.ConeGeometry(0.24, 0.48, 16);
    doorArrowGeo.rotateX(Math.PI);
    this.frontDoorArrow = new THREE.Mesh(doorArrowGeo, new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.9
    }));
    this.frontDoorArrow.position.set(x, y + 2.0, z - 0.8);
    this.frontDoorArrow.visible = false;
    this.scene.add(this.frontDoorArrow);

    this.interactiveObjects.frontDoor = {
      position: new THREE.Vector3(x, y, z - 0.8),
      radius: 2.2,
      opened: false,
      onInteract: () => this.openFrontDoor()
    };

    // Collider voor gesloten voordeur (extra breed en diep zodat er nooit doorheen geglitched of gelopen kan worden)
    this.frontDoorCollider = {
      minX: x - 0.85, maxX: x + 0.85,
      minY: y, maxY: y + 2.6,
      minZ: 13.0, maxZ: 13.8,
      enabled: true
    };
    this.colliders.push(this.frontDoorCollider);

    // Collider voor het geopende deurblad (draait open naar de voortuin op de stoep bij z = 13.38 tot 14.98)
    this.openDoorLeafCollider = {
      minX: 0.65, maxX: 1.05,
      minY: y, maxY: y + 2.6,
      minZ: 13.35, maxZ: 15.05,
      enabled: false
    };
    this.colliders.push(this.openDoorLeafCollider);
  }

  openFrontDoor() {
    this.interactiveObjects.frontDoor.opened = true;
    if (this.frontDoorCollider) {
      this.frontDoorCollider.enabled = false;
    }
    if (this.openDoorLeafCollider) {
      this.openDoorLeafCollider.enabled = true;
    }
    if (this.frontDoorGroup) {
      this.frontDoorGroup.rotation.y = -Math.PI / 2.2;
    }
    if (this.frontDoorArrow) this.frontDoorArrow.visible = false;
    if (this.frontDoorMarker) this.frontDoorMarker.visible = false;
  }

  // --- SCHOOLTAS OP HET BUREAU IN DE SLAAPKAMER ---
  createSchoolBag(x, y, z) {
    const bagGroup = new THREE.Group();
    bagGroup.position.set(x + 0.35, y + 0.81, z);

    // Hoofdvak schoolrugzak
    const bodyGeo = new THREE.BoxGeometry(0.28, 0.36, 0.18);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.backpackDeskMat);
    bodyMesh.position.set(0, 0.18, 0);
    bodyMesh.castShadow = true;
    bagGroup.add(bodyMesh);

    // Voorvak
    const pocketGeo = new THREE.BoxGeometry(0.22, 0.18, 0.08);
    const pocketMesh = new THREE.Mesh(pocketGeo, this.materials.backpackPocketMat);
    pocketMesh.position.set(0, 0.12, 0.12);
    pocketMesh.castShadow = true;
    bagGroup.add(pocketMesh);

    // Handvat bovenop
    const handleGeo = new THREE.BoxGeometry(0.10, 0.04, 0.02);
    const handleMesh = new THREE.Mesh(handleGeo, this.materials.metal);
    handleMesh.position.set(0, 0.38, 0);
    bagGroup.add(handleMesh);

    // Schouderbanden
    const strapGeo = new THREE.BoxGeometry(0.04, 0.30, 0.02);
    const strapL = new THREE.Mesh(strapGeo, this.materials.backpackPocketMat);
    strapL.position.set(-0.08, 0.18, -0.10);
    bagGroup.add(strapL);
    const strapR = new THREE.Mesh(strapGeo, this.materials.backpackPocketMat);
    strapR.position.set(0.08, 0.18, -0.10);
    bagGroup.add(strapR);

    this.scene.add(bagGroup);
    this.schoolBagGroup = bagGroup;

    // Vloermarker naast het bureau
    const markerGeo = new THREE.RingGeometry(0.40, 0.65, 32);
    markerGeo.rotateX(-Math.PI / 2);
    this.schoolBagMarker = new THREE.Mesh(markerGeo, this.materials.glowMarker);
    this.schoolBagMarker.position.set(x + 0.35, y + 0.005, z + 0.7);
    this.scene.add(this.schoolBagMarker);

    // Richtingspijl boven de schooltas
    const arrowGeo = new THREE.ConeGeometry(0.18, 0.36, 16);
    arrowGeo.rotateX(Math.PI);
    this.schoolBagArrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85
    }));
    this.schoolBagArrow.position.set(x + 0.35, y + 1.5, z);
    this.scene.add(this.schoolBagArrow);

    this.interactiveObjects.schoolBag = {
      position: new THREE.Vector3(x + 0.35, y, z + 0.5),
      radius: 1.8,
      picked: false,
      onInteract: () => this.pickUpSchoolBag()
    };
  }

  pickUpSchoolBag() {
    this.interactiveObjects.schoolBag.picked = true;
    if (this.schoolBagGroup) this.schoolBagGroup.visible = false;
    if (this.schoolBagMarker) this.schoolBagMarker.visible = false;
    if (this.schoolBagArrow) this.schoolBagArrow.visible = false;
  }

  // --- DE SPEURTOCHT: 5 SCHOOLSPULLEN VERSPREID IN HUIS ---
  createSpeurtochtItems() {
    // 1. Schoolagenda / Huiswerkschrift (Slaapkamer boven, in de boekenkast)
    const agendaGroup = new THREE.Group();
    agendaGroup.position.set(-0.22, this.UPPER_Y + 0.59, -4.5);
    const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.34), this.materials.itemBookCover);
    coverMesh.castShadow = true;
    agendaGroup.add(coverMesh);
    const pagesMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.024, 0.32), this.materials.itemPages);
    pagesMesh.position.set(0.005, 0, 0);
    agendaGroup.add(pagesMesh);
    const ribbonMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.12), this.materials.itemAccentRed);
    ribbonMesh.position.set(0, 0.018, 0.16);
    agendaGroup.add(ribbonMesh);
    this.scene.add(agendaGroup);

    const agendaMarker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.52, 24), this.materials.glowMarker);
    agendaMarker.rotation.x = -Math.PI / 2;
    agendaMarker.position.set(-0.95, this.UPPER_Y + 0.005, -4.5);
    this.scene.add(agendaMarker);

    this.speurtochtItems.agenda = {
      id: 'agenda',
      name: 'Schoolagenda',
      icon: '📓',
      hint: 'In de boekenkast in de slaapkamer',
      mesh: agendaGroup,
      marker: agendaMarker,
      baseY: this.UPPER_Y + 0.59,
      animOffset: 0,
      picked: false
    };
    this.interactiveObjects.item_agenda = {
      position: new THREE.Vector3(-0.8, this.UPPER_Y, -4.5),
      radius: 1.6,
      picked: false,
      onInteract: () => this.pickUpSpeurtochtItem('agenda')
    };

    // 2. Drinkfles / Dopper (Beneden in de keuken op het aanrecht)
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(-4.2, this.LOWER_Y + 0.94, -3.45);
    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.24, 16), this.materials.itemBottle);
    bottleBody.castShadow = true;
    bottleGroup.add(bottleBody);
    const bottleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 16), this.materials.chrome);
    bottleNeck.position.set(0, 0.15, 0);
    bottleGroup.add(bottleNeck);
    const bottleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 16), this.materials.itemGold);
    bottleCap.position.set(0, 0.19, 0);
    bottleGroup.add(bottleCap);
    this.scene.add(bottleGroup);

    const bottleMarker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.52, 24), this.materials.glowMarker);
    bottleMarker.rotation.x = -Math.PI / 2;
    bottleMarker.position.set(-4.2, this.LOWER_Y + 0.005, -2.5);
    this.scene.add(bottleMarker);

    this.speurtochtItems.bottle = {
      id: 'bottle',
      name: 'Drinkfles',
      icon: '💧',
      hint: 'Beneden in de keuken op het aanrecht',
      mesh: bottleGroup,
      marker: bottleMarker,
      baseY: this.LOWER_Y + 0.94,
      animOffset: 1.2,
      picked: false
    };
    this.interactiveObjects.item_bottle = {
      position: new THREE.Vector3(-4.2, this.LOWER_Y, -2.5),
      radius: 1.6,
      picked: false,
      onInteract: () => this.pickUpSpeurtochtItem('bottle')
    };

    // 3. Broodtrommel / Lunchbox (Beneden in de hal op een bijzettafeltje)
    const tableMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 0.55), this.materials.woodFurniture);
    tableMesh.position.set(-1.8, this.LOWER_Y + 0.36, 4.2);
    tableMesh.castShadow = true;
    this.scene.add(tableMesh);
    this.colliders.push({
      minX: -2.25, maxX: -1.35,
      minY: this.LOWER_Y, maxY: this.LOWER_Y + 0.8,
      minZ: 3.85, maxZ: 4.55
    });

    const lunchGroup = new THREE.Group();
    lunchGroup.position.set(-1.8, this.LOWER_Y + 0.82, 4.2);
    const lunchBody = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.22), this.materials.itemLunchbox);
    lunchBody.castShadow = true;
    lunchGroup.add(lunchBody);
    const lunchLid = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.24), this.materials.backpackDeskMat);
    lunchLid.position.set(0, 0.075, 0);
    lunchGroup.add(lunchLid);
    this.scene.add(lunchGroup);

    const lunchMarker = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.55, 24), this.materials.glowMarker);
    lunchMarker.rotation.x = -Math.PI / 2;
    lunchMarker.position.set(-1.8, this.LOWER_Y + 0.005, 4.85);
    this.scene.add(lunchMarker);

    this.speurtochtItems.lunchbox = {
      id: 'lunchbox',
      name: 'Broodtrommel',
      icon: '🥪',
      hint: 'Beneden in de hal op het tafeltje',
      mesh: lunchGroup,
      marker: lunchMarker,
      baseY: this.LOWER_Y + 0.82,
      animOffset: 2.4,
      picked: false
    };
    this.interactiveObjects.item_lunchbox = {
      position: new THREE.Vector3(-1.8, this.LOWER_Y, 4.8),
      radius: 1.6,
      picked: false,
      onInteract: () => this.pickUpSpeurtochtItem('lunchbox')
    };

    // 4. Gevulde Etui (Beneden op het dressoir aan de oostwand)
    const sideboardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 1.3), this.materials.woodFurniture);
    sideboardMesh.position.set(5.5, this.LOWER_Y + 0.425, 7.5);
    sideboardMesh.castShadow = true;
    this.scene.add(sideboardMesh);
    this.colliders.push({
      minX: 5.15, maxX: 5.85,
      minY: this.LOWER_Y, maxY: this.LOWER_Y + 0.9,
      minZ: 6.8, maxZ: 8.2
    });

    const pencilGroup = new THREE.Group();
    pencilGroup.position.set(5.35, this.LOWER_Y + 0.94, 7.5);
    const pouchGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.30, 16);
    pouchGeo.rotateX(Math.PI / 2);
    const pouch = new THREE.Mesh(pouchGeo, this.materials.itemPencilCase);
    pouch.castShadow = true;
    pencilGroup.add(pouch);
    const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, 0.28), this.materials.itemGold);
    zipper.position.set(0, 0.065, 0);
    pencilGroup.add(zipper);

    // 2 Potloodjes die uitsteken
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8), this.materials.itemPencilLead);
    p1.rotation.x = Math.PI / 2;
    p1.position.set(-0.02, 0.03, 0.18);
    pencilGroup.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8), this.materials.itemAccentRed);
    p2.rotation.x = Math.PI / 2;
    p2.position.set(0.02, 0.03, 0.17);
    pencilGroup.add(p2);
    this.scene.add(pencilGroup);

    const pencilMarker = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.55, 24), this.materials.glowMarker);
    pencilMarker.rotation.x = -Math.PI / 2;
    pencilMarker.position.set(4.65, this.LOWER_Y + 0.005, 7.5);
    this.scene.add(pencilMarker);

    this.speurtochtItems.pencilcase = {
      id: 'pencilcase',
      name: 'Etui',
      icon: '✏️',
      hint: 'Beneden op het dressoir',
      mesh: pencilGroup,
      marker: pencilMarker,
      baseY: this.LOWER_Y + 0.94,
      animOffset: 3.6,
      picked: false
    };
    this.interactiveObjects.item_pencilcase = {
      position: new THREE.Vector3(4.65, this.LOWER_Y, 7.5),
      radius: 1.6,
      picked: false,
      onInteract: () => this.pickUpSpeurtochtItem('pencilcase')
    };

    // 5. Fietssleutel (Beneden bij de kapstok / sleutelplankje)
    const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.28), this.materials.woodFurniture);
    shelfMesh.position.set(-3.42, this.LOWER_Y + 1.10, 12.5);
    this.scene.add(shelfMesh);

    const keyGroup = new THREE.Group();
    keyGroup.position.set(-3.25, this.LOWER_Y + 1.18, 12.5);
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.007, 8, 16), this.materials.itemGold);
    keyGroup.add(ringMesh);
    const stemMesh = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.11, 0.008), this.materials.itemGold);
    stemMesh.position.set(0, -0.06, 0);
    keyGroup.add(stemMesh);
    const fobMesh = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.065, 0.01), this.materials.potColor);
    fobMesh.position.set(0.05, 0.02, 0);
    keyGroup.add(fobMesh);
    this.scene.add(keyGroup);

    const keyMarker = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.55, 24), this.materials.glowMarker);
    keyMarker.rotation.x = -Math.PI / 2;
    keyMarker.position.set(-2.85, this.LOWER_Y + 0.005, 12.5);
    this.scene.add(keyMarker);

    this.speurtochtItems.key = {
      id: 'key',
      name: 'Fietssleutel',
      icon: '🔑',
      hint: 'Bij de kapstok naast de voordeur',
      mesh: keyGroup,
      marker: keyMarker,
      baseY: this.LOWER_Y + 1.18,
      animOffset: 4.8,
      picked: false
    };
    this.interactiveObjects.item_key = {
      position: new THREE.Vector3(-2.85, this.LOWER_Y, 12.5),
      radius: 1.6,
      picked: false,
      onInteract: () => this.pickUpSpeurtochtItem('key')
    };
  }

  pickUpSpeurtochtItem(id) {
    const item = this.speurtochtItems[id];
    if (item) {
      item.picked = true;
      if (item.mesh) item.mesh.visible = false;
      if (item.marker) item.marker.visible = false;
    }
    if (this.interactiveObjects['item_' + id]) {
      this.interactiveObjects['item_' + id].picked = true;
    }
  }

  resetSpeurtocht() {
    if (this.schoolBagGroup) this.schoolBagGroup.visible = true;
    if (this.schoolBagMarker) this.schoolBagMarker.visible = true;
    if (this.schoolBagArrow) this.schoolBagArrow.visible = true;
    if (this.interactiveObjects.schoolBag) this.interactiveObjects.schoolBag.picked = false;

    for (const key in this.speurtochtItems) {
      const it = this.speurtochtItems[key];
      it.picked = false;
      if (it.mesh) it.mesh.visible = true;
      if (it.marker) it.marker.visible = true;
      if (this.interactiveObjects['item_' + key]) {
        this.interactiveObjects['item_' + key].picked = false;
      }
    }

    if (this.frontDoorGroup) this.frontDoorGroup.rotation.y = 0;
    if (this.frontDoorArrow) this.frontDoorArrow.visible = false;
    if (this.frontDoorMarker) this.frontDoorMarker.visible = false;
    if (this.frontDoorCollider) this.frontDoorCollider.enabled = true;
    if (this.openDoorLeafCollider) this.openDoorLeafCollider.enabled = false;
    if (this.interactiveObjects.frontDoor) this.interactiveObjects.frontDoor.opened = false;

    if (this.carGroup) {
      this.carGroup.position.set(1.5, this.LOWER_Y, 20.0);
      this.carGroup.rotation.set(0, 0, 0);
    }
    if (this.carCollider) {
      this.carCollider.minX = 1.5 - 1.15;
      this.carCollider.maxX = 1.5 + 1.15;
      this.carCollider.minY = this.LOWER_Y;
      this.carCollider.maxY = this.LOWER_Y + 1.8;
      this.carCollider.minZ = 20.0 - 2.1;
      this.carCollider.maxZ = 20.0 + 2.1;
      this.carCollider.enabled = true;
    }
    if (this.carArrow) this.carArrow.visible = false;
    if (this.carMarker) this.carMarker.visible = false;
    if (this.interactiveObjects.car) this.interactiveObjects.car.boarded = false;

    if (this.lockerDoorGroup) this.lockerDoorGroup.rotation.y = 0;
    if (this.lockerArrow) this.lockerArrow.visible = false;
    if (this.lockerMarker) this.lockerMarker.visible = false;
    if (this.lockerItemsGroup) this.lockerItemsGroup.visible = false;
    if (this.interactiveObjects.locker) this.interactiveObjects.locker.opened = false;
    if (this.sinkWaterStream) this.sinkWaterStream.visible = false;
    if (this.interactiveObjects.sink) this.interactiveObjects.sink.active = false;
    if (this.showerParticlesGroup) this.showerParticlesGroup.visible = false;
    if (this.interactiveObjects.shower) this.interactiveObjects.shower.active = false;
    this.closeWardrobe();
    this.resetAlarmClock();
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

  getGroundHeightAt(x, z, currentY = null) {
    const s = this.stairsConfig;

    // Bevindt de positie zich binnen het trapgat/traject?
    if (x >= s.xMin && x <= s.xMax && z >= s.zTop && z <= s.zBottom) {
      const progress = (z - s.zTop) / (s.zBottom - s.zTop);
      const stairY = s.yTop - progress * (s.yTop - s.yBottom);

      // Als de speler/entiteit zich significant onder de trap bevindt (bijv. begane grond):
      if (currentY !== null && currentY < stairY - 0.45) {
        return this.LOWER_Y;
      }

      return stairY;
    }

    // Bovenverdieping vloerbereik (slaapkamer, badkamer, overloop)
    const isUpperBounds = (x >= -8.2 && x <= 6.2 && z >= -8.2 && z <= 1.8);

    // Bepaal of de entiteit zich op de bovenverdieping bevindt:
    // Als currentY niet is opgegeven, val terug op bounds;
    // als currentY wel is opgegeven, controleer of speler zich op de bovenste verdiepingshelft bevindt
    const midY = (this.UPPER_Y + this.LOWER_Y) / 2;
    const isUpperLevel = currentY === null ? (x < s.xMin || z < s.zTop) : (currentY >= midY);

    if (isUpperBounds && isUpperLevel) {
      // Bevindt de speler zich bovenop het matras van het bed?
      if (this.isOnBed(x, z, currentY)) {
        const bedSurfaceY = this.UPPER_Y + 0.55;
        if (currentY === null || currentY >= this.UPPER_Y + 0.35) {
          return bedSurfaceY;
        }
      }
      return this.UPPER_Y;
    }

    // Benedenverdieping: controleer of de speler bovenop de zitting van de bank staat
    if (this.isOnSofa(x, z, currentY)) {
      const sofaSurfaceY = this.LOWER_Y + 0.48;
      if (currentY === null || currentY >= this.LOWER_Y + 0.30) {
        return sofaSurfaceY;
      }
    }

    return this.LOWER_Y;
  }

  isOnSofa(x, z, currentY = null) {
    // Bank zitting bereik beneden: X van -5.5 tot -3.85, Z van 9.5 tot 12.1
    const inSofaBounds = (x >= -5.5 && x <= -3.85 && z >= 9.5 && z <= 12.1);
    if (!inSofaBounds) return false;

    // Alleen op de benedenverdieping
    if (currentY !== null && currentY >= (this.UPPER_Y + this.LOWER_Y) / 2) {
      return false;
    }
    return true;
  }

  isOnStairs(x, z) {
    const s = this.stairsConfig;
    return x >= s.xMin && x <= s.xMax && z >= s.zTop && z <= s.zBottom;
  }

  checkCollision(newX, newZ, radius = 0.35, playerY = 0) {
    const playerFeet = playerY + 0.15;
    const playerHead = playerY + 1.35;

    // Harde perimeterbegrenzing bovenverdieping: speler kan nooit door ramen of buitenmuren heen lopen of vallen
    if (playerFeet >= this.UPPER_Y - 0.2) {
      // Noordelijke buitenmuur en ramen (z = -8.0)
      if (newZ - radius < -7.9) {
        return true;
      }
      // Westelijke buitenmuur slaapkamer (x = -8.0)
      if (newX - radius < -7.9) {
        return true;
      }
      // Oostelijke buitenmuur badkamer/overloop (x = 6.0)
      if (newX + radius > 5.9) {
        return true;
      }
      // Zuidelijke buitenmuur slaapkamer (x < 0, z = 1.5)
      if (newX < 0 && newZ + radius > 1.4) {
        return true;
      }
    }

    for (const box of this.colliders) {
      if (box.enabled === false) continue;
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

    if (this.wardrobeAnimating && this.doorLeft && this.doorRight) {
      if (this.doorLeft.rotation.y > -Math.PI * 0.65) {
        this.doorLeft.rotation.y -= dt * 2.5;
      }
      if (this.doorRight.rotation.y < Math.PI * 0.65) {
        this.doorRight.rotation.y += dt * 2.5;
      }
    }

    if (this.bedBounceAnimating) {
      this.bedBounceTimer += dt * 18;
      const compression = Math.sin(this.bedBounceTimer) * Math.exp(-this.bedBounceTimer * 0.35) * 0.08;
      if (this.mattressMesh) {
        this.mattressMesh.position.y = 0.46 - compression;
        this.mattressMesh.scale.y = 1.0 - compression * 1.5;
      }
      if (this.blanketMesh) {
        this.blanketMesh.position.y = 0.58 - compression;
      }
      if (this.bedBounceTimer > Math.PI * 3.5) {
        this.bedBounceAnimating = false;
        if (this.mattressMesh) {
          this.mattressMesh.position.y = 0.46;
          this.mattressMesh.scale.y = 1.0;
        }
        if (this.blanketMesh) {
          this.blanketMesh.position.y = 0.58;
        }
      }
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

    if (this.alarmArrow && this.alarmArrow.visible) {
      this.alarmArrow.position.y = this.UPPER_Y + 1.45 + Math.sin(elapsed * 4.5) * 0.12;
      this.alarmArrow.rotation.y += dt * 2.0;
    }

    if (this.schoolBagArrow && this.schoolBagArrow.visible) {
      this.schoolBagArrow.position.y = this.UPPER_Y + 1.5 + Math.sin(elapsed * 4.2) * 0.12;
      this.schoolBagArrow.rotation.y += dt * 2.0;
    }

    for (const key in this.speurtochtItems) {
      const it = this.speurtochtItems[key];
      if (!it.picked && it.mesh && it.mesh.visible) {
        it.mesh.rotation.y += dt * 1.6;
        it.mesh.position.y = it.baseY + Math.sin(elapsed * 3.5 + it.animOffset) * 0.05;
      }
    }

    if (this.frontDoorArrow && this.frontDoorArrow.visible) {
      this.frontDoorArrow.position.y = this.LOWER_Y + 2.0 + Math.sin(elapsed * 4.5) * 0.14;
      this.frontDoorArrow.rotation.y += dt * 2.0;
    }

    if (this.carArrow && this.carArrow.visible) {
      this.carArrow.position.y = this.LOWER_Y + 2.5 + Math.sin(elapsed * 4.5) * 0.14;
      this.carArrow.rotation.y += dt * 2.0;
    }

    if (this.lockerArrow && this.lockerArrow.visible) {
      this.lockerArrow.position.y = this.LOWER_Y + 2.0 + Math.sin(elapsed * 4.5) * 0.14;
      this.lockerArrow.rotation.y += dt * 2.0;
    }
  }

  // --- HET TRANSPARANTE DAK VAN HET HUIS ---
  createRoof() {
    this.roofGroup = new THREE.Group();

    const glassMat = this.materials.roofGlass;
    const beamMat = this.materials.roofBeam;
    const gutterMat = this.materials.roofGutter;

    // ==========================================
    // 1. HOOFDDAK (Bovenverdieping: slaapkamer, badkamer, overloop)
    // ==========================================
    // Afmetingen hoofdhuis: x: -8.2 tot 6.2 (nok bij x = -1.0), z: -8.3 tot 1.6
    const mainLength = 9.9; // van z = -8.3 tot 1.6
    const mainZCenter = -3.35;
    const mainEavesY = 6.60;
    const mainRidgeY = 9.00;
    const mainRidgeX = -1.0;
    const mainHalfW = 7.2; // 7.2m links en rechts van de nok
    const mainDy = mainRidgeY - mainEavesY; // 2.4m
    const mainSlopeW = Math.hypot(mainHalfW, mainDy); // ~7.59m
    const mainAngle = Math.atan2(mainDy, mainHalfW); // ~0.322 rad (~18.4°)

    // 1a. Nokbalk (Ridge beam)
    const mainRidgeBeamGeo = new THREE.BoxGeometry(0.18, 0.22, mainLength);
    const mainRidgeBeam = new THREE.Mesh(mainRidgeBeamGeo, beamMat);
    mainRidgeBeam.position.set(mainRidgeX, mainRidgeY, mainZCenter);
    mainRidgeBeam.castShadow = true;
    this.roofGroup.add(mainRidgeBeam);

    // 1b. Dakgoten (Gutters) links en rechts
    const mainGutterGeo = new THREE.BoxGeometry(0.16, 0.14, mainLength + 0.3);
    const mainGutterWest = new THREE.Mesh(mainGutterGeo, gutterMat);
    mainGutterWest.position.set(-8.25, mainEavesY, mainZCenter);
    this.roofGroup.add(mainGutterWest);

    const mainGutterEast = new THREE.Mesh(mainGutterGeo, gutterMat);
    mainGutterEast.position.set(6.25, mainEavesY, mainZCenter);
    this.roofGroup.add(mainGutterEast);

    // 1c. Transparant glazen dakvlak West
    const mainGlassGeo = new THREE.PlaneGeometry(mainSlopeW, mainLength);
    mainGlassGeo.rotateX(-Math.PI / 2);

    const mainRoofWest = new THREE.Mesh(mainGlassGeo, glassMat);
    mainRoofWest.position.set((mainRidgeX - 8.2) / 2, (mainRidgeY + mainEavesY) / 2, mainZCenter);
    mainRoofWest.rotation.z = mainAngle;
    this.roofGroup.add(mainRoofWest);

    // 1d. Transparant glazen dakvlak Oost
    const mainRoofEast = new THREE.Mesh(mainGlassGeo, glassMat);
    mainRoofEast.position.set((mainRidgeX + 6.2) / 2, (mainRidgeY + mainEavesY) / 2, mainZCenter);
    mainRoofEast.rotation.z = -mainAngle;
    this.roofGroup.add(mainRoofEast);

    // 1e. Dakspanten (Rafters) over het hoofddak (om de ~2 meter)
    const rafterGeo = new THREE.BoxGeometry(mainSlopeW, 0.08, 0.08);
    rafterGeo.rotateX(-Math.PI / 2);

    for (let z = -8.2; z <= 1.61; z += 1.96) {
      // West spant
      const rWest = new THREE.Mesh(rafterGeo, beamMat);
      rWest.position.set((mainRidgeX - 8.2) / 2, (mainRidgeY + mainEavesY) / 2, z);
      rWest.rotation.z = mainAngle;
      rWest.castShadow = true;
      this.roofGroup.add(rWest);

      // Oost spant
      const rEast = new THREE.Mesh(rafterGeo, beamMat);
      rEast.position.set((mainRidgeX + 6.2) / 2, (mainRidgeY + mainEavesY) / 2, z);
      rEast.rotation.z = -mainAngle;
      rEast.castShadow = true;
      this.roofGroup.add(rEast);
    }

    // 1f. Noordelijke topgevel (Puntgevel bij z = -8.3)
    const northGableGeo = new THREE.BufferGeometry();
    const nVertices = new Float32Array([
      -8.2, mainEavesY, -8.3,
      6.2, mainEavesY, -8.3,
      mainRidgeX, mainRidgeY, -8.3
    ]);
    northGableGeo.setAttribute('position', new THREE.BufferAttribute(nVertices, 3));
    northGableGeo.computeVertexNormals();
    const northGableMesh = new THREE.Mesh(northGableGeo, glassMat);
    this.roofGroup.add(northGableMesh);

    // Schuin frame langs noordelijke puntgevel
    const nRakeGeo = new THREE.BoxGeometry(mainSlopeW, 0.12, 0.12);
    nRakeGeo.rotateX(-Math.PI / 2);
    const nRakeW = new THREE.Mesh(nRakeGeo, beamMat);
    nRakeW.position.set((mainRidgeX - 8.2) / 2, (mainRidgeY + mainEavesY) / 2, -8.3);
    nRakeW.rotation.z = mainAngle;
    this.roofGroup.add(nRakeW);

    const nRakeE = new THREE.Mesh(nRakeGeo, beamMat);
    nRakeE.position.set((mainRidgeX + 6.2) / 2, (mainRidgeY + mainEavesY) / 2, -8.3);
    nRakeE.rotation.z = -mainAngle;
    this.roofGroup.add(nRakeE);

    // ==========================================
    // 2. AANBOUWDAK (Benedenverdieping zuid: hal, garderobe, living, voordeur)
    // ==========================================
    // Afmetingen: x: -8.2 tot 7.2 (nok bij x = -0.5), z: 1.5 tot 13.8
    const frontLength = 12.3;
    const frontZCenter = 7.65;
    const frontEavesY = 3.35;
    const frontRidgeY = 5.20;
    const frontRidgeX = -0.5;
    const frontHalfW = 7.7;
    const frontDy = frontRidgeY - frontEavesY; // 1.85m
    const frontSlopeW = Math.hypot(frontHalfW, frontDy); // ~7.92m
    const frontAngle = Math.atan2(frontDy, frontHalfW); // ~0.236 rad (~13.5°)

    // 2a. Nokbalk aanbouwdak
    const frontRidgeBeamGeo = new THREE.BoxGeometry(0.18, 0.20, frontLength);
    const frontRidgeBeam = new THREE.Mesh(frontRidgeBeamGeo, beamMat);
    frontRidgeBeam.position.set(frontRidgeX, frontRidgeY, frontZCenter);
    frontRidgeBeam.castShadow = true;
    this.roofGroup.add(frontRidgeBeam);

    // 2b. Dakgoten aanbouwdak
    const frontGutterGeo = new THREE.BoxGeometry(0.16, 0.14, frontLength + 0.3);
    const frontGutterWest = new THREE.Mesh(frontGutterGeo, gutterMat);
    frontGutterWest.position.set(-8.25, frontEavesY, frontZCenter);
    this.roofGroup.add(frontGutterWest);

    const frontGutterEast = new THREE.Mesh(frontGutterGeo, gutterMat);
    frontGutterEast.position.set(7.25, frontEavesY, frontZCenter);
    this.roofGroup.add(frontGutterEast);

    // 2c. Transparant glazen dakvlak West
    const frontGlassGeo = new THREE.PlaneGeometry(frontSlopeW, frontLength);
    frontGlassGeo.rotateX(-Math.PI / 2);

    const frontRoofWest = new THREE.Mesh(frontGlassGeo, glassMat);
    frontRoofWest.position.set((frontRidgeX - 8.2) / 2, (frontRidgeY + frontEavesY) / 2, frontZCenter);
    frontRoofWest.rotation.z = frontAngle;
    this.roofGroup.add(frontRoofWest);

    // 2d. Transparant glazen dakvlak Oost
    const frontRoofEast = new THREE.Mesh(frontGlassGeo, glassMat);
    frontRoofEast.position.set((frontRidgeX + 7.2) / 2, (frontRidgeY + frontEavesY) / 2, frontZCenter);
    frontRoofEast.rotation.z = -frontAngle;
    this.roofGroup.add(frontRoofEast);

    // 2e. Dakspanten over het aanbouwdak (om de ~2.4m)
    const fRafterGeo = new THREE.BoxGeometry(frontSlopeW, 0.08, 0.08);
    fRafterGeo.rotateX(-Math.PI / 2);

    for (let z = 1.6; z <= 13.81; z += 2.44) {
      const rWest = new THREE.Mesh(fRafterGeo, beamMat);
      rWest.position.set((frontRidgeX - 8.2) / 2, (frontRidgeY + frontEavesY) / 2, z);
      rWest.rotation.z = frontAngle;
      rWest.castShadow = true;
      this.roofGroup.add(rWest);

      const rEast = new THREE.Mesh(fRafterGeo, beamMat);
      rEast.position.set((frontRidgeX + 7.2) / 2, (frontRidgeY + frontEavesY) / 2, z);
      rEast.rotation.z = -frontAngle;
      rEast.castShadow = true;
      this.roofGroup.add(rEast);
    }

    // 2f. Zuidelijke topgevel (Voorgevel bij z = 13.8)
    const southGableGeo = new THREE.BufferGeometry();
    const sVertices = new Float32Array([
      -8.2, frontEavesY, 13.8,
      7.2, frontEavesY, 13.8,
      frontRidgeX, frontRidgeY, 13.8
    ]);
    southGableGeo.setAttribute('position', new THREE.BufferAttribute(sVertices, 3));
    southGableGeo.computeVertexNormals();
    const southGableMesh = new THREE.Mesh(southGableGeo, glassMat);
    this.roofGroup.add(southGableMesh);

    // Schuin frame langs zuidelijke voorgevel
    const sRakeGeo = new THREE.BoxGeometry(frontSlopeW, 0.12, 0.12);
    sRakeGeo.rotateX(-Math.PI / 2);
    const sRakeW = new THREE.Mesh(sRakeGeo, beamMat);
    sRakeW.position.set((frontRidgeX - 8.2) / 2, (frontRidgeY + frontEavesY) / 2, 13.8);
    sRakeW.rotation.z = frontAngle;
    this.roofGroup.add(sRakeW);

    const sRakeE = new THREE.Mesh(sRakeGeo, beamMat);
    sRakeE.position.set((frontRidgeX + 7.2) / 2, (frontRidgeY + frontEavesY) / 2, 13.8);
    sRakeE.rotation.z = -frontAngle;
    this.roofGroup.add(sRakeE);

    this.scene.add(this.roofGroup);
  }

  // --- BUITENOMGEVING, STRAAT & VOORTUIN ---
  createOutdoorEnvironment() {
    const y = this.LOWER_Y;

    // 0. Achtertuin achter het huis (zichtbaar door de slaapkamer- en gangramen)
    const backyardGeo = new THREE.PlaneGeometry(50.0, 35.0);
    backyardGeo.rotateX(-Math.PI / 2);
    const backyard = new THREE.Mesh(backyardGeo, this.materials.grass);
    backyard.position.set(-2.0, y + 0.001, -25.5);
    backyard.receiveShadow = true;
    this.scene.add(backyard);

    // Bomen in de achtertuin
    this.createTree(-5.0, y, -15.5);
    this.createTree(-1.8, y, -18.5);
    this.createTree(-8.5, y, -13.5);
    this.createTree(3.2, y, -16.0);

    // 1. Voortuin & Paden
    // Betegeld tuinpad van voordeur (z: 13.5) naar oprit (z: 23.0)
    const pathGeo = new THREE.PlaneGeometry(1.8, 9.5);
    pathGeo.rotateX(-Math.PI / 2);
    const path = new THREE.Mesh(pathGeo, this.materials.gardenPavement);
    path.position.set(1.5, y + 0.003, 18.25);
    path.receiveShadow = true;
    this.scene.add(path);

    // Verhoogde stenen bordes bij de voordeur
    const porchGeo = new THREE.BoxGeometry(2.2, 0.08, 1.2);
    const porch = new THREE.Mesh(porchGeo, this.materials.gardenPavement);
    porch.position.set(1.5, y + 0.04, 14.1);
    porch.receiveShadow = true;
    this.scene.add(porch);

    // Oprit voor de auto
    const drivewayGeo = new THREE.PlaneGeometry(4.2, 9.5);
    drivewayGeo.rotateX(-Math.PI / 2);
    const driveway = new THREE.Mesh(drivewayGeo, this.materials.drivewayAsphalt);
    driveway.position.set(1.5, y + 0.002, 18.25);
    driveway.receiveShadow = true;
    this.scene.add(driveway);

    // Grasveld links en rechts van de voortuin
    const lawnLeftGeo = new THREE.PlaneGeometry(10.0, 9.5);
    lawnLeftGeo.rotateX(-Math.PI / 2);
    const lawnLeft = new THREE.Mesh(lawnLeftGeo, this.materials.grass);
    lawnLeft.position.set(-5.5, y + 0.001, 18.25);
    lawnLeft.receiveShadow = true;
    this.scene.add(lawnLeft);

    const lawnRightGeo = new THREE.PlaneGeometry(10.0, 9.5);
    lawnRightGeo.rotateX(-Math.PI / 2);
    const lawnRight = new THREE.Mesh(lawnRightGeo, this.materials.grass);
    lawnRight.position.set(8.5, y + 0.001, 18.25);
    lawnRight.receiveShadow = true;
    this.scene.add(lawnRight);

    // Zijtuinen langs het huis (zichtbaar door de west- en oostramen)
    const sideLawnWestGeo = new THREE.PlaneGeometry(6.0, 21.5);
    sideLawnWestGeo.rotateX(-Math.PI / 2);
    const sideLawnWest = new THREE.Mesh(sideLawnWestGeo, this.materials.grass);
    sideLawnWest.position.set(-11.0, y + 0.001, 2.75);
    sideLawnWest.receiveShadow = true;
    this.scene.add(sideLawnWest);

    const sideLawnEastGeo = new THREE.PlaneGeometry(6.0, 21.5);
    sideLawnEastGeo.rotateX(-Math.PI / 2);
    const sideLawnEast = new THREE.Mesh(sideLawnEastGeo, this.materials.grass);
    sideLawnEast.position.set(10.0, y + 0.001, 2.75);
    sideLawnEast.receiveShadow = true;
    this.scene.add(sideLawnEast);

    // Bomen in de zijtuinen (zichtbaar vanuit slaapkamer, eethoek en living)
    this.createTree(-11.0, y, 1.5);
    this.createTree(-11.5, y, -4.5);
    this.createTree(10.5, y, 4.0);
    this.createTree(10.5, y, -3.5);

    // Houten tuinhekjes langs de perceelsgrenzen
    this.addWall(-8.2, y + 0.45, 18.25, 0.15, 0.9, 9.5, this.materials.fenceWood);
    this.addWall(8.2, y + 0.45, 18.25, 0.15, 0.9, 9.5, this.materials.fenceWood);
    this.addWall(-14.0, y + 0.45, 2.75, 0.15, 0.9, 21.5, this.materials.fenceWood);
    this.addWall(13.0, y + 0.45, 2.75, 0.15, 0.9, 21.5, this.materials.fenceWood);

    // 2. De Straat naar School (z: 23.0 tot 78.0)
    const roadLength = 56.0;
    const roadZCenter = 23.0 + roadLength / 2; // 51.0
    const roadGeo = new THREE.PlaneGeometry(8.5, roadLength);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.materials.roadAsphalt);
    road.position.set(0, y + 0.002, roadZCenter);
    road.receiveShadow = true;
    this.scene.add(road);

    // Witte middenstrepen op de weg
    const stripeCount = 14;
    for (let i = 0; i < stripeCount; i++) {
      const stripeGeo = new THREE.PlaneGeometry(0.2, 2.2);
      stripeGeo.rotateX(-Math.PI / 2);
      const stripe = new THREE.Mesh(stripeGeo, this.materials.roadMarking);
      stripe.position.set(0, y + 0.004, 25.0 + i * 3.8);
      this.scene.add(stripe);
    }

    // Trottoir / Stoep links en rechts
    const sidewalkGeo = new THREE.BoxGeometry(2.5, 0.14, roadLength);
    const sidewalkLeft = new THREE.Mesh(sidewalkGeo, this.materials.sidewalkMat);
    sidewalkLeft.position.set(-5.5, y + 0.07, roadZCenter);
    sidewalkLeft.receiveShadow = true;
    this.scene.add(sidewalkLeft);

    const sidewalkRight = new THREE.Mesh(sidewalkGeo, this.materials.sidewalkMat);
    sidewalkRight.position.set(5.5, y + 0.07, roadZCenter);
    sidewalkRight.receiveShadow = true;
    this.scene.add(sidewalkRight);

    // Grasstroken naast de stoepen
    const grassStripLeft = new THREE.Mesh(new THREE.PlaneGeometry(16.0, roadLength), this.materials.grass);
    grassStripLeft.rotateX(-Math.PI / 2);
    grassStripLeft.position.set(-14.5, y + 0.001, roadZCenter);
    this.scene.add(grassStripLeft);

    const grassStripRight = new THREE.Mesh(new THREE.PlaneGeometry(16.0, roadLength), this.materials.grass);
    grassStripRight.rotateX(-Math.PI / 2);
    grassStripRight.position.set(14.5, y + 0.001, roadZCenter);
    this.scene.add(grassStripRight);

    // Zebrapad bij z = 72 vlak voor de school
    for (let k = -3.2; k <= 3.2; k += 0.9) {
      const zStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3.2), this.materials.roadMarking);
      zStripe.rotateX(-Math.PI / 2);
      zStripe.position.set(k, y + 0.005, 72.0);
      this.scene.add(zStripe);
    }

    // Bomen en straatlantaarns langs de weg
    const treePositions = [
      { x: -5.5, z: 28.0 }, { x: 5.5, z: 32.0 },
      { x: -5.5, z: 42.0 }, { x: 5.5, z: 46.0 },
      { x: -5.5, z: 56.0 }, { x: 5.5, z: 60.0 },
      { x: -5.5, z: 69.0 }, { x: 5.5, z: 70.0 }
    ];
    for (const pos of treePositions) {
      this.createTree(pos.x, y + 0.14, pos.z);
    }

    // Straatlantaarns
    const lampPositions = [
      { x: -4.4, z: 35.0 }, { x: 4.4, z: 49.0 }, { x: -4.4, z: 63.0 }
    ];
    for (const lp of lampPositions) {
      this.createStreetLamp(lp.x, y + 0.14, lp.z);
    }

    // Verkeersbord "School 🚸 Zone 30"
    this.createSchoolRoadSign(4.5, y + 0.14, 65.0);
  }

  createTree(x, y, z) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Stam
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.28, 2.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
    trunk.position.set(0, 1.1, 0);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Bladeren (twee bollen)
    const leavesGeo1 = new THREE.DodecahedronGeometry(1.3, 1);
    const leaves1 = new THREE.Mesh(leavesGeo1, this.materials.treeLeaves);
    leaves1.position.set(0, 2.8, 0);
    leaves1.castShadow = true;
    treeGroup.add(leaves1);

    const leavesGeo2 = new THREE.DodecahedronGeometry(1.0, 1);
    const leaves2 = new THREE.Mesh(leavesGeo2, this.materials.treeLeaves2);
    leaves2.position.set(0, 3.8, 0);
    leaves2.castShadow = true;
    treeGroup.add(leaves2);

    this.scene.add(treeGroup);
  }

  createStreetLamp(x, y, z) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, y, z);

    const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.metal);
    pole.position.set(0, 2.1, 0);
    lampGroup.add(pole);

    const armGeo = new THREE.BoxGeometry(0.8, 0.06, 0.06);
    const arm = new THREE.Mesh(armGeo, this.materials.metal);
    arm.position.set(x > 0 ? -0.35 : 0.35, 4.15, 0);
    lampGroup.add(arm);

    const bulbGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(x > 0 ? -0.7 : 0.7, 4.05, 0);
    lampGroup.add(bulb);

    this.scene.add(lampGroup);
  }

  createSchoolRoadSign(x, y, z) {
    const signGroup = new THREE.Group();
    signGroup.position.set(x, y, z);

    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.metal);
    pole.position.set(0, 1.1, 0);
    signGroup.add(pole);

    // Bord
    const signPlateGeo = new THREE.BoxGeometry(0.65, 0.65, 0.04);
    const signPlateMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
    const signPlate = new THREE.Mesh(signPlateGeo, signPlateMat);
    signPlate.position.set(0, 2.0, 0);
    signGroup.add(signPlate);

    const borderGeo = new THREE.BoxGeometry(0.72, 0.72, 0.03);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 2.0, -0.01);
    signGroup.add(border);

    this.scene.add(signGroup);
  }

  // --- DE AUTO ---
  createCar() {
    const x = 1.5;
    const y = this.LOWER_Y;
    const z = 20.0;

    this.carGroup = new THREE.Group();
    this.carGroup.position.set(x, y, z);

    // 1. Onderstel / Chassis
    const chassisGeo = new THREE.BoxGeometry(2.0, 0.62, 3.8);
    const chassis = new THREE.Mesh(chassisGeo, this.materials.carPaint);
    chassis.position.set(0, 0.52, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.carGroup.add(chassis);

    // Bumpers
    const bumperFrontGeo = new THREE.BoxGeometry(2.04, 0.22, 0.16);
    const bumperFront = new THREE.Mesh(bumperFrontGeo, this.materials.metal);
    bumperFront.position.set(0, 0.38, 1.95);
    this.carGroup.add(bumperFront);

    const bumperRear = new THREE.Mesh(bumperFrontGeo, this.materials.metal);
    bumperRear.position.set(0, 0.38, -1.95);
    this.carGroup.add(bumperRear);

    // 2. Cabine & Dak
    const cabinGeo = new THREE.BoxGeometry(1.8, 0.65, 2.1);
    const cabin = new THREE.Mesh(cabinGeo, this.materials.carPaint);
    cabin.position.set(0, 1.15, -0.2);
    cabin.castShadow = true;
    this.carGroup.add(cabin);

    // Voorruit
    const windshieldGeo = new THREE.PlaneGeometry(1.68, 0.62);
    const windshield = new THREE.Mesh(windshieldGeo, this.materials.carGlass);
    windshield.position.set(0, 1.14, 0.88);
    windshield.rotation.x = -Math.PI / 7;
    this.carGroup.add(windshield);

    // Achterruit
    const rearWindowGeo = new THREE.PlaneGeometry(1.68, 0.58);
    const rearWindow = new THREE.Mesh(rearWindowGeo, this.materials.carGlass);
    rearWindow.position.set(0, 1.14, -1.28);
    rearWindow.rotation.x = Math.PI / 8;
    this.carGroup.add(rearWindow);

    // Zijramen
    const sideWindowGeo = new THREE.PlaneGeometry(1.9, 0.48);
    const leftWindow = new THREE.Mesh(sideWindowGeo, this.materials.carGlass);
    leftWindow.position.set(-0.91, 1.14, -0.2);
    leftWindow.rotation.y = -Math.PI / 2;
    this.carGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeo, this.materials.carGlass);
    rightWindow.position.set(0.91, 1.14, -0.2);
    rightWindow.rotation.y = Math.PI / 2;
    this.carGroup.add(rightWindow);

    // 3. Wielen
    this.carWheels = [];
    const wheelPositions = [
      { x: -1.02, y: 0.34, z: 1.15 },
      { x: 1.02, y: 0.34, z: 1.15 },
      { x: -1.02, y: 0.34, z: -1.15 },
      { x: 1.02, y: 0.34, z: -1.15 }
    ];

    for (const wp of wheelPositions) {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wp.x, wp.y, wp.z);

      const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 16);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, this.materials.carTire);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rimGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.25, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, this.materials.carRim);
      wheelGroup.add(rim);

      this.carGroup.add(wheelGroup);
      this.carWheels.push(wheelGroup);
    }

    // 4. Koplampen en Achterlichten
    const hlGeo = new THREE.BoxGeometry(0.32, 0.16, 0.08);
    const hlLeft = new THREE.Mesh(hlGeo, this.materials.carHeadlight);
    hlLeft.position.set(-0.68, 0.58, 1.91);
    this.carGroup.add(hlLeft);

    const hlRight = new THREE.Mesh(hlGeo, this.materials.carHeadlight);
    hlRight.position.set(0.68, 0.58, 1.91);
    this.carGroup.add(hlRight);

    // Achterlichten
    const tlLeft = new THREE.Mesh(hlGeo, this.materials.carTaillight);
    tlLeft.position.set(-0.68, 0.58, -1.91);
    this.carGroup.add(tlLeft);

    const tlRight = new THREE.Mesh(hlGeo, this.materials.carTaillight);
    tlRight.position.set(0.68, 0.58, -1.91);
    this.carGroup.add(tlRight);

    this.scene.add(this.carGroup);

    // Gouden vloermarker en zwevende richtingspijl
    const carMarkerGeo = new THREE.RingGeometry(0.8, 1.2, 32);
    carMarkerGeo.rotateX(-Math.PI / 2);
    this.carMarker = new THREE.Mesh(carMarkerGeo, new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide
    }));
    this.carMarker.position.set(x, y + 0.01, z);
    this.carMarker.visible = false;
    this.scene.add(this.carMarker);

    const carArrowGeo = new THREE.ConeGeometry(0.32, 0.65, 16);
    carArrowGeo.rotateX(Math.PI);
    this.carArrow = new THREE.Mesh(carArrowGeo, new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9
    }));
    this.carArrow.position.set(x, y + 2.5, z);
    this.carArrow.visible = false;
    this.scene.add(this.carArrow);

    this.interactiveObjects.car = {
      position: new THREE.Vector3(x, y, z),
      radius: 3.2,
      onInteract: () => {}
    };

    // Stevige collider voor de geparkeerde auto op de oprit
    this.carCollider = {
      minX: x - 1.15, maxX: x + 1.15,
      minY: y, maxY: y + 1.8,
      minZ: z - 2.1, maxZ: z + 2.1,
      enabled: true
    };
    this.colliders.push(this.carCollider);
  }

  // --- HET SCHOOLGEBOUW & KLUISJES ---
  createSchoolAndLockers() {
    const y = this.LOWER_Y;
    const schoolZ = 86.0;

    // 1. Schoolplein & Kiss & Ride parkeerhaven (z: 76.0 tot 86.0)
    const yardGeo = new THREE.PlaneGeometry(24.0, 10.0);
    yardGeo.rotateX(-Math.PI / 2);
    const yard = new THREE.Mesh(yardGeo, this.materials.gardenPavement);
    yard.position.set(0, y + 0.003, 81.0);
    yard.receiveShadow = true;
    this.scene.add(yard);

    // Gele markering Kiss & Ride parkeervak voor de school (x: -2 tot 3, z: 75.0 tot 79.0)
    const krLineGeo = new THREE.PlaneGeometry(0.2, 5.0);
    krLineGeo.rotateX(-Math.PI / 2);
    const krLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const krLineLeft = new THREE.Mesh(krLineGeo, krLineMat);
    krLineLeft.position.set(-1.2, y + 0.006, 76.5);
    this.scene.add(krLineLeft);

    const krLineRight = new THREE.Mesh(krLineGeo, krLineMat);
    krLineRight.position.set(2.2, y + 0.006, 76.5);
    this.scene.add(krLineRight);

    // Fietsenrek op het schoolplein (x: -7.5, z: 81.0)
    const bikeRackGeo = new THREE.BoxGeometry(3.5, 0.7, 0.4);
    const bikeRack = new THREE.Mesh(bikeRackGeo, this.materials.metal);
    bikeRack.position.set(-7.5, y + 0.35, 81.0);
    this.scene.add(bikeRack);

    // 2. School Voorgevel (z = 86.0)
    // Linker voorgevel (x = -12.0 tot -1.6, breedte 10.4)
    this.addWall(-6.8, y + 3.0, schoolZ, 10.4, 6.0, 0.3, this.materials.schoolBrick);
    // Rechter voorgevel (x = 1.6 tot 12.0, breedte 10.4)
    this.addWall(6.8, y + 3.0, schoolZ, 10.4, 6.0, 0.3, this.materials.schoolBrick);
    // Boven de ingang (x = -1.6 tot 1.6, y = 3.2 tot 6.0)
    this.addWall(0, y + 4.6, schoolZ, 3.2, 2.8, 0.3, this.materials.schoolBrick);

    // Grote ramen in de schoolgevel
    const windowMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.1, metalness: 0.2 });
    const winLeft = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.2), windowMat);
    winLeft.position.set(-6.5, y + 3.2, schoolZ - 0.16);
    this.scene.add(winLeft);

    const winRight = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.2), windowMat);
    winRight.position.set(6.5, y + 3.2, schoolZ - 0.16);
    this.scene.add(winRight);

    // Entree overkapping & Naambord
    const canopyGeo = new THREE.BoxGeometry(4.2, 0.2, 2.2);
    const canopy = new THREE.Mesh(canopyGeo, this.materials.schoolDoorMat);
    canopy.position.set(0, y + 3.3, schoolZ - 1.1);
    this.scene.add(canopy);

    // Schoolnaambord: "BASISSCHOOL DE WISSEL"
    const signBoardGeo = new THREE.BoxGeometry(3.6, 0.65, 0.08);
    const signBoardMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
    signBoard.position.set(0, y + 4.0, schoolZ - 0.18);
    this.scene.add(signBoard);

    // Schoolklok boven ingang
    const clockGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24);
    clockGeo.rotateX(Math.PI / 2);
    const clockFace = new THREE.Mesh(clockGeo, this.materials.porcelain);
    clockFace.position.set(0, y + 5.0, schoolZ - 0.17);
    this.scene.add(clockFace);

    // 3. Schoolgang Binnen (z: 86.0 tot 105.0, x: -6.0 tot 6.0)
    const hallwayLength = 19.0;
    const hallwayZCenter = 86.0 + hallwayLength / 2; // 95.5

    // Vloer schoolgang
    const hallFloorGeo = new THREE.BoxGeometry(12.0, 0.2, hallwayLength);
    const hallFloor = new THREE.Mesh(hallFloorGeo, this.materials.schoolFloorCheck);
    hallFloor.position.set(0, y - 0.1, hallwayZCenter);
    hallFloor.receiveShadow = true;
    this.scene.add(hallFloor);

    // Binnenwanden van de schoolgang
    // Linkerwand (x = -6.0)
    this.addWall(-6.0, y + 2.0, hallwayZCenter, 0.2, 4.0, hallwayLength, this.materials.schoolWallInterior);
    // Rechterwand (x = 6.0)
    this.addWall(6.0, y + 2.0, hallwayZCenter, 0.2, 4.0, hallwayLength, this.materials.schoolWallInterior);
    // Achterwand (z = 105.0)
    this.addWall(0, y + 2.0, 105.0, 12.0, 4.0, 0.2, this.materials.schoolWallInterior);

    // Plafond schoolgang
    const ceilingGeo = new THREE.BoxGeometry(12.0, 0.2, hallwayLength);
    const ceiling = new THREE.Mesh(ceilingGeo, this.materials.wallUpper);
    ceiling.position.set(0, y + 4.0, hallwayZCenter);
    this.scene.add(ceiling);
    this.cameraOccluders.push(ceiling);

    // Verlichting in de schoolgang
    const hallLight1 = new THREE.PointLight(0xfff7ed, 0.9, 12);
    hallLight1.position.set(0, y + 3.4, 91.0);
    this.scene.add(hallLight1);

    const hallLight2 = new THREE.PointLight(0xfff7ed, 0.9, 12);
    hallLight2.position.set(0, y + 3.4, 99.0);
    this.scene.add(hallLight2);

    // Klaslokaaldeuren op de rechterwand (x = 5.9)
    const classDoors = [
      { z: 90.0, label: 'Groep 3' },
      { z: 95.0, label: 'Groep 4' },
      { z: 100.0, label: 'Groep 5' }
    ];
    for (const cd of classDoors) {
      const cDoorGeo = new THREE.BoxGeometry(0.08, 2.4, 1.3);
      const cDoor = new THREE.Mesh(cDoorGeo, this.materials.schoolDoorMat);
      cDoor.position.set(5.88, y + 1.2, cd.z);
      this.scene.add(cDoor);
    }

    // 4. De Kluisjeswand (Kluisjes) op de linkerwand (x = -5.7, z: 92.0 tot 96.0)
    this.createLockersBank(-5.7, y, 94.0);
  }

  createLockersBank(x, y, z) {
    const colors = [
      this.materials.lockerYellow,
      this.materials.lockerBlue,
      this.materials.lockerGreen,
      this.materials.lockerPink
    ];

    const lockerWidth = 0.8;
    const lockerDepth = 0.55;
    const lockerHeight = 1.1;

    for (let col = 0; col < 4; col++) {
      const lz = z - 1.2 + col * lockerWidth;
      for (let row = 0; row < 2; row++) {
        const ly = y + 0.1 + row * lockerHeight;
        const colorMat = colors[(col + row) % colors.length];

        // Behuizing
        const boxGeo = new THREE.BoxGeometry(lockerDepth, lockerHeight - 0.04, lockerWidth - 0.04);
        const box = new THREE.Mesh(boxGeo, this.materials.lockerInside);
        box.position.set(x + lockerDepth / 2, ly + lockerHeight / 2, lz);
        this.scene.add(box);

        // Deur (Kluisje #7 is bij col=2, row=1)
        const isPlayerLocker = (col === 2 && row === 1);

        if (isPlayerLocker) {
          this.lockerDoorGroup = new THREE.Group();
          this.lockerDoorGroup.position.set(x + lockerDepth, ly + lockerHeight / 2, lz - (lockerWidth - 0.04) / 2);

          const pDoorGeo = new THREE.BoxGeometry(0.04, lockerHeight - 0.06, lockerWidth - 0.06);
          const pDoorMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            emissiveIntensity: 0.35,
            metalness: 0.4,
            roughness: 0.3
          });
          const pDoor = new THREE.Mesh(pDoorGeo, pDoorMat);
          pDoor.position.set(0, 0, (lockerWidth - 0.06) / 2);
          this.lockerDoorGroup.add(pDoor);

          // Gouden nummerbordje "7"
          const badgeGeo = new THREE.BoxGeometry(0.05, 0.18, 0.24);
          const badge = new THREE.Mesh(badgeGeo, this.materials.itemGold);
          badge.position.set(0.02, 0.18, (lockerWidth - 0.06) / 2);
          this.lockerDoorGroup.add(badge);

          // Handvat
          const hGeo = new THREE.BoxGeometry(0.06, 0.12, 0.03);
          const handle = new THREE.Mesh(hGeo, this.materials.chrome);
          handle.position.set(0.03, -0.05, (lockerWidth - 0.06) / 2 + 0.22);
          this.lockerDoorGroup.add(handle);

          this.scene.add(this.lockerDoorGroup);

          // Spullen die in het kluisje verschijnen
          this.lockerItemsGroup = new THREE.Group();
          this.lockerItemsGroup.position.set(x + lockerDepth / 2, ly + 0.25, lz);
          this.lockerItemsGroup.visible = false;

          // Mini rugzakje
          const miniBag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.22), this.materials.backpackDeskMat);
          miniBag.position.set(0, 0.15, -0.1);
          this.lockerItemsGroup.add(miniBag);

          // Mini broodtrommel + drinkfles
          const miniLunch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.14), this.materials.itemLunchbox);
          miniLunch.position.set(0.05, 0.05, 0.12);
          this.lockerItemsGroup.add(miniLunch);

          const miniBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 10), this.materials.itemBottle);
          miniBottle.position.set(-0.1, 0.11, 0.12);
          this.lockerItemsGroup.add(miniBottle);

          this.scene.add(this.lockerItemsGroup);
        } else {
          const doorGeo = new THREE.BoxGeometry(0.04, lockerHeight - 0.06, lockerWidth - 0.06);
          const door = new THREE.Mesh(doorGeo, colorMat);
          door.position.set(x + lockerDepth, ly + lockerHeight / 2, lz);
          this.scene.add(door);

          const numGeo = new THREE.BoxGeometry(0.05, 0.14, 0.18);
          const num = new THREE.Mesh(numGeo, this.materials.chrome);
          num.position.set(x + lockerDepth + 0.01, ly + lockerHeight / 2 + 0.18, lz);
          this.scene.add(num);
        }
      }
    }

    // Collider voor de kluisjesbank
    this.colliders.push({
      minX: x, maxX: x + lockerDepth + 0.1,
      minY: y, maxY: y + 2.4,
      minZ: z - 1.6, maxZ: z + 1.8
    });

    // Gouden vloermarker voor kluisje #7
    const markerGeo = new THREE.RingGeometry(0.45, 0.70, 32);
    markerGeo.rotateX(-Math.PI / 2);
    this.lockerMarker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    }));
    this.lockerMarker.position.set(x + lockerDepth + 0.6, y + 0.01, z + 0.4);
    this.lockerMarker.visible = false;
    this.scene.add(this.lockerMarker);

    // Zwevende pijl boven kluisje #7
    const arrowGeo = new THREE.ConeGeometry(0.24, 0.48, 16);
    arrowGeo.rotateX(Math.PI);
    this.lockerArrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.9
    }));
    this.lockerArrow.position.set(x + lockerDepth + 0.6, y + 2.0, z + 0.4);
    this.lockerArrow.visible = false;
    this.scene.add(this.lockerArrow);

    this.interactiveObjects.locker = {
      position: new THREE.Vector3(x + lockerDepth + 0.6, y, z + 0.4),
      radius: 2.2,
      opened: false,
      onInteract: () => this.openLocker()
    };
  }

  openLocker() {
    this.interactiveObjects.locker.opened = true;
    if (this.lockerDoorGroup) {
      this.lockerDoorGroup.rotation.y = Math.PI / 1.9;
    }
    if (this.lockerItemsGroup) {
      this.lockerItemsGroup.visible = true;
    }
    if (this.lockerArrow) this.lockerArrow.visible = false;
    if (this.lockerMarker) this.lockerMarker.visible = false;
  }
}
