import * as THREE from 'three';

export class SkyboxManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.currentWeather = null;

    // Groepen voor 3D weereffecten in de wereld
    this.cloudsGroup = new THREE.Group();
    this.scene.add(this.cloudsGroup);

    this.rainGroup = new THREE.Group();
    this.scene.add(this.rainGroup);

    this.rainParticles = null;
    this.rainCount = 2000;
    this.rainVelocities = [];

    this.windSpeed = 2.5;
    this.initRainSystem();
  }

  setWeather(weatherData) {
    if (!weatherData) return;
    this.currentWeather = weatherData;
    const weatherId = weatherData.id || 'SUNNY';

    // 1. Genereer dynamische 360° Equirectangular Skybox Panorama
    const skyTexture = this.generateSkyTexture(weatherId);
    this.scene.background = skyTexture;

    // 2. Pas mist en sfeer aan op basis van het weer
    if (weatherId === 'SUNNY') {
      this.scene.fog = new THREE.FogExp2(0xc7e4fd, 0.007);
      this.rainGroup.visible = false;
      this.setupSunnyAtmosphere();
    } else if (weatherId === 'RAINY') {
      this.scene.fog = new THREE.FogExp2(0x3e4c59, 0.022);
      this.rainGroup.visible = true;
      this.setupRainyAtmosphere();
    } else if (weatherId === 'CHILLY') {
      this.scene.fog = new THREE.FogExp2(0x8fa2b4, 0.014);
      this.rainGroup.visible = false;
      this.setupChillyAtmosphere();
    }
  }

  generateSkyTexture(weatherId) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    if (weatherId === 'SUNNY') {
      this.drawSunnySky(ctx, w, h);
    } else if (weatherId === 'RAINY') {
      this.drawRainySky(ctx, w, h);
    } else {
      this.drawChillySky(ctx, w, h);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  drawSunnySky(ctx, w, h) {
    // Hemelgradient: diep azuurblauw zenit -> helder hemelsblauw -> warme zonnige horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
    skyGrad.addColorStop(0, '#0284c7');     // Diep hemelsblauw zenit
    skyGrad.addColorStop(0.35, '#38bdf8');  // Vrolijk helderblauw
    skyGrad.addColorStop(0.70, '#7dd3fc');  // Zacht cyaan
    skyGrad.addColorStop(0.92, '#bae6fd');  // Lichte horizon
    skyGrad.addColorStop(1.0, '#fef08a');   // Warme zonne-gloed aan de horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.52);

    // Grond onder de horizon (weerkaatsing aarde/groen gras)
    const groundGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
    groundGrad.addColorStop(0, '#86efac');  // Fris ochtendgroen
    groundGrad.addColorStop(0.2, '#22c55e');
    groundGrad.addColorStop(1.0, '#15803d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.52, w, h * 0.48);

    // Stralende Zon (gepositioneerd in het zuidoosten, elevation ~38°)
    const sunX = w * 0.38;
    const sunY = h * 0.24;

    // Brede gouden zonnehalo
    const haloGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 320);
    haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    haloGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.85)');
    haloGrad.addColorStop(0.35, 'rgba(253, 224, 71, 0.45)');
    haloGrad.addColorStop(0.65, 'rgba(250, 204, 21, 0.15)');
    haloGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 320, 0, Math.PI * 2);
    ctx.fill();

    // Witte zonne-kern
    const coreGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 48);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.7, '#fffbeb');
    coreGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 48, 0, Math.PI * 2);
    ctx.fill();

    // Uitstralende zonnestralen
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 14;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r1 = 60;
      const r2 = 240 + (i % 2 === 0 ? 90 : 0);
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * r1, sunY + Math.sin(angle) * r1);
      ctx.lineTo(sunX + Math.cos(angle) * r2, sunY + Math.sin(angle) * r2);
      ctx.stroke();
    }

    // Witte pluizige stapelwolken (cumulus) verspreid langs de hemel
    const clouds = [
      { x: w * 0.12, y: h * 0.28, scale: 1.1 },
      { x: w * 0.22, y: h * 0.35, scale: 0.8 },
      { x: w * 0.62, y: h * 0.22, scale: 1.3 },
      { x: w * 0.78, y: h * 0.31, scale: 0.9 },
      { x: w * 0.90, y: h * 0.25, scale: 1.0 },
      { x: w * 0.50, y: h * 0.38, scale: 0.7 }
    ];

    for (const c of clouds) {
      this.drawFluffyCloud(ctx, c.x, c.y, c.scale, 'rgba(255, 255, 255, 0.92)', 'rgba(224, 242, 254, 0.65)');
    }
  }

  drawRainySky(ctx, w, h) {
    // Donkere onweersachtige / regenachtige wolkenlucht
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
    skyGrad.addColorStop(0, '#0f172a');     // Donker grafiet/houtskool zenit
    skyGrad.addColorStop(0.35, '#1e293b');  // Donker leisteengrijs
    skyGrad.addColorStop(0.70, '#334155');  // Stormachtig grauwgrijs
    skyGrad.addColorStop(0.92, '#475569');  // Mistige regennevel
    skyGrad.addColorStop(1.0, '#334155');   // Natte horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.52);

    // Grond onder de horizon (nat donker asfalt/gras)
    const groundGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
    groundGrad.addColorStop(0, '#334155');
    groundGrad.addColorStop(0.3, '#1e293b');
    groundGrad.addColorStop(1.0, '#0f172a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.52, w, h * 0.48);

    // Zware, donkere stapelende regenwolken
    const stormClouds = [
      { x: w * 0.08, y: h * 0.20, scale: 1.6 },
      { x: w * 0.25, y: h * 0.16, scale: 1.9 },
      { x: w * 0.45, y: h * 0.22, scale: 2.1 },
      { x: w * 0.68, y: h * 0.18, scale: 1.8 },
      { x: w * 0.88, y: h * 0.21, scale: 2.0 },
      { x: w * 0.18, y: h * 0.32, scale: 1.4 },
      { x: w * 0.58, y: h * 0.30, scale: 1.5 },
      { x: w * 0.82, y: h * 0.34, scale: 1.3 }
    ];

    for (const c of stormClouds) {
      this.drawFluffyCloud(ctx, c.x, c.y, c.scale, 'rgba(51, 65, 85, 0.95)', 'rgba(30, 41, 59, 0.85)');
    }

    // Regengordijnen aan de horizon
    ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
    for (let x = 0; x < w; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.30);
      ctx.lineTo(x + 50, h * 0.52);
      ctx.lineTo(x + 10, h * 0.52);
      ctx.lineTo(x - 40, h * 0.30);
      ctx.fill();
    }
  }

  drawChillySky(ctx, w, h) {
    // Frisse, bleke herfstofficieuze bewolkte hemel
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
    skyGrad.addColorStop(0, '#334155');     // Koel staalgrijs zenit
    skyGrad.addColorStop(0.35, '#64748b');  // Koude zilverblauwe waas
    skyGrad.addColorStop(0.70, '#94a3b8');  // Zacht mistgrijs
    skyGrad.addColorStop(0.92, '#cbd5e1');  // IJzige bleke ochtendhorizon
    skyGrad.addColorStop(1.0, '#e2e8f0');   // Heldere vorstige nevel
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.52);

    // Grond onder de horizon
    const groundGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
    groundGrad.addColorStop(0, '#64748b');
    groundGrad.addColorStop(0.3, '#475569');
    groundGrad.addColorStop(1.0, '#334155');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.52, w, h * 0.48);

    // Bleke, diffuse koude zon die achter het wolkendek schijnt
    const sunX = w * 0.42;
    const sunY = h * 0.22;

    const paleHalo = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
    paleHalo.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    paleHalo.addColorStop(0.3, 'rgba(241, 245, 249, 0.45)');
    paleHalo.addColorStop(0.7, 'rgba(226, 232, 240, 0.15)');
    paleHalo.addColorStop(1, 'rgba(226, 232, 240, 0)');
    ctx.fillStyle = paleHalo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    const paleCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 32);
    paleCore.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    paleCore.addColorStop(0.8, 'rgba(248, 250, 252, 0.8)');
    paleCore.addColorStop(1, 'rgba(226, 232, 240, 0.2)');
    ctx.fillStyle = paleCore;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Uitgestrekt egaal wolkendek met winderige wolkenstroken
    const chillyClouds = [
      { x: w * 0.15, y: h * 0.24, scale: 1.4 },
      { x: w * 0.35, y: h * 0.18, scale: 1.6 },
      { x: w * 0.60, y: h * 0.26, scale: 1.8 },
      { x: w * 0.85, y: h * 0.20, scale: 1.5 },
      { x: w * 0.48, y: h * 0.32, scale: 1.3 }
    ];

    for (const c of chillyClouds) {
      this.drawFluffyCloud(ctx, c.x, c.y, c.scale, 'rgba(203, 213, 225, 0.75)', 'rgba(148, 163, 184, 0.55)');
    }
  }

  drawFluffyCloud(ctx, cx, cy, scale, topColor, bottomColor) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale * 0.65);

    const grad = ctx.createLinearGradient(0, -50, 0, 50);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(0, 10, 45, 0, Math.PI * 2);
    ctx.arc(-40, 15, 32, 0, Math.PI * 2);
    ctx.arc(40, 15, 32, 0, Math.PI * 2);
    ctx.arc(-70, 22, 22, 0, Math.PI * 2);
    ctx.arc(70, 22, 22, 0, Math.PI * 2);
    ctx.arc(-20, -10, 36, 0, Math.PI * 2);
    ctx.arc(20, -10, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- 3D EFFECTEN: REGEN & WOLKEN ---

  initRainSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 6); // Lijnsegmenten (2 punten per regendruppel)

    const spreadX = 65;
    const spreadY = 35;
    const spreadZ = 85;

    for (let i = 0; i < this.rainCount; i++) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = Math.random() * spreadY;
      const z = (Math.random() - 0.5) * spreadZ + 35; // Rondom het huis en de straat
      const dropLength = 0.55 + Math.random() * 0.35;

      const idx = i * 6;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      positions[idx + 3] = x + 0.04;
      positions[idx + 4] = y - dropLength;
      positions[idx + 5] = z + 0.04;

      this.rainVelocities.push(22 + Math.random() * 12);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });

    this.rainParticles = new THREE.LineSegments(geometry, material);
    this.rainGroup.add(this.rainParticles);
    this.rainGroup.visible = false;
  }

  setupSunnyAtmosphere() {
    this.create3DClouds(0xffffff, 0.85, 7);
  }

  setupRainyAtmosphere() {
    this.create3DClouds(0x475569, 0.95, 12);
  }

  setupChillyAtmosphere() {
    this.create3DClouds(0xcbd5e1, 0.80, 9);
  }

  create3DClouds(color, opacity, count) {
    while (this.cloudsGroup.children.length > 0) {
      const obj = this.cloudsGroup.children[0];
      this.cloudsGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    const cloudMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: opacity,
      flatShading: true
    });

    for (let i = 0; i < count; i++) {
      const cluster = new THREE.Group();
      const numPuffs = 5 + Math.floor(Math.random() * 4);
      const clusterScale = 1.4 + Math.random() * 1.8;

      for (let j = 0; j < numPuffs; j++) {
        const radius = 2.4 + Math.random() * 2.2;
        const puffGeo = new THREE.DodecahedronGeometry(radius, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (j - numPuffs / 2) * 2.8 + (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 2.2
        );
        cluster.add(puff);
      }

      cluster.scale.set(clusterScale, clusterScale * 0.6, clusterScale);
      cluster.position.set(
        (Math.random() - 0.5) * 120,
        28 + Math.random() * 14,
        (Math.random() - 0.5) * 130 + 35
      );
      cluster.userData.speed = 0.8 + Math.random() * 1.4;
      this.cloudsGroup.add(cluster);
    }
  }

  update(dt, cameraPosition) {
    // 1. Wolken zacht laten drijven
    for (const cloud of this.cloudsGroup.children) {
      cloud.position.x += cloud.userData.speed * dt * 2.0;
      if (cloud.position.x > 80) {
        cloud.position.x = -80;
      }
    }

    // 2. Regen animeren als het regent
    if (this.currentWeather && this.currentWeather.id === 'RAINY' && this.rainParticles) {
      const posAttr = this.rainParticles.geometry.attributes.position;
      const positions = posAttr.array;

      const camX = cameraPosition ? cameraPosition.x : 0;
      const camY = cameraPosition ? cameraPosition.y : 5;
      const camZ = cameraPosition ? cameraPosition.z : 20;

      const spreadX = 45;
      const spreadZ = 55;
      const topY = camY + 20;
      const bottomY = Math.max(-0.5, camY - 14);

      for (let i = 0; i < this.rainCount; i++) {
        const idx = i * 6;
        const fallSpeed = this.rainVelocities[i];
        const dropLength = 0.65;

        positions[idx + 1] -= fallSpeed * dt;
        positions[idx + 4] = positions[idx + 1] - dropLength;

        positions[idx] += 3.5 * dt;
        positions[idx + 3] = positions[idx] + 0.08;

        if (positions[idx + 1] < bottomY) {
          positions[idx + 1] = topY + Math.random() * 6;
          positions[idx + 4] = positions[idx + 1] - dropLength;
          positions[idx] = camX + (Math.random() - 0.5) * spreadX;
          positions[idx + 3] = positions[idx] + 0.08;
          positions[idx + 2] = camZ + (Math.random() - 0.5) * spreadZ;
          positions[idx + 5] = positions[idx + 2] + 0.08;
        }
      }

      posAttr.needsUpdate = true;
    }
  }
}
