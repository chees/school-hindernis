import * as THREE from 'three';

export class Player {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    // Fysica & beweging parameters
    this.position = new THREE.Vector3(-5.8, world.UPPER_Y + 0.65, -5.5); // Start in bed
    this.velocity = new THREE.Vector3();
    this.rotation = -Math.PI / 2; // Kijkt richting voeteneinde
    this.speed = 3.8;
    this.jumpForce = 6.2;
    this.gravity = -18.0;
    this.isGrounded = true;
    this.radius = 0.35;

    // Speler toestand & aanpassingen
    this.state = 'SLEEPING'; // SLEEPING, WAKING, ACTIVE
    this.isDressed = false;
    this.hasBackpack = false;
    this.toiletNeed = 100; // 100% hoge nood bij het wakker worden!
    this.toiletWiggleTimer = 0;
    this.walkCycle = 0;
    this.stepTimer = 0;

    this.customization = {
      gender: 'BOY', // 'BOY' | 'GIRL'
      hairStyle: 'SHORT', // 'SHORT' | 'SPIKY' | 'PONYTAIL' | 'TWINTAILS' | 'CAP'
      hairColor: 0x4a2e1b, // Bruin
      topType: 'SWEATER', // 'SWEATER' | 'TSHIRT'
      topColor: 0xe11d48, // Rood
      bottomType: 'PANTS', // 'PANTS' | 'SHORTS'
      bottomColor: 0x1e293b, // Donkerblauwe jeans
      backpackType: 'CLASSIC', // 'CLASSIC' | 'SPORT' | 'NONE'
      backpackColor: 0x10b981 // Groen
    };

    this.group = new THREE.Group();
    this.buildCharacter();
    this.createThoughtBubble();
    this.scene.add(this.group);

    this.setSleepingPose();
  }

  buildCharacter() {
    // Materialen
    this.skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.7 });
    this.hairMat = new THREE.MeshStandardMaterial({ color: this.customization.hairColor, roughness: 0.8 });
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    
    // Kleding materialen (start in pyjama)
    this.pjTopMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.8 });
    this.pjPantsMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 });
    this.pjSlippersMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });

    // Schoolkleding dynamische materialen
    this.schoolTopMat = new THREE.MeshStandardMaterial({ color: this.customization.topColor, roughness: 0.7 });
    this.schoolPantsMat = new THREE.MeshStandardMaterial({ color: this.customization.bottomColor, roughness: 0.8 });
    this.schoolShoesMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    this.backpackMat = new THREE.MeshStandardMaterial({ color: this.customization.backpackColor, roughness: 0.6 });

    // Lichaamsdelen structuur
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Torso (bovenlichaam)
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.55, 0.28);
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.pjTopMat);
    this.torsoMesh.position.set(0, 0.72, 0);
    this.torsoMesh.castShadow = true;
    this.bodyGroup.add(this.torsoMesh);

    // Hoofd
    const headGeo = new THREE.BoxGeometry(0.36, 0.36, 0.36);
    this.headMesh = new THREE.Mesh(headGeo, this.skinMat);
    this.headMesh.position.set(0, 1.18, 0);
    this.headMesh.castShadow = true;
    this.bodyGroup.add(this.headMesh);

    // --- 1. Kapsels (5 unieke 3D modellen) ---
    // A. Kort met kuif (SHORT)
    this.hairShortGroup = new THREE.Group();
    const boyHairGeo = new THREE.BoxGeometry(0.40, 0.18, 0.40);
    const boyHairMesh = new THREE.Mesh(boyHairGeo, this.hairMat);
    boyHairMesh.position.set(0, 1.33, 0.005);
    boyHairMesh.castShadow = true;
    this.hairShortGroup.add(boyHairMesh);

    // Opvallende, volumineuze kuif (Kuif / Pompadour)
    const kuifBaseGeo = new THREE.BoxGeometry(0.30, 0.18, 0.16);
    const kuifBaseMesh = new THREE.Mesh(kuifBaseGeo, this.hairMat);
    kuifBaseMesh.position.set(0, 1.40, 0.18);
    kuifBaseMesh.rotation.x = -0.22;
    kuifBaseMesh.castShadow = true;
    this.hairShortGroup.add(kuifBaseMesh);

    const kuifTopGeo = new THREE.BoxGeometry(0.24, 0.12, 0.20);
    const kuifTopMesh = new THREE.Mesh(kuifTopGeo, this.hairMat);
    kuifTopMesh.position.set(0, 1.46, 0.09);
    kuifTopMesh.rotation.x = -0.12;
    kuifTopMesh.castShadow = true;
    this.hairShortGroup.add(kuifTopMesh);

    const kuifFlickGeo = new THREE.BoxGeometry(0.20, 0.10, 0.09);
    const kuifFlickMesh = new THREE.Mesh(kuifFlickGeo, this.hairMat);
    kuifFlickMesh.position.set(0, 1.43, 0.25);
    kuifFlickMesh.rotation.x = -0.32;
    kuifFlickMesh.castShadow = true;
    this.hairShortGroup.add(kuifFlickMesh);

    const boyBackGeo = new THREE.BoxGeometry(0.38, 0.14, 0.06);
    const boyBackMesh = new THREE.Mesh(boyBackGeo, this.hairMat);
    boyBackMesh.position.set(0, 1.20, -0.17);
    boyBackMesh.castShadow = true;
    this.hairShortGroup.add(boyBackMesh);
    this.bodyGroup.add(this.hairShortGroup);

    // B. Stoere stekels (SPIKY) - 14 dynamische spikes rondom het hoofd
    this.hairSpikyGroup = new THREE.Group();
    const spikyBaseGeo = new THREE.BoxGeometry(0.40, 0.16, 0.40);
    const spikyBaseMesh = new THREE.Mesh(spikyBaseGeo, this.hairMat);
    spikyBaseMesh.position.set(0, 1.32, 0.005);
    spikyBaseMesh.castShadow = true;
    this.hairSpikyGroup.add(spikyBaseMesh);

    const spikyBack = new THREE.Mesh(boyBackGeo, this.hairMat);
    spikyBack.position.set(0, 1.20, -0.17);
    spikyBack.castShadow = true;
    this.hairSpikyGroup.add(spikyBack);

    const spikeGeo = new THREE.ConeGeometry(0.045, 0.13, 5);
    const spikeSpecs = [
      // Voorste rij (naar voren gericht)
      { pos: [0, 1.44, 0.16], rot: [0.38, 0, 0], scale: 1.05 },
      { pos: [-0.11, 1.42, 0.14], rot: [0.32, 0, -0.28], scale: 0.95 },
      { pos: [0.11, 1.42, 0.14], rot: [0.32, 0, 0.28], scale: 0.95 },
      // Middelste rij (kroon & zijkanten)
      { pos: [0, 1.50, 0.04], rot: [0.06, 0, 0], scale: 1.2 },
      { pos: [-0.09, 1.48, 0.04], rot: [0.06, 0, -0.24], scale: 1.1 },
      { pos: [0.09, 1.48, 0.04], rot: [0.06, 0, 0.24], scale: 1.1 },
      { pos: [-0.17, 1.43, 0.03], rot: [0.0, 0, -0.52], scale: 0.95 },
      { pos: [0.17, 1.43, 0.03], rot: [0.0, 0, 0.52], scale: 0.95 },
      // Achterste rij (naar achter gericht)
      { pos: [0, 1.47, -0.08], rot: [-0.26, 0, 0], scale: 1.1 },
      { pos: [-0.11, 1.44, -0.08], rot: [-0.24, 0, -0.26], scale: 1.0 },
      { pos: [0.11, 1.44, -0.08], rot: [-0.24, 0, 0.26], scale: 1.0 },
      // Nek/kruin achterzijde
      { pos: [0, 1.42, -0.16], rot: [-0.48, 0, 0], scale: 0.95 },
      { pos: [-0.10, 1.39, -0.15], rot: [-0.42, 0, -0.32], scale: 0.88 },
      { pos: [0.10, 1.39, -0.15], rot: [-0.42, 0, 0.32], scale: 0.88 }
    ];
    spikeSpecs.forEach(s => {
      const spike = new THREE.Mesh(spikeGeo, this.hairMat);
      spike.position.set(s.pos[0], s.pos[1], s.pos[2]);
      spike.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
      spike.scale.set(s.scale, s.scale, s.scale);
      spike.castShadow = true;
      this.hairSpikyGroup.add(spike);
    });
    this.bodyGroup.add(this.hairSpikyGroup);
    this.hairSpikyGroup.visible = false;

    // C. Paardenstaart met lokken en scrunchie (PONYTAIL)
    this.hairPonytailGroup = new THREE.Group();
    const ponytailBaseGeo = new THREE.BoxGeometry(0.40, 0.20, 0.40);
    const ponytailBaseMesh = new THREE.Mesh(ponytailBaseGeo, this.hairMat);
    ponytailBaseMesh.position.set(0, 1.33, 0.005);
    ponytailBaseMesh.castShadow = true;
    this.hairPonytailGroup.add(ponytailBaseMesh);

    const backHairGeo = new THREE.BoxGeometry(0.39, 0.26, 0.08);
    const backHairMesh = new THREE.Mesh(backHairGeo, this.hairMat);
    backHairMesh.position.set(0, 1.17, -0.17);
    backHairMesh.castShadow = true;
    this.hairPonytailGroup.add(backHairMesh);

    const lockGeo = new THREE.BoxGeometry(0.08, 0.26, 0.12);
    const leftLock = new THREE.Mesh(lockGeo, this.hairMat);
    leftLock.position.set(-0.21, 1.20, 0.08);
    this.hairPonytailGroup.add(leftLock);

    const rightLock = new THREE.Mesh(lockGeo, this.hairMat);
    rightLock.position.set(0.21, 1.20, 0.08);
    this.hairPonytailGroup.add(rightLock);

    const tieGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 12);
    const tieMesh = new THREE.Mesh(tieGeo, new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 }));
    tieMesh.position.set(0, 1.28, -0.22);
    tieMesh.rotation.x = 0.45;
    this.hairPonytailGroup.add(tieMesh);

    const ponytailGeo = new THREE.CylinderGeometry(0.06, 0.035, 0.36, 10);
    const ponytail = new THREE.Mesh(ponytailGeo, this.hairMat);
    ponytail.position.set(0, 1.12, -0.30);
    ponytail.rotation.x = 0.45;
    ponytail.castShadow = true;
    this.hairPonytailGroup.add(ponytail);

    const tipGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const tipMesh = new THREE.Mesh(tipGeo, this.hairMat);
    tipMesh.position.set(0, 0.96, -0.37);
    this.hairPonytailGroup.add(tipMesh);
    this.bodyGroup.add(this.hairPonytailGroup);
    this.hairPonytailGroup.visible = false;

    // D. Twee staartjes (TWINTAILS) - netjes naar buiten gebogen
    this.hairTwintailsGroup = new THREE.Group();
    const twinBase = new THREE.Mesh(ponytailBaseGeo, this.hairMat);
    twinBase.position.set(0, 1.33, 0.005);
    twinBase.castShadow = true;
    this.hairTwintailsGroup.add(twinBase);

    const twinBack = new THREE.Mesh(backHairGeo, this.hairMat);
    twinBack.position.set(0, 1.17, -0.17);
    twinBack.castShadow = true;
    this.hairTwintailsGroup.add(twinBack);

    const twinLockL = new THREE.Mesh(lockGeo, this.hairMat);
    twinLockL.position.set(-0.21, 1.20, 0.08);
    this.hairTwintailsGroup.add(twinLockL);

    const twinLockR = new THREE.Mesh(lockGeo, this.hairMat);
    twinLockR.position.set(0.21, 1.20, 0.08);
    this.hairTwintailsGroup.add(twinLockR);

    const scrunchieMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
    // Linker staartje (buigt naar links-buiten)
    const twinTieL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), scrunchieMat);
    twinTieL.position.set(-0.22, 1.28, -0.05);
    twinTieL.rotation.z = -0.42;
    twinTieL.rotation.x = 0.20;
    this.hairTwintailsGroup.add(twinTieL);

    const twinTailL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.022, 0.30, 8), this.hairMat);
    twinTailL.position.set(-0.29, 1.14, -0.08);
    twinTailL.rotation.z = -0.42;
    twinTailL.rotation.x = 0.20;
    twinTailL.castShadow = true;
    this.hairTwintailsGroup.add(twinTailL);

    const twinTipL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), this.hairMat);
    twinTipL.position.set(-0.35, 1.00, -0.11);
    this.hairTwintailsGroup.add(twinTipL);

    // Rechter staartje (buigt naar rechts-buiten)
    const twinTieR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), scrunchieMat);
    twinTieR.position.set(0.22, 1.28, -0.05);
    twinTieR.rotation.z = 0.42;
    twinTieR.rotation.x = 0.20;
    this.hairTwintailsGroup.add(twinTieR);

    const twinTailR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.022, 0.30, 8), this.hairMat);
    twinTailR.position.set(0.29, 1.14, -0.08);
    twinTailR.rotation.z = 0.42;
    twinTailR.rotation.x = 0.20;
    twinTailR.castShadow = true;
    this.hairTwintailsGroup.add(twinTailR);

    const twinTipR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), this.hairMat);
    twinTipR.position.set(0.35, 1.00, -0.11);
    this.hairTwintailsGroup.add(twinTipR);

    this.bodyGroup.add(this.hairTwintailsGroup);
    this.hairTwintailsGroup.visible = false;

    // E. Baseball Pet / Cap (CAP) - ruim dekkend zodat geen haar/hoofd hoekjes uitsteken
    this.hairCapGroup = new THREE.Group();
    // Haar dat subtiel onder de pet vandaan piept bij nek en bakkebaarden
    const capHairBack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.08), this.hairMat);
    capHairBack.position.set(0, 1.18, -0.16);
    capHairBack.castShadow = true;
    this.hairCapGroup.add(capHairBack);

    const capHairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.14), this.hairMat);
    capHairSideL.position.set(-0.17, 1.20, 0.02);
    this.hairCapGroup.add(capHairSideL);

    const capHairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.14), this.hairMat);
    capHairSideR.position.set(0.17, 1.20, 0.02);
    this.hairCapGroup.add(capHairSideR);

    // De pet kroon (bedekt de hele bovenkant van het hoofd)
    const capCrownBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.17, 0.42), this.backpackMat);
    capCrownBox.position.set(0, 1.34, 0.01);
    capCrownBox.castShadow = true;
    this.hairCapGroup.add(capCrownBox);

    const capCrownTop = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.08, 16), this.backpackMat);
    capCrownTop.position.set(0, 1.43, 0.01);
    capCrownTop.castShadow = true;
    this.hairCapGroup.add(capCrownTop);

    const capButton = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), this.backpackMat);
    capButton.position.set(0, 1.48, 0.01);
    this.hairCapGroup.add(capButton);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.20), this.backpackMat);
    capVisor.position.set(0, 1.31, 0.27);
    capVisor.rotation.x = -0.15;
    capVisor.castShadow = true;
    this.hairCapGroup.add(capVisor);
    this.bodyGroup.add(this.hairCapGroup);
    this.hairCapGroup.visible = false;

    // Ogen
    const eyeGeo = new THREE.PlaneGeometry(0.06, 0.06);
    this.leftEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    this.leftEye.position.set(-0.1, 1.18, 0.184);
    this.bodyGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    this.rightEye.position.set(0.1, 1.18, 0.184);
    this.bodyGroup.add(this.rightEye);

    // Glimlach
    const smileGeo = new THREE.PlaneGeometry(0.12, 0.03);
    const smileMesh = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ color: 0xc45d47 }));
    smileMesh.position.set(0, 1.08, 0.184);
    this.bodyGroup.add(smileMesh);

    // --- 2. Schooltassen (Rugzak & Schoudertas) ---
    this.backpackGroup = new THREE.Group();

    // Model A: Klassieke schoolrugzak met voorvak
    this.backpackClassicMesh = new THREE.Group();
    const bpMainGeo = new THREE.BoxGeometry(0.38, 0.44, 0.18);
    const bpMain = new THREE.Mesh(bpMainGeo, this.backpackMat);
    bpMain.position.set(0, 0.74, -0.21);
    bpMain.castShadow = true;
    this.backpackClassicMesh.add(bpMain);

    const bpPocketGeo = new THREE.BoxGeometry(0.28, 0.22, 0.07);
    const bpPocket = new THREE.Mesh(bpPocketGeo, this.backpackMat);
    bpPocket.position.set(0, 0.67, -0.32);
    bpPocket.castShadow = true;
    this.backpackClassicMesh.add(bpPocket);

    const bpStrapGeo = new THREE.BoxGeometry(0.06, 0.44, 0.03);
    const strapL = new THREE.Mesh(bpStrapGeo, this.backpackMat);
    strapL.position.set(-0.13, 0.74, -0.11);
    this.backpackClassicMesh.add(strapL);

    const strapR = new THREE.Mesh(bpStrapGeo, this.backpackMat);
    strapR.position.set(0.13, 0.74, -0.11);
    this.backpackClassicMesh.add(strapR);
    this.backpackGroup.add(this.backpackClassicMesh);

    // Model B: Sportieve schoudertas / Messenger bag
    this.backpackSportMesh = new THREE.Group();
    const sportGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.42, 12);
    const sportMain = new THREE.Mesh(sportGeo, this.backpackMat);
    sportMain.position.set(0, 0.68, -0.22);
    sportMain.rotation.z = Math.PI / 2;
    sportMain.castShadow = true;
    this.backpackSportMesh.add(sportMain);

    const sportStrap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 0.03), this.backpackMat);
    sportStrap.position.set(0, 0.78, -0.15);
    sportStrap.rotation.z = 0.55;
    this.backpackSportMesh.add(sportStrap);
    this.backpackGroup.add(this.backpackSportMesh);
    this.backpackSportMesh.visible = false;

    this.bodyGroup.add(this.backpackGroup);
    this.backpackGroup.visible = false;

    // --- Benen & Voeten (gesplitst in boven/onder voor korte broek / rok optie) ---
    const upperLegGeo = new THREE.BoxGeometry(0.16, 0.20, 0.17);
    const lowerLegGeo = new THREE.BoxGeometry(0.15, 0.22, 0.16);
    const footGeo = new THREE.BoxGeometry(0.19, 0.10, 0.26);

    // Linker been
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.14, 0.45, 0);

    this.leftUpperLegMesh = new THREE.Mesh(upperLegGeo, this.pjPantsMat);
    this.leftUpperLegMesh.position.set(0, -0.10, 0);
    this.leftUpperLegMesh.castShadow = true;
    this.leftLegPivot.add(this.leftUpperLegMesh);

    this.leftLowerLegMesh = new THREE.Mesh(lowerLegGeo, this.pjPantsMat);
    this.leftLowerLegMesh.position.set(0, -0.31, 0);
    this.leftLowerLegMesh.castShadow = true;
    this.leftLegPivot.add(this.leftLowerLegMesh);

    this.leftFootMesh = new THREE.Mesh(footGeo, this.pjSlippersMat);
    this.leftFootMesh.position.set(0, -0.44, 0.035);
    this.leftFootMesh.castShadow = true;
    this.leftLegPivot.add(this.leftFootMesh);
    this.bodyGroup.add(this.leftLegPivot);

    // Rechter been
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.14, 0.45, 0);

    this.rightUpperLegMesh = new THREE.Mesh(upperLegGeo, this.pjPantsMat);
    this.rightUpperLegMesh.position.set(0, -0.10, 0);
    this.rightUpperLegMesh.castShadow = true;
    this.rightLegPivot.add(this.rightUpperLegMesh);

    this.rightLowerLegMesh = new THREE.Mesh(lowerLegGeo, this.pjPantsMat);
    this.rightLowerLegMesh.position.set(0, -0.31, 0);
    this.rightLowerLegMesh.castShadow = true;
    this.rightLegPivot.add(this.rightLowerLegMesh);

    this.rightFootMesh = new THREE.Mesh(footGeo, this.pjSlippersMat);
    this.rightFootMesh.position.set(0, -0.44, 0.035);
    this.rightFootMesh.castShadow = true;
    this.rightLegPivot.add(this.rightFootMesh);
    this.bodyGroup.add(this.rightLegPivot);

    // --- Armen (gesplitst in boven/onder voor korte mouwen T-shirt optie) ---
    const upperArmGeo = new THREE.BoxGeometry(0.14, 0.18, 0.16);
    const lowerArmGeo = new THREE.BoxGeometry(0.13, 0.30, 0.15);

    // Linker arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.32, 0.94, 0);

    this.leftUpperArmMesh = new THREE.Mesh(upperArmGeo, this.pjTopMat);
    this.leftUpperArmMesh.position.set(0, -0.09, 0);
    this.leftUpperArmMesh.castShadow = true;
    this.leftArmPivot.add(this.leftUpperArmMesh);

    this.leftLowerArmMesh = new THREE.Mesh(lowerArmGeo, this.pjTopMat);
    this.leftLowerArmMesh.position.set(0, -0.33, 0);
    this.leftLowerArmMesh.castShadow = true;
    this.leftArmPivot.add(this.leftLowerArmMesh);
    this.bodyGroup.add(this.leftArmPivot);

    // Rechter arm
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.32, 0.94, 0);

    this.rightUpperArmMesh = new THREE.Mesh(upperArmGeo, this.pjTopMat);
    this.rightUpperArmMesh.position.set(0, -0.09, 0);
    this.rightUpperArmMesh.castShadow = true;
    this.rightArmPivot.add(this.rightUpperArmMesh);

    this.rightLowerArmMesh = new THREE.Mesh(lowerArmGeo, this.pjTopMat);
    this.rightLowerArmMesh.position.set(0, -0.33, 0);
    this.rightLowerArmMesh.castShadow = true;
    this.rightArmPivot.add(this.rightLowerArmMesh);
    this.bodyGroup.add(this.rightArmPivot);
  }

  setCustomization(options) {
    Object.assign(this.customization, options);

    // Kapsel tonen (SHORT, SPIKY, PONYTAIL, TWINTAILS, CAP)
    if (this.hairShortGroup) this.hairShortGroup.visible = (this.customization.hairStyle === 'SHORT');
    if (this.hairSpikyGroup) this.hairSpikyGroup.visible = (this.customization.hairStyle === 'SPIKY');
    if (this.hairPonytailGroup) this.hairPonytailGroup.visible = (this.customization.hairStyle === 'PONYTAIL');
    if (this.hairTwintailsGroup) this.hairTwintailsGroup.visible = (this.customization.hairStyle === 'TWINTAILS');
    if (this.hairCapGroup) this.hairCapGroup.visible = (this.customization.hairStyle === 'CAP');

    // Haarkleur
    this.hairMat.color.set(this.customization.hairColor);

    // Kledingkleuren bijwerken
    this.schoolTopMat.color.set(this.customization.topColor);
    this.schoolPantsMat.color.set(this.customization.bottomColor);
    this.backpackMat.color.set(this.customization.backpackColor);

    // Tas model zichtbaarheid
    if (this.backpackClassicMesh) this.backpackClassicMesh.visible = (this.customization.backpackType === 'CLASSIC');
    if (this.backpackSportMesh) this.backpackSportMesh.visible = (this.customization.backpackType === 'SPORT');
    if (this.backpackGroup) this.backpackGroup.visible = (this.customization.backpackType !== 'NONE');

    // Meteen de kleren en mouwen/pijpen live op het 3D model toepassen!
    this.applyClothingMaterials();
  }

  applyClothingMaterials() {
    // Bovenstuk
    this.torsoMesh.material = this.schoolTopMat;
    this.leftUpperArmMesh.material = this.schoolTopMat;
    this.rightUpperArmMesh.material = this.schoolTopMat;

    if (this.customization.topType === 'SWEATER') {
      // Warme trui met lange mouwen
      this.leftLowerArmMesh.material = this.schoolTopMat;
      this.rightLowerArmMesh.material = this.schoolTopMat;
    } else {
      // T-shirt met korte mouwen (onderarmen bloot)
      this.leftLowerArmMesh.material = this.skinMat;
      this.rightLowerArmMesh.material = this.skinMat;
    }

    // Onderstuk
    this.leftUpperLegMesh.material = this.schoolPantsMat;
    this.rightUpperLegMesh.material = this.schoolPantsMat;

    if (this.customization.bottomType === 'PANTS') {
      // Lange broek
      this.leftLowerLegMesh.material = this.schoolPantsMat;
      this.rightLowerLegMesh.material = this.schoolPantsMat;
    } else {
      // Korte broek / rokje (onderbenen bloot)
      this.leftLowerLegMesh.material = this.skinMat;
      this.rightLowerLegMesh.material = this.skinMat;
    }

    // Witte sneakers & boekentas
    this.leftFootMesh.material = this.schoolShoesMat;
    this.rightFootMesh.material = this.schoolShoesMat;
    if (this.backpackClassicMesh) this.backpackClassicMesh.visible = (this.customization.backpackType === 'CLASSIC');
    if (this.backpackSportMesh) this.backpackSportMesh.visible = (this.customization.backpackType === 'SPORT');
    if (this.backpackGroup) this.backpackGroup.visible = this.hasBackpack && (this.customization.backpackType !== 'NONE');
  }

  equipBackpack() {
    this.hasBackpack = true;
    if (this.customization.backpackType === 'NONE') {
      this.customization.backpackType = 'CLASSIC';
    }
    if (this.backpackClassicMesh) this.backpackClassicMesh.visible = (this.customization.backpackType === 'CLASSIC');
    if (this.backpackSportMesh) this.backpackSportMesh.visible = (this.customization.backpackType === 'SPORT');
    if (this.backpackGroup) this.backpackGroup.visible = true;
  }

  createThoughtBubble() {
    this.thoughtBubbleGroup = new THREE.Group();

    // Drie kleine wolkbolletjes die opstijgen
    const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    b1.position.set(0.18, 1.45, 0.05);
    this.thoughtBubbleGroup.add(b1);

    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    b2.position.set(0.24, 1.55, 0.08);
    this.thoughtBubbleGroup.add(b2);

    // Grote denkballon wolk met WC icoon
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Witte wolk achtergrond
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.stroke();

    // WC emoji
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚽', 64, 68);

    const bubbleTex = new THREE.CanvasTexture(canvas);
    const bubbleGeo = new THREE.PlaneGeometry(0.40, 0.40);
    const bubbleMat = new THREE.MeshBasicMaterial({ map: bubbleTex, transparent: true, side: THREE.DoubleSide });
    this.bubbleMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
    this.bubbleMesh.position.set(0.32, 1.76, 0.10);
    this.thoughtBubbleGroup.add(this.bubbleMesh);

    this.group.add(this.thoughtBubbleGroup);
    this.thoughtBubbleGroup.visible = false; // Pas zichtbaar na wakker worden
  }

  useToilet() {
    this.toiletNeed = 0;
    if (this.thoughtBubbleGroup) {
      this.thoughtBubbleGroup.visible = false;
    }
    this.leftLegPivot.rotation.z = 0;
    this.rightLegPivot.rotation.z = 0;
  }

  setSleepingPose() {
    this.state = 'SLEEPING';
    this.toiletNeed = 100;
    if (this.thoughtBubbleGroup) {
      this.thoughtBubbleGroup.visible = false;
    }
    this.group.position.set(-5.8, this.world.UPPER_Y + 0.6, -5.5);
    this.bodyGroup.rotation.x = -Math.PI / 2;
    this.bodyGroup.rotation.y = 0;
    this.bodyGroup.rotation.z = Math.PI / 2;
    this.leftArmPivot.rotation.x = 0.5;
    this.rightArmPivot.rotation.x = 0.5;
    this.leftLegPivot.rotation.x = 0;
    this.rightLegPivot.rotation.x = 0;
    this.leftLegPivot.rotation.z = 0;
    this.rightLegPivot.rotation.z = 0;

    this.hasBackpack = false;
    if (this.backpackGroup) {
      this.backpackGroup.visible = false;
    }
  }

  wakeUp(onComplete) {
    if (this.state !== 'SLEEPING') return;
    this.state = 'WAKING';

    const startTime = performance.now();
    const duration = 1200;

    const animateWake = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.bodyGroup.rotation.x = -Math.PI / 2 * (1 - ease);
      this.bodyGroup.rotation.z = (Math.PI / 2) * (1 - ease);

      this.group.position.x = -5.8 + ease * 1.6;
      this.group.position.z = -5.5 + ease * 2.0;
      this.group.position.y = this.world.UPPER_Y;

      if (progress < 1.0) {
        requestAnimationFrame(animateWake);
      } else {
        this.state = 'ACTIVE';
        this.position.copy(this.group.position);
        this.rotation = Math.PI;
        this.bodyGroup.rotation.set(0, 0, 0);
        if (this.toiletNeed > 0 && this.thoughtBubbleGroup) {
          this.thoughtBubbleGroup.visible = true;
        }
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateWake);
  }

  wearSchoolClothes() {
    this.isDressed = true;
    this.applyClothingMaterials();

    // Vrolijke vreugdesprong
    this.velocity.y = 5.0;
    this.isGrounded = false;
  }

  jump() {
    if (this.state !== 'ACTIVE' || !this.isGrounded) return false;
    this.velocity.y = this.jumpForce;
    this.isGrounded = false;
    return true;
  }

  update(dt, inputVector, cameraAngle, soundManager) {
    if (this.state !== 'ACTIVE') return;

    const isMoving = inputVector.lengthSq() > 0.01;

    if (isMoving) {
      const camForwardX = -Math.sin(cameraAngle);
      const camForwardZ = -Math.cos(cameraAngle);
      const camRightX = Math.cos(cameraAngle);
      const camRightZ = -Math.sin(cameraAngle);

      const moveDirX = camForwardX * inputVector.y + camRightX * inputVector.x;
      const moveDirZ = camForwardZ * inputVector.y + camRightZ * inputVector.x;

      const targetAngle = Math.atan2(moveDirX, moveDirZ);
      let diff = targetAngle - this.rotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotation += diff * Math.min(dt * 12, 1.0);

      const speed = this.speed * inputVector.length();
      const moveX = moveDirX * speed * dt;
      const moveZ = moveDirZ * speed * dt;

      const nextX = this.position.x + moveX;
      const nextZ = this.position.z + moveZ;

      if (!this.world.checkCollision(nextX, this.position.z, this.radius, this.position.y)) {
        this.position.x = nextX;
      }
      if (!this.world.checkCollision(this.position.x, nextZ, this.radius, this.position.y)) {
        this.position.z = nextZ;
      }

      this.walkCycle += dt * 10 * inputVector.length();
      const legSwing = Math.sin(this.walkCycle) * 0.55;
      this.leftLegPivot.rotation.x = legSwing;
      this.rightLegPivot.rotation.x = -legSwing;
      this.leftArmPivot.rotation.x = -legSwing * 0.7;
      this.rightArmPivot.rotation.x = legSwing * 0.7;
      this.leftLegPivot.rotation.z = 0;
      this.rightLegPivot.rotation.z = 0;

      this.stepTimer += dt;
      if (this.stepTimer > 0.32) {
        this.stepTimer = 0;
        if (this.isGrounded && soundManager) {
          const onStairs = this.world.isOnStairs(this.position.x, this.position.z);
          soundManager.playStep(onStairs);
        }
      }
    } else {
      this.leftLegPivot.rotation.x *= 0.8;
      this.rightLegPivot.rotation.x *= 0.8;
      this.leftArmPivot.rotation.x *= 0.8;
      this.rightArmPivot.rotation.x *= 0.8;
      this.stepTimer = 0.25;

      // Hoge-nood wiebelen met de beentjes als je stilstaat en nodig moet plassen!
      if (this.toiletNeed > 0) {
        this.toiletWiggleTimer += dt * 9;
        const wiggle = Math.sin(this.toiletWiggleTimer) * 0.14;
        this.leftLegPivot.rotation.z = wiggle;
        this.rightLegPivot.rotation.z = -wiggle;
      } else {
        this.leftLegPivot.rotation.z *= 0.8;
        this.rightLegPivot.rotation.z *= 0.8;
      }
    }

    // Animeren van de denkballon als deze zichtbaar is
    if (this.thoughtBubbleGroup && this.thoughtBubbleGroup.visible) {
      this.thoughtBubbleGroup.position.y = Math.sin(performance.now() * 0.005) * 0.04;
      if (this.bubbleMesh) {
        this.bubbleMesh.rotation.y = -this.rotation - cameraAngle + Math.PI;
      }
    }

    const groundY = this.world.getGroundHeightAt(this.position.x, this.position.z);
    this.velocity.y += this.gravity * dt;
    this.position.y += this.velocity.y * dt;

    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      if (this.position.y - groundY > 0.1) {
        this.isGrounded = false;
      }
    }

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
  }

  setProximityFade(alpha) {
    this.bodyGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        if (alpha < 0.98) {
          child.material.transparent = true;
          child.material.opacity = alpha;
        } else {
          child.material.transparent = false;
          child.material.opacity = 1.0;
        }
      }
    });
  }
}

