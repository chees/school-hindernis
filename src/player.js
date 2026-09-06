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
    this.walkCycle = 0;
    this.stepTimer = 0;

    this.customization = {
      gender: 'BOY', // 'BOY' | 'GIRL'
      hairColor: 0x4a2e1b, // Bruin
      topType: 'SWEATER', // 'SWEATER' | 'TSHIRT'
      topColor: 0xe11d48, // Rood
      bottomType: 'PANTS', // 'PANTS' | 'SHORTS'
      bottomColor: 0x1e293b, // Donkerblauwe jeans
      backpackColor: 0x10b981 // Groen
    };

    this.group = new THREE.Group();
    this.buildCharacter();
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

    // --- Kapsels: Jongen & Meisje ---
    // 1. Jongenskapsel (kort en stoer)
    this.hairBoyGroup = new THREE.Group();
    const boyHairGeo = new THREE.BoxGeometry(0.40, 0.18, 0.40);
    const boyHairMesh = new THREE.Mesh(boyHairGeo, this.hairMat);
    boyHairMesh.position.set(0, 1.33, 0.005);
    boyHairMesh.castShadow = true;
    this.hairBoyGroup.add(boyHairMesh);
    this.bodyGroup.add(this.hairBoyGroup);

    // 2. Meisjeskapsel (langer haar, achterdekking en natuurlijke paardenstaart)
    this.hairGirlGroup = new THREE.Group();
    const girlHairGeo = new THREE.BoxGeometry(0.40, 0.20, 0.40);
    const girlHairMesh = new THREE.Mesh(girlHairGeo, this.hairMat);
    girlHairMesh.position.set(0, 1.33, 0.005);
    girlHairMesh.castShadow = true;
    this.hairGirlGroup.add(girlHairMesh);

    // Achterkant haar (bedekt achterhoofd tot aan de nek)
    const backHairGeo = new THREE.BoxGeometry(0.39, 0.26, 0.08);
    const backHairMesh = new THREE.Mesh(backHairGeo, this.hairMat);
    backHairMesh.position.set(0, 1.17, -0.17);
    backHairMesh.castShadow = true;
    this.hairGirlGroup.add(backHairMesh);

    // Lokken langs het gezicht
    const lockGeo = new THREE.BoxGeometry(0.08, 0.26, 0.12);
    const leftLock = new THREE.Mesh(lockGeo, this.hairMat);
    leftLock.position.set(-0.21, 1.20, 0.08);
    this.hairGirlGroup.add(leftLock);

    const rightLock = new THREE.Mesh(lockGeo, this.hairMat);
    rightLock.position.set(0.21, 1.20, 0.08);
    this.hairGirlGroup.add(rightLock);

    // Elastiekje / scrunchie voor de paardenstaart (helder roze/rood)
    const tieGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 12);
    const tieMesh = new THREE.Mesh(tieGeo, new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 }));
    tieMesh.position.set(0, 1.28, -0.22);
    tieMesh.rotation.x = 0.45;
    this.hairGirlGroup.add(tieMesh);

    // Paardenstaart aan de achterkant (taps toelopend naar beneden en naar achteren hangend)
    const ponytailGeo = new THREE.CylinderGeometry(0.06, 0.035, 0.36, 10);
    const ponytail = new THREE.Mesh(ponytailGeo, this.hairMat);
    ponytail.position.set(0, 1.12, -0.30);
    ponytail.rotation.x = 0.45;
    ponytail.castShadow = true;
    this.hairGirlGroup.add(ponytail);

    // Zacht afgerond uiteinde van de paardenstaart
    const tipGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const tipMesh = new THREE.Mesh(tipGeo, this.hairMat);
    tipMesh.position.set(0, 0.96, -0.37);
    this.hairGirlGroup.add(tipMesh);

    this.bodyGroup.add(this.hairGirlGroup);
    this.hairGirlGroup.visible = false; // Start als jongen standaard

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

    // Boekentas / Rugzak
    const bpGeo = new THREE.BoxGeometry(0.38, 0.44, 0.18);
    this.backpackMesh = new THREE.Mesh(bpGeo, this.backpackMat);
    this.backpackMesh.position.set(0, 0.74, -0.21);
    this.backpackMesh.castShadow = true;
    this.backpackMesh.visible = false;
    this.bodyGroup.add(this.backpackMesh);

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

    // Geslacht / Kapsel
    if (this.customization.gender === 'GIRL') {
      this.hairBoyGroup.visible = false;
      this.hairGirlGroup.visible = true;
    } else {
      this.hairBoyGroup.visible = true;
      this.hairGirlGroup.visible = false;
    }

    // Haarkleur
    this.hairMat.color.set(this.customization.hairColor);

    // Kledingkleuren bijwerken
    this.schoolTopMat.color.set(this.customization.topColor);
    this.schoolPantsMat.color.set(this.customization.bottomColor);
    this.backpackMat.color.set(this.customization.backpackColor);

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
    this.backpackMesh.visible = true;
  }

  setSleepingPose() {
    this.state = 'SLEEPING';
    this.group.position.set(-5.8, this.world.UPPER_Y + 0.6, -5.5);
    this.bodyGroup.rotation.x = -Math.PI / 2;
    this.bodyGroup.rotation.y = 0;
    this.bodyGroup.rotation.z = Math.PI / 2;
    this.leftArmPivot.rotation.x = 0.5;
    this.rightArmPivot.rotation.x = 0.5;
    this.leftLegPivot.rotation.x = 0;
    this.rightLegPivot.rotation.x = 0;
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

