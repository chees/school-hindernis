import * as THREE from 'three';
import { GameWorld } from './world.js';
import { Player } from './player.js';
import { InputControls } from './controls.js';
import { sounds } from './audio.js';
import { weather } from './weather.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.gameState = 'WAKING'; // WAKING, PLAYING, CUSTOMIZING, WON

    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
    const testTimeParam = new URLSearchParams(window.location.search).get('time');
    this.totalTime = testTimeParam ? parseFloat(testTimeParam) : 180; // 3 minuten (180s) tot schoolbel 08:30
    this.timeLeft = this.totalTime;

    // Speurtocht toestand
    this.hasBag = false;
    this.speurtochtFound = { agenda: false, bottle: false, lunchbox: false, pencilcase: false, key: false };
    this.speurtochtCountFound = 0;
    this.speurtochtTotal = 5;
    this.toastTimeout = null;

    // Auto en school toestand
    this.frontDoorOpen = false;
    this.carBoarded = false;
    this.carSpeed = 0;
    this.carMaxSpeed = 16.0;
    this.lockerCompleted = false;

    this.initThree();
    this.initGameObjects();
    this.initUI();
    this.initEvents();

    // Start gameloop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Start wekker alarmgeluid na een kleine pauze
    setTimeout(() => {
      sounds.startAlarm();
      this.world.interactiveObjects.alarmRinging = true;
    }, 400);
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe);
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.025);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.2,
      80
    );

    this.cameraYaw = 0;
    this.cameraPitch = 0.35;
    this.maxCameraDistance = 4.2;
    this.minCameraDistance = 0.65;
    this.currentCameraDistance = 4.2;
    this.cameraCollisionMargin = 0.28;
    this.cameraRaycaster = new THREE.Raycaster();
    this.cameraTarget = new THREE.Vector3();
    this.cameraCurrentPos = new THREE.Vector3();

    this.camera.position.set(-5.8, 4.8, -4.0);
    this.camera.lookAt(-5.8, 4.0, -5.5);
  }

  initGameObjects() {
    this.world = new GameWorld(this.scene);
    this.player = new Player(this.scene, this.world);
    this.controls = new InputControls(this.canvas);

    this.initConfetti();
  }

  initConfetti() {
    this.confettiParticles = [];
    const count = 70;
    const colors = [0xf43f5e, 0x3b82f6, 0x10b981, 0xfacc15, 0xa855f7];

    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(0.12, 0.12);
      const col = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      group.add(mesh);

      this.confettiParticles.push({
        mesh,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(
          Math.random() * 8 - 4,
          Math.random() * 8 - 4,
          Math.random() * 8 - 4
        ),
        active: false
      });
    }
    this.scene.add(group);
  }

  triggerConfetti(origin) {
    for (const p of this.confettiParticles) {
      p.mesh.position.copy(origin);
      p.mesh.position.y += 1.2;
      p.mesh.visible = true;
      p.active = true;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4;
      p.vel.set(
        Math.cos(angle) * speed,
        3.5 + Math.random() * 3.5,
        Math.sin(angle) * speed
      );
    }
  }

  initUI() {
    this.objectiveEl = document.getElementById('objective-text');
    this.promptEl = document.getElementById('interaction-prompt');
    this.actionBtn = document.getElementById('btn-action');
    this.actionBtnIcon = document.getElementById('action-btn-icon');
    this.actionBtnLabel = document.getElementById('action-btn-label');
    this.wakeupModal = document.getElementById('wakeup-modal');
    this.wardrobeModal = document.getElementById('wardrobe-modal');
    this.victoryModal = document.getElementById('victory-modal');
    this.finalTimeEl = document.getElementById('final-time');

    this.toiletPill = document.getElementById('hud-toilet-pill');
    this.toiletIcon = document.getElementById('hud-toilet-icon');
    this.toiletText = document.getElementById('hud-toilet-text');
    this.toiletFill = document.getElementById('hud-toilet-fill');

    this.timerPill = document.getElementById('hud-timer-pill');
    this.timerText = document.getElementById('hud-timer-text');
    this.timerFill = document.getElementById('hud-timer-fill');
    this.gameoverModal = document.getElementById('gameover-modal');
    this.gameoverStats = document.getElementById('gameover-stats');
    this.finalTimeLeftEl = document.getElementById('final-time-left');

    this.speurtochtHud = document.getElementById('speurtocht-hud');
    this.speurtochtCount = document.getElementById('speurtocht-count');
    this.pickupToast = document.getElementById('pickup-toast');
    this.pickupToastIcon = document.getElementById('pickup-toast-icon');
    this.pickupToastText = document.getElementById('pickup-toast-text');

    this.updateWeatherUI();
    this.updateToiletUI();
    this.updateSpeurtochtUI();
    this.updateTimerUI();

    // Word wakker knop
    const wakeupBtn = document.getElementById('btn-wakeup');
    wakeupBtn.addEventListener('click', () => this.handleWakeup());

    // Knoppen in overwinning modal
    document.getElementById('btn-play-again').addEventListener('click', () => this.restartGame());
    document.getElementById('btn-explore').addEventListener('click', () => {
      this.victoryModal.classList.remove('active');
    });

    // Knop in game over modal
    const retryGameoverBtn = document.getElementById('btn-retry-gameover');
    if (retryGameoverBtn) {
      retryGameoverBtn.addEventListener('click', () => this.restartGame());
    }

    // Bovenbalk knoppen
    const muteBtn = document.getElementById('btn-mute');
    muteBtn.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('btn-restart').addEventListener('click', () => this.restartGame());

    const fsBtn = document.getElementById('btn-fullscreen');
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Spatiebalk / E interactie om wakker te worden in WAKING state
    window.addEventListener('keydown', (e) => {
      if (this.gameState === 'WAKING' && (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter')) {
        this.handleWakeup();
      }
    });

    // Setup Customizer Studio controls
    this.setupCustomizerEvents();

    // Autostart ondersteuning voor testen/screenshots
    if (new URLSearchParams(window.location.search).get('autostart') === '1') {
      this.wakeupModal.style.display = 'none';
      this.handleWakeup();
    }
    if (new URLSearchParams(window.location.search).get('bag') === '1') {
      this.wakeupModal.style.display = 'none';
      this.player.position.set(-6.6 + 0.6, this.world.UPPER_Y, -1.0 + 0.6);
      this.player.group.position.copy(this.player.position);
      this.gameState = 'PLAYING';
      this.player.state = 'ACTIVE';
      this.player.bodyGroup.rotation.x = 0;
      this.player.bodyGroup.rotation.z = 0;
      sounds.stopAlarm();
      this.world.interactiveObjects.alarmRinging = false;
    }
    if (new URLSearchParams(window.location.search).get('speurtocht') === '1') {
      this.wakeupModal.style.display = 'none';
      this.player.position.set(-6.6 + 0.6, this.world.UPPER_Y, -1.0 + 0.6);
      this.player.group.position.copy(this.player.position);
      this.gameState = 'PLAYING';
      this.player.state = 'ACTIVE';
      this.player.bodyGroup.rotation.x = 0;
      this.player.bodyGroup.rotation.z = 0;
      sounds.stopAlarm();
      this.world.interactiveObjects.alarmRinging = false;
      this.hasBag = true;
      this.world.pickUpSchoolBag();
      this.player.equipBackpack();
      if (this.speurtochtHud) this.speurtochtHud.classList.add('visible');
    }
    if (new URLSearchParams(window.location.search).get('door') === '1') {
      this.wakeupModal.style.display = 'none';
      this.player.position.set(1.5, this.world.LOWER_Y, 11.5);
      this.player.group.position.copy(this.player.position);
      this.gameState = 'PLAYING';
      this.player.state = 'ACTIVE';
      this.player.bodyGroup.rotation.x = 0;
      this.player.bodyGroup.rotation.z = 0;
      sounds.stopAlarm();
      this.world.interactiveObjects.alarmRinging = false;
      this.player.isDressed = true;
      this.player.wearSchoolClothes();
      this.hasBag = true;
      this.world.pickUpSchoolBag();
      this.player.equipBackpack();
      for (const k in this.world.speurtochtItems) {
        this.world.pickUpSpeurtochtItem(k);
        this.speurtochtFound[k] = true;
      }
      this.speurtochtCountFound = 5;
      this.updateSpeurtochtUI();
      if (this.speurtochtHud) this.speurtochtHud.classList.add('visible');
      if (this.world.frontDoorMarker) this.world.frontDoorMarker.visible = true;
      if (this.world.frontDoorArrow) this.world.frontDoorArrow.visible = true;
    }
    if (new URLSearchParams(window.location.search).get('wardrobe') === '1') {
      this.wakeupModal.style.display = 'none';
      this.player.position.set(-7.35 + 1.6, this.world.LOWER_Y, 7.5);
      this.player.group.position.copy(this.player.position);
      this.gameState = 'PLAYING';
      this.handleWardrobeReached();
    }
    if (new URLSearchParams(window.location.search).get('victory') === '1') {
      this.wakeupModal.style.display = 'none';
      this.player.position.set(1.5, this.world.LOWER_Y, 12.0);
      this.player.group.position.copy(this.player.position);
      this.player.isDressed = true;
      this.player.wearSchoolClothes();
      this.hasBag = true;
      this.player.equipBackpack();
      this.handleLockerReached();
    }
    const sceneParam = new URLSearchParams(window.location.search).get('scene');
    if (sceneParam === 'car') {
      this.wakeupModal.style.display = 'none';
      this.player.isDressed = true;
      this.player.wearSchoolClothes();
      this.hasBag = true;
      this.world.pickUpSchoolBag();
      this.player.equipBackpack();
      this.speurtochtCountFound = 5;
      this.handleFrontDoorReached();
      this.player.position.set(1.5, this.world.LOWER_Y, 17.5);
      this.player.group.position.copy(this.player.position);
      this.gameState = 'PLAYING';
    } else if (sceneParam === 'drive') {
      this.wakeupModal.style.display = 'none';
      this.player.isDressed = true;
      this.player.wearSchoolClothes();
      this.hasBag = true;
      this.world.pickUpSchoolBag();
      this.player.equipBackpack();
      this.speurtochtCountFound = 5;
      this.handleFrontDoorReached();
      this.boardCar();
      this.world.carGroup.position.set(0, this.world.LOWER_Y, 26.0);
    } else if (sceneParam === 'school') {
      this.wakeupModal.style.display = 'none';
      this.player.isDressed = true;
      this.player.wearSchoolClothes();
      this.hasBag = true;
      this.world.pickUpSchoolBag();
      this.player.equipBackpack();
      this.speurtochtCountFound = 5;
      this.handleFrontDoorReached();
      this.carBoarded = true;
      this.arriveAtSchool();
      this.player.position.set(0, this.world.LOWER_Y, 88.0);
      this.player.group.position.copy(this.player.position);
    }

    if ((this.gameState === 'PLAYING' || this.gameState === 'DRIVING') && this.startTime === 0) {
      this.startTime = performance.now();
      this.timeLeft = this.totalTime;
      this.updateTimerUI();
    }
  }

  showPickupToast(icon, text) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.pickupToastIcon) this.pickupToastIcon.textContent = icon;
    if (this.pickupToastText) this.pickupToastText.textContent = text;
    if (this.pickupToast) {
      this.pickupToast.classList.add('show');
      this.toastTimeout = setTimeout(() => {
        this.pickupToast.classList.remove('show');
      }, 2200);
    }
  }

  updateSpeurtochtUI() {
    if (this.speurtochtCount) {
      this.speurtochtCount.textContent = `${this.speurtochtCountFound}/${this.speurtochtTotal}`;
    }
    for (const key in this.speurtochtFound) {
      const badge = document.getElementById('item-badge-' + key);
      if (badge) {
        const statusEl = badge.querySelector('.item-status');
        if (this.speurtochtFound[key]) {
          badge.classList.add('found');
          if (statusEl) statusEl.textContent = '✅';
        } else {
          badge.classList.remove('found');
          if (statusEl) statusEl.textContent = '⭕';
        }
      }
    }
  }

  updateWeatherUI() {
    const w = weather.getWeather();

    // HUD Pill
    const hudIcon = document.getElementById('hud-weather-icon');
    const hudText = document.getElementById('hud-weather-text');
    if (hudIcon) hudIcon.textContent = w.icon;
    if (hudText) hudText.textContent = `${w.temp} ${w.label}`;

    // Waking up hint
    const wakeSummary = document.getElementById('wakeup-weather-summary');
    if (wakeSummary) wakeSummary.textContent = `${w.icon} ${w.temp} - ${w.label}`;

    // Wardrobe studio box
    const wIcon = document.getElementById('wardrobe-weather-icon');
    const wLabel = document.getElementById('wardrobe-weather-label');
    const wTemp = document.getElementById('wardrobe-weather-temp');
    const wAdvice = document.getElementById('wardrobe-weather-advice');
    if (wIcon) wIcon.textContent = w.icon;
    if (wLabel) wLabel.textContent = w.label;
    if (wTemp) wTemp.textContent = w.temp;
    if (wAdvice) wAdvice.textContent = w.advice;
  }

  updateToiletUI(justUsed = false) {
    if (!this.toiletPill) return;
    const need = this.player ? this.player.toiletNeed : 100;

    if (need > 0) {
      if (this.toiletRelievedTimeout) {
        clearTimeout(this.toiletRelievedTimeout);
        this.toiletRelievedTimeout = null;
      }
      this.toiletPill.style.display = 'flex';
      this.toiletPill.style.opacity = '1';
      this.toiletPill.className = 'toilet-pill urgent';
      if (this.toiletIcon) this.toiletIcon.textContent = '🚽';
      if (this.toiletText) this.toiletText.textContent = 'Hoge nood!';
      if (this.toiletFill) this.toiletFill.style.width = `${need}%`;
    } else if (justUsed) {
      // Laat heel even zien dat je opgelucht bent, daarna verdwijnt de pil uit de bovenbalk
      this.toiletPill.style.display = 'flex';
      this.toiletPill.className = 'toilet-pill relieved';
      if (this.toiletIcon) this.toiletIcon.textContent = '✨';
      if (this.toiletText) this.toiletText.textContent = 'Opgelucht!';
      if (this.toiletFill) this.toiletFill.style.width = '0%';
      this.toiletPill.style.opacity = '1';

      if (this.toiletRelievedTimeout) clearTimeout(this.toiletRelievedTimeout);
      this.toiletRelievedTimeout = setTimeout(() => {
        this.toiletPill.style.opacity = '0';
        setTimeout(() => {
          if (this.player && this.player.toiletNeed <= 0) {
            this.toiletPill.style.display = 'none';
          }
        }, 400);
      }, 1800);
    } else {
      // Als je niet naar de wc hoeft, staat dit niet in beeld boven
      if (this.toiletRelievedTimeout) {
        clearTimeout(this.toiletRelievedTimeout);
        this.toiletRelievedTimeout = null;
      }
      this.toiletPill.style.display = 'none';
    }
  }

  formatTime(seconds) {
    const clamped = Math.max(0, Math.ceil(seconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateTimerUI() {
    if (!this.timerText || !this.timerFill) return;
    this.timerText.textContent = this.formatTime(this.timeLeft);
    const pct = Math.max(0, Math.min(100, (this.timeLeft / this.totalTime) * 100));
    this.timerFill.style.width = `${pct}%`;

    if (this.timerPill) {
      if (this.timeLeft <= 25) {
        this.timerPill.classList.add('critical');
        this.timerPill.classList.remove('warning');
      } else if (this.timeLeft <= 60) {
        this.timerPill.classList.add('warning');
        this.timerPill.classList.remove('critical');
      } else {
        this.timerPill.classList.remove('warning', 'critical');
      }
    }
  }

  handleTimeOut() {
    if (this.gameState === 'LOST' || this.gameState === 'WON') return;
    this.gameState = 'LOST';
    this.timeLeft = 0;
    this.updateTimerUI();
    sounds.playSchoolBell();

    if (this.wardrobeModal) {
      this.wardrobeModal.classList.remove('active');
    }

    if (this.gameoverStats) {
      const dressedText = this.player.isDressed ? '✅ Aangekleed' : '❌ Nog in pyjama';
      const bagText = this.hasBag ? '✅ Schooltas gepakt' : '❌ Schooltas vergeten';
      const toiletText = this.player.toiletNeed === 0 ? '✅ Naar de wc geweest' : '❌ Hoge nood';
      const itemsText = `🎒 ${this.speurtochtCountFound}/${this.speurtochtTotal} schoolspullen`;

      this.gameoverStats.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 6px; color: #1e293b;">Wat had je al gedaan?</div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: #475569;">
          <div>${itemsText} • ${bagText}</div>
          <div>${dressedText} • ${toiletText}</div>
        </div>
      `;
    }

    if (this.gameoverModal) {
      this.gameoverModal.classList.add('active');
    }
    this.setObjective('🔔 TRRRING! De schoolbel rinkelt al... je bent te laat voor school!');
  }

  setupCustomizerEvents() {
    // 1. Geslacht
    const genderBtns = document.querySelectorAll('#gender-choices .btn-choice');
    const hairStyleBtns = document.querySelectorAll('#hair-choices .btn-choice');

    genderBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        genderBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const gender = btn.dataset.gender;
        const defaultStyle = gender === 'GIRL' ? 'PONYTAIL' : 'SHORT';

        // Update hair style button active state
        hairStyleBtns.forEach((b) => {
          b.classList.toggle('active', b.dataset.style === defaultStyle);
        });

        this.player.setCustomization({ gender, hairStyle: defaultStyle });
        sounds.playBlip();
      });
    });

    // 2. Kapsel Stijl
    hairStyleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        hairStyleBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ hairStyle: btn.dataset.style });
        sounds.playBlip();
      });
    });

    // Haarkleur
    const hairSwatches = document.querySelectorAll('#hair-swatches .color-swatch');
    hairSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        hairSwatches.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ hairColor: Number(btn.dataset.color) });
        sounds.playBlip();
      });
    });

    // 3. Bovenkleding type (Trui vs T-shirt)
    const topBtns = document.querySelectorAll('#top-choices .btn-choice');
    topBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        topBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ topType: btn.dataset.top });
        sounds.playBlip();
      });
    });

    // Top kleur swatches
    const topSwatches = document.querySelectorAll('#top-swatches .color-swatch');
    topSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        topSwatches.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ topColor: Number(btn.dataset.color) });
        sounds.playBlip();
      });
    });

    // 4. Onderkleding type (Broek vs Shorts)
    const bottomBtns = document.querySelectorAll('#bottom-choices .btn-choice');
    bottomBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        bottomBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ bottomType: btn.dataset.bottom });
        sounds.playBlip();
      });
    });

    // Bottom kleur swatches
    const bottomSwatches = document.querySelectorAll('#bottom-swatches .color-swatch');
    bottomSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        bottomSwatches.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ bottomColor: Number(btn.dataset.color) });
        sounds.playBlip();
      });
    });

    // 5. Schooltas Type (Rugzak, Schoudertas, Geen)
    const backpackBtns = document.querySelectorAll('#backpack-choices .btn-choice');
    backpackBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        backpackBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ backpackType: btn.dataset.backpack });
        sounds.playBlip();
      });
    });

    // Tas kleur swatches
    const backpackSwatches = document.querySelectorAll('#backpack-swatches .color-swatch');
    backpackSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        backpackSwatches.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.player.setCustomization({ backpackColor: Number(btn.dataset.color) });
        sounds.playBlip();
      });
    });

    // Draai knoppen om 3D personage rondom te inspecteren
    const turnLeft = document.getElementById('btn-turn-left');
    const turnFront = document.getElementById('btn-turn-front');
    const turnBack = document.getElementById('btn-turn-back');
    const turnRight = document.getElementById('btn-turn-right');

    if (turnLeft) {
      turnLeft.addEventListener('click', () => {
        this.player.rotation += Math.PI / 4;
        this.player.group.rotation.y = this.player.rotation;
        sounds.playBlip();
      });
    }
    if (turnFront) {
      turnFront.addEventListener('click', () => {
        this.player.rotation = Math.PI / 2;
        this.player.group.rotation.y = this.player.rotation;
        sounds.playBlip();
      });
    }
    if (turnBack) {
      turnBack.addEventListener('click', () => {
        this.player.rotation = -Math.PI / 2;
        this.player.group.rotation.y = this.player.rotation;
        sounds.playBlip();
      });
    }
    if (turnRight) {
      turnRight.addEventListener('click', () => {
        this.player.rotation -= Math.PI / 4;
        this.player.group.rotation.y = this.player.rotation;
        sounds.playBlip();
      });
    }

    // Aantrekken knop
    const wearBtn = document.getElementById('btn-wear-outfit');
    if (wearBtn) {
      wearBtn.addEventListener('click', () => this.finalizeOutfit());
    }
  }

  handleWakeup() {
    if (this.gameState !== 'WAKING') return;

    sounds.stopAlarm();
    this.world.interactiveObjects.alarmRinging = false;
    sounds.playBlip();

    this.wakeupModal.classList.add('fade-out');
    this.gameState = 'PLAYING';
    this.startTime = performance.now();
    this.timeLeft = this.totalTime;
    this.updateTimerUI();

    this.world.uncoverBed();
    this.player.wakeUp(() => {
      this.updateToiletUI();
      if (this.player.toiletNeed > 0) {
        this.setObjective('🚽 Je hebt hoge nood! Ga naar de badkamer boven om naar de wc te gaan!');
      } else {
        this.setObjective('🏃 Daal de houten trap af naar de kleerkast beneden!');
      }
    });
  }

  setObjective(text) {
    if (this.objectiveEl) {
      this.objectiveEl.textContent = text;
    }
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  restartGame() {
    this.gameState = 'WAKING';
    this.victoryModal.classList.remove('active');
    this.wardrobeModal.classList.remove('active');
    if (this.gameoverModal) this.gameoverModal.classList.remove('active');
    this.wakeupModal.classList.remove('fade-out');
    this.wakeupModal.style.display = '';

    // Timer resetten
    this.timeLeft = this.totalTime;
    this.elapsedTime = 0;
    if (this.timerPill) this.timerPill.classList.remove('warning', 'critical');
    this.updateTimerUI();

    // Nieuw willekeurig weerbericht
    weather.currentWeather = weather.pickRandomWeather();
    this.updateWeatherUI();

    // Speurtocht resetten
    this.hasBag = false;
    this.speurtochtFound = { agenda: false, bottle: false, lunchbox: false, pencilcase: false, key: false };
    this.speurtochtCountFound = 0;
    this.updateSpeurtochtUI();
    if (this.speurtochtHud) this.speurtochtHud.classList.remove('visible');

    // Auto en school toestand resetten
    this.frontDoorOpen = false;
    this.carBoarded = false;
    this.carSpeed = 0;
    this.lockerCompleted = false;
    sounds.stopCarEngine();
    this.player.group.visible = true;

    this.world.resetSpeurtocht();

    this.player.setSleepingPose();
    this.player.isDressed = false;
    this.player.torsoMesh.material = this.player.pjTopMat;
    this.player.leftUpperArmMesh.material = this.player.pjTopMat;
    this.player.leftLowerArmMesh.material = this.player.pjTopMat;
    this.player.rightUpperArmMesh.material = this.player.pjTopMat;
    this.player.rightLowerArmMesh.material = this.player.pjTopMat;
    this.player.leftUpperLegMesh.material = this.player.pjPantsMat;
    this.player.leftLowerLegMesh.material = this.player.pjPantsMat;
    this.player.rightUpperLegMesh.material = this.player.pjPantsMat;
    this.player.rightLowerLegMesh.material = this.player.pjPantsMat;
    this.player.leftFootMesh.material = this.player.pjSlippersMat;
    this.player.rightFootMesh.material = this.player.pjSlippersMat;
    if (this.player.backpackGroup) this.player.backpackGroup.visible = false;

    this.world.coverBed();

    if (this.world.doorLeft) this.world.doorLeft.rotation.y = 0;
    if (this.world.doorRight) this.world.doorRight.rotation.y = 0;
    this.world.interactiveObjects.wardrobe.opened = false;
    if (this.world.wardrobeArrow) this.world.wardrobeArrow.visible = true;
    if (this.world.wardrobeMarker) this.world.wardrobeMarker.visible = true;

    if (this.world.interactiveObjects.toilet) {
      this.world.interactiveObjects.toilet.used = false;
    }
    if (this.world.toiletArrow) this.world.toiletArrow.visible = true;
    if (this.world.toiletMarker) this.world.toiletMarker.visible = true;
    if (this.toiletRelievedTimeout) {
      clearTimeout(this.toiletRelievedTimeout);
      this.toiletRelievedTimeout = null;
    }
    this.updateToiletUI();

    this.cameraYaw = 0;
    this.cameraPitch = 0.35;
    this.currentCameraDistance = this.maxCameraDistance;
    this.camera.position.set(-5.8, 4.8, -4.0);
    this.camera.lookAt(-5.8, 4.0, -5.5);

    this.setObjective('⏰ De wekker gaat! Word snel wakker...');

    sounds.startAlarm();
    this.world.interactiveObjects.alarmRinging = true;
  }

  updateCamera(dt) {
    const camParam = new URLSearchParams(window.location.search).get('cam');
    if (camParam === 'stairs') {
      this.camera.position.set(3.5, 4.8, -2.5);
      this.camera.lookAt(3.5, 1.0, 4.0);
      return;
    } else if (camParam === 'wardrobe') {
      this.camera.position.set(-4.2, 2.0, 7.5);
      this.camera.lookAt(-7.35, 1.3, 7.5);
      return;
    } else if (camParam === 'feet') {
      this.camera.position.set(-4.2, 4.3, -1.8);
      this.camera.lookAt(-4.2, 3.8, -3.5);
      return;
    } else if (camParam === 'bedroom_floor') {
      this.camera.position.set(-3.5, 6.5, -0.5);
      this.camera.lookAt(-4.0, 3.6, -4.0);
      return;
    }

    const target = this.player.group.position.clone();
    target.y += 1.25;

    if (this.gameState === 'WAKING') {
      this.camera.lookAt(target);
      return;
    }

    if (this.gameState === 'CUSTOMIZING') {
      // Draai-rotatie via touch swipe / muisdrag op het 3D scherm
      const deltas = this.controls.consumeCameraDeltas();
      if (Math.abs(deltas.yaw) > 0.001) {
        this.player.rotation -= deltas.yaw * 1.5;
        this.player.group.rotation.y = this.player.rotation;
      }

      const isMobile = window.innerWidth <= 768;
      let customCamPos;
      let customLookAt;

      if (isMobile) {
        // Mobiel: kleerkast studio staat onderaan, model gecentreerd in bovenste helft
        customCamPos = target.clone().add(new THREE.Vector3(2.4, 0.4, 0));
        customLookAt = target.clone().add(new THREE.Vector3(0, -0.25, 0));
      } else {
        // Desktop / Chromebook: studio rechts, model mooi gecentreerd links van het paneel
        customCamPos = target.clone().add(new THREE.Vector3(2.4, 0.1, -0.85));
        customLookAt = target.clone().add(new THREE.Vector3(0, -0.1, 0.4));
      }

      this.camera.position.lerp(customCamPos, dt * 6);
      this.camera.lookAt(customLookAt);
      return;
    }

    const deltas = this.controls.consumeCameraDeltas();
    this.cameraYaw += deltas.yaw;
    this.cameraPitch = Math.max(0.08, Math.min(1.2, this.cameraPitch + deltas.pitch));

    // Eenheidsrichting vanuit target naar de gewenste camerapositie
    const dirX = Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
    const dirY = Math.sin(this.cameraPitch);
    const dirZ = Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);
    const camDir = new THREE.Vector3(dirX, dirY, dirZ).normalize();

    // Multi-probe raycasting om te voorkomen dat de camera achter een muur/plafond verdwijnt
    let minHitDistance = this.maxCameraDistance;
    const occluders = this.world.getCameraOccluders();

    if (occluders && occluders.length > 0) {
      // Bereken haakse vectoren op de zichtas voor een zachte viewport-buffer
      const camRight = new THREE.Vector3(-camDir.z, 0, camDir.x).normalize();
      const camUp = new THREE.Vector3().crossVectors(camRight, camDir).normalize();
      const probeRadius = 0.16;

      const probes = [
        target,
        target.clone().addScaledVector(camRight, probeRadius).addScaledVector(camUp, probeRadius * 0.7),
        target.clone().addScaledVector(camRight, -probeRadius).addScaledVector(camUp, probeRadius * 0.7),
        target.clone().addScaledVector(camRight, probeRadius).addScaledVector(camUp, -probeRadius * 0.7),
        target.clone().addScaledVector(camRight, -probeRadius).addScaledVector(camUp, -probeRadius * 0.7)
      ];

      for (let i = 0; i < probes.length; i++) {
        this.cameraRaycaster.set(probes[i], camDir);
        this.cameraRaycaster.far = this.maxCameraDistance;
        const hits = this.cameraRaycaster.intersectObjects(occluders, false);
        if (hits.length > 0) {
          const hitDist = hits[0].distance;
          if (hitDist > 0.15 && hitDist < minHitDistance) {
            minHitDistance = hitDist;
          }
        }
      }
    }

    // Bereken de gewenste afstand met veiligheidsmarge tegen muurvlakken
    let targetDist = this.maxCameraDistance;
    if (minHitDistance < this.maxCameraDistance) {
      targetDist = Math.max(this.minCameraDistance, minHitDistance - this.cameraCollisionMargin);
    }

    // SpringArm respons: flitsend snel inzoomen bij naderende muur, vloeiend uitzoomen in open ruimte
    if (targetDist < this.currentCameraDistance) {
      const snapIn = Math.min(dt * 24, 1.0);
      this.currentCameraDistance = THREE.MathUtils.lerp(this.currentCameraDistance, targetDist, snapIn);
    } else {
      const zoomOut = Math.min(dt * 6, 1.0);
      this.currentCameraDistance = THREE.MathUtils.lerp(this.currentCameraDistance, targetDist, zoomOut);
    }

    const desiredPos = target.clone().addScaledVector(camDir, this.currentCameraDistance);

    // Vloerdetectie: voorkom dat de camera door of onder de vloer zakt
    const groundY = this.world.getGroundHeightAt(desiredPos.x, desiredPos.z, target.y);
    if (desiredPos.y < groundY + 0.35) {
      desiredPos.y = groundY + 0.35;
    }

    this.camera.position.copy(desiredPos);
    this.camera.lookAt(target);

    // Zachte transparantie voor het personage als de camera in een krappe hoek dichtbij komt
    if (this.currentCameraDistance < 1.0) {
      const alpha = Math.max(0.35, Math.min(1.0, (this.currentCameraDistance - 0.45) / 0.5));
      this.player.setProximityFade(alpha);
    } else {
      this.player.setProximityFade(1.0);
    }
  }

  updateConfetti(dt) {
    for (const p of this.confettiParticles) {
      if (!p.active) continue;
      p.vel.y -= 9.8 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.rotVel.x * dt;
      p.mesh.rotation.y += p.rotVel.y * dt;
      p.mesh.rotation.z += p.rotVel.z * dt;

      if (p.mesh.position.y < this.world.LOWER_Y) {
        p.mesh.position.y = this.world.LOWER_Y;
        p.active = false;
        setTimeout(() => { p.mesh.visible = false; }, 3000);
      }
    }
  }

  checkObjectives() {
    if (this.gameState !== 'PLAYING') return;

    const playerPos = this.player.position;
    const wardrobe = this.world.interactiveObjects.wardrobe;
    const toilet = this.world.interactiveObjects.toilet;
    const sink = this.world.interactiveObjects.sink;
    const shower = this.world.interactiveObjects.shower;
    const schoolBag = this.world.interactiveObjects.schoolBag;
    const frontDoor = this.world.interactiveObjects.frontDoor;

    const onStairs = this.world.isOnStairs(playerPos.x, playerPos.z);
    const isDownstairs = playerPos.y < 1.0;

    // Doeltekst updates
    if (this.player.toiletNeed > 0) {
      if (!isDownstairs && !onStairs) {
        if (playerPos.x >= 2.2 && playerPos.z <= -0.6) {
          this.setObjective('🚽 Je bent in de badkamer! Ga naar het toilet om te plassen.');
        } else {
          this.setObjective('🚽 Hoge nood! Ga naar de badkamer boven om naar de wc te gaan!');
        }
      } else if (onStairs) {
        this.setObjective('🪜 Oei, met een volle blaas op de trap! Wees voorzichtig...');
      } else if (isDownstairs) {
        this.setObjective('🚽 Hoge nood! Ga boven naar de badkamer!');
      }
    } else if (!this.hasBag) {
      if (!isDownstairs && !onStairs) {
        this.setObjective('🎒 Pak je schooltas op je bureau in de slaapkamer!');
      } else {
        this.setObjective('🎒 Loop naar boven: pak je schooltas op je bureau in de slaapkamer!');
      }
    } else if (this.speurtochtCountFound < this.speurtochtTotal) {
      if (!this.player.isDressed) {
        this.setObjective(`🎒 Speurtocht: ${this.speurtochtCountFound}/${this.speurtochtTotal} spullen gevonden! Vergeet je kleren niet bij de kast.`);
      } else {
        this.setObjective(`🎒 Speurtocht: zoek je schoolspullen door het huis (${this.speurtochtCountFound}/${this.speurtochtTotal})!`);
      }
    } else if (!this.player.isDressed) {
      this.setObjective('✨ Alle schoolspullen in je tas! Ga nu naar de kleerkast beneden om je aan te kleden!');
    } else if (!this.frontDoorOpen) {
      this.setObjective('🚪 Alles compleet en aangekleed! Ren naar de voordeur en ga naar school!');
      if (this.world.frontDoorMarker) this.world.frontDoorMarker.visible = true;
      if (this.world.frontDoorArrow) this.world.frontDoorArrow.visible = true;
    } else if (!this.carBoarded) {
      this.setObjective('🚗 Loop naar buiten en stap in de auto op de oprit!');
      if (this.world.carMarker) this.world.carMarker.visible = true;
      if (this.world.carArrow) this.world.carArrow.visible = true;
    } else if (!this.lockerCompleted) {
      this.setObjective('🏫 Loop de schoolgang in naar kluisje #7!');
      if (this.world.lockerMarker) this.world.lockerMarker.visible = true;
      if (this.world.lockerArrow) this.world.lockerArrow.visible = true;
    }

    // Afstanden tot interactieve objecten
    const distToToilet = toilet ? playerPos.distanceTo(toilet.position) : 999;
    const distToSink = sink ? playerPos.distanceTo(sink.position) : 999;
    const distToShower = shower ? playerPos.distanceTo(shower.position) : 999;
    const distToBag = (!this.hasBag && schoolBag) ? playerPos.distanceTo(schoolBag.position) : 999;
    const distToWardrobe = wardrobe ? playerPos.distanceTo(wardrobe.position) : 999;
    const distToDoor = (!this.frontDoorOpen && frontDoor) ? playerPos.distanceTo(frontDoor.position) : 999;
    const car = this.world.interactiveObjects.car;
    const locker = this.world.interactiveObjects.locker;
    const distToCar = (this.frontDoorOpen && !this.carBoarded && car) ? playerPos.distanceTo(car.position) : 999;
    const distToLocker = (this.carBoarded && !this.lockerCompleted && locker) ? playerPos.distanceTo(locker.position) : 999;

    let activeInteraction = null;

    if (distToToilet <= toilet.radius) {
      activeInteraction = 'TOILET';
      this.promptEl.textContent = this.player.toiletNeed > 0
        ? '🚽 Druk op [E] of tik op [WC] om naar de wc te gaan!'
        : '🚽 Druk op [E] of tik op [WC] om nog eens door te spoelen!';
      if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🚽';
      if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'WC';
    } else if (distToSink <= sink.radius) {
      activeInteraction = 'SINK';
      this.promptEl.textContent = '🚰 Druk op [E] of tik op [Kraan] om je handen te wassen!';
      if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🚰';
      if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Kraan';
    } else if (distToShower <= shower.radius) {
      activeInteraction = 'SHOWER';
      this.promptEl.textContent = '🚿 Druk op [E] of tik op [Douche] om de douche te starten!';
      if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🚿';
      if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Douche';
    } else if (!this.hasBag && schoolBag && distToBag <= schoolBag.radius) {
      activeInteraction = 'BAG';
      this.promptEl.textContent = '🎒 Druk op [E] of tik op [Tas] om je schooltas te pakken!';
      if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🎒';
      if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Tas';
    } else if (distToWardrobe <= wardrobe.radius && !this.player.isDressed) {
      activeInteraction = 'WARDROBE';
      this.promptEl.textContent = '✨ Druk op [E] of tik op [Kast] om je aan te kleden!';
      if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🚪';
      if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Kast';
    } else if (!this.frontDoorOpen && frontDoor && distToDoor <= frontDoor.radius) {
      const isReady = this.player.isDressed && this.hasBag && (this.speurtochtCountFound === this.speurtochtTotal);
      if (isReady) {
        activeInteraction = 'FRONTDOOR';
        this.promptEl.textContent = '🚪 Druk op [E] of tik op [Open] om de voordeur te openen!';
        if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🚪';
        if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Open';
      } else {
        if (!this.player.isDressed) {
          this.promptEl.textContent = '⚠️ Je loopt nog in pyjama! Kleed je eerst aan bij de kast.';
        } else if (!this.hasBag) {
          this.promptEl.textContent = '⚠️ Je hebt je schooltas nog niet! Pak hem boven op je bureau.';
        } else {
          this.promptEl.textContent = `⚠️ Je bent nog spullen vergeten! (${this.speurtochtCountFound}/5 in tas)`;
        }
      }
    } else if (distToCar <= (car ? car.radius : 0) && !this.carBoarded) {
      activeInteraction = 'CAR';
      this.promptEl.textContent = '🚗 Druk op [E] of tik op [Instappen] om in de auto te stappen!';
      if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🚗';
      if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Instappen';
    } else if (distToLocker <= (locker ? locker.radius : 0) && !this.lockerCompleted) {
      activeInteraction = 'LOCKER';
      this.promptEl.textContent = '🎒 Druk op [E] of tik op [Kluisje] om je spullen in kluisje #7 te leggen!';
      if (this.actionBtnIcon) this.actionBtnIcon.textContent = '🔐';
      if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Kluisje';
    }

    // Speurtocht items controleren als speler de tas heeft
    if (!activeInteraction && this.hasBag) {
      for (const key in this.world.speurtochtItems) {
        const it = this.world.speurtochtItems[key];
        const interactObj = this.world.interactiveObjects['item_' + key];
        if (!it.picked && interactObj) {
          const d = playerPos.distanceTo(interactObj.position);
          if (d <= interactObj.radius) {
            activeInteraction = 'ITEM_' + key;
            this.promptEl.textContent = `${it.icon} Druk op [E] of tik op [Pak] om ${it.name} te pakken!`;
            if (this.actionBtnIcon) this.actionBtnIcon.textContent = it.icon;
            if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Pak';
            break;
          }
        }
      }
    }

    if (activeInteraction) {
      this.promptEl.classList.add('visible');
      this.actionBtn.classList.add('active-glow');
    } else if (!frontDoor || distToDoor > frontDoor.radius) {
      this.promptEl.classList.remove('visible');
      this.actionBtn.classList.remove('active-glow');
    }

    const interact = this.controls.consumeInteract();
    const keyE = this.controls.keys['KeyE'];
    if ((activeInteraction && interact) || (activeInteraction && keyE)) {
      this.controls.keys['KeyE'] = false;
      if (activeInteraction === 'TOILET') {
        this.world.flushToilet();
        this.player.useToilet();
        this.updateToiletUI(true);
        sounds.playRelief();
        this.setObjective('🚰 Lekker opgelucht! Was even je handen of pak je tas!');
      } else if (activeInteraction === 'SINK') {
        this.world.toggleSink();
        sounds.playWaterTap();
        this.setObjective('🧼 Handen lekker fris gewassen!');
      } else if (activeInteraction === 'SHOWER') {
        this.world.toggleShower();
        sounds.playShower();
      } else if (activeInteraction === 'BAG') {
        this.hasBag = true;
        this.world.pickUpSchoolBag();
        this.player.equipBackpack();
        sounds.playPickup();
        if (this.speurtochtHud) this.speurtochtHud.classList.add('visible');
        this.showPickupToast('🎒', 'Schooltas gepakt! Speurtocht gestart!');
        this.updateSpeurtochtUI();
      } else if (activeInteraction.startsWith('ITEM_')) {
        const key = activeInteraction.replace('ITEM_', '');
        const it = this.world.speurtochtItems[key];
        this.world.pickUpSpeurtochtItem(key);
        this.speurtochtFound[key] = true;
        this.speurtochtCountFound++;
        this.updateSpeurtochtUI();
        sounds.playPickup();
        this.showPickupToast(it.icon, `${it.name} gepakt! (${this.speurtochtCountFound}/${this.speurtochtTotal})`);
        if (this.speurtochtCountFound === this.speurtochtTotal) {
          sounds.playItemComplete();
          if (this.player.isDressed) {
            if (this.world.frontDoorMarker) this.world.frontDoorMarker.visible = true;
            if (this.world.frontDoorArrow) this.world.frontDoorArrow.visible = true;
          }
        }
      } else if (activeInteraction === 'WARDROBE') {
        this.handleWardrobeReached();
      } else if (activeInteraction === 'FRONTDOOR') {
        this.handleFrontDoorReached();
      } else if (activeInteraction === 'CAR') {
        this.boardCar();
      } else if (activeInteraction === 'LOCKER') {
        this.handleLockerReached();
      }
    }
  }

  handleWardrobeReached() {
    if (this.player.isDressed || this.gameState === 'CUSTOMIZING') return;

    this.promptEl.classList.remove('visible');
    this.actionBtn.classList.remove('active-glow');

    // Draai speler richting de camera/spiegel
    this.player.rotation = Math.PI / 2;
    this.player.group.rotation.y = this.player.rotation;

    // Pas meteen de kledingpreview toe op het 3D model
    this.player.applyClothingMaterials();

    // Kast deuren openen
    this.world.openWardrobe();
    sounds.playWardrobeOpen();

    // Open Kleerkast Studio UI
    this.gameState = 'CUSTOMIZING';
    this.wardrobeModal.classList.add('active');
    this.setObjective('🎨 Kies je outfit en pas je kleding aan op het weer!');
  }

  finalizeOutfit() {
    this.wardrobeModal.classList.remove('active');

    // Kleren aantrekken & feest
    this.player.wearSchoolClothes();
    sounds.playWardrobeOpen();
    this.triggerConfetti(this.player.position);

    this.gameState = 'PLAYING';

    if (this.world.wardrobeArrow) this.world.wardrobeArrow.visible = false;
    if (this.world.wardrobeMarker) this.world.wardrobeMarker.visible = false;

    if (this.hasBag && this.speurtochtCountFound === this.speurtochtTotal) {
      if (this.world.frontDoorMarker) this.world.frontDoorMarker.visible = true;
      if (this.world.frontDoorArrow) this.world.frontDoorArrow.visible = true;
      this.setObjective('🚪 Alles compleet en aangekleed! Ren naar de voordeur om naar school te gaan!');
    } else if (!this.hasBag) {
      this.setObjective('🎒 Mooie outfit! Pak nu je schooltas op je bureau in de slaapkamer!');
    } else {
      this.setObjective(`🎒 Mooie outfit! Zoek nu de rest van je schoolspullen (${this.speurtochtCountFound}/${this.speurtochtTotal})!`);
    }
  }

  handleFrontDoorReached() {
    if (this.frontDoorOpen) return;
    this.frontDoorOpen = true;

    this.world.openFrontDoor();
    sounds.playFrontDoor();
    this.triggerConfetti(this.player.position);

    if (this.world.carMarker) this.world.carMarker.visible = true;
    if (this.world.carArrow) this.world.carArrow.visible = true;

    this.setObjective('🚗 Voordeur geopend! Loop naar buiten en stap in de auto op de oprit!');
  }

  boardCar() {
    if (this.carBoarded) return;
    this.carBoarded = true;
    this.gameState = 'DRIVING';
    sounds.playCarDoor();
    sounds.startCarEngine();

    if (this.world.carMarker) this.world.carMarker.visible = false;
    if (this.world.carArrow) this.world.carArrow.visible = false;

    this.player.group.visible = false;
    this.carSpeed = 0;

    this.setObjective('🚗 Rijd veilig naar school! [W/Pijl omhoog] = Gas, [A/D] = Sturen, [Spatie] = Toeteren');
    if (this.actionBtnIcon) this.actionBtnIcon.textContent = '📢';
    if (this.actionBtnLabel) this.actionBtnLabel.textContent = 'Toet!';
  }

  updateDriving(dt) {
    if (this.gameState !== 'DRIVING') return;

    const moveVector = this.controls.getMoveVector();
    const gas = moveVector.y > 0.1 ? moveVector.y : ((this.controls.keys['KeyW'] || this.controls.keys['ArrowUp']) ? 1 : 0);
    const brake = moveVector.y < -0.1 ? -moveVector.y : ((this.controls.keys['KeyS'] || this.controls.keys['ArrowDown']) ? 1 : 0);
    const steer = (this.controls.keys['KeyA'] || this.controls.keys['ArrowLeft']) ? -1 : ((this.controls.keys['KeyD'] || this.controls.keys['ArrowRight']) ? 1 : (Math.abs(moveVector.x) > 0.15 ? moveVector.x : 0));

    // Toeteren via spatiebalk of actieknop
    if (this.controls.keys['Space'] || this.controls.consumeInteract()) {
      this.controls.keys['Space'] = false;
      sounds.playCarHorn();
      this.promptEl.textContent = '📢 TOET TOET!';
      this.promptEl.classList.add('visible');
      setTimeout(() => this.promptEl.classList.remove('visible'), 900);
    }

    // Acceleratie & frictie
    if (gas > 0) {
      this.carSpeed += gas * 13.0 * dt;
    } else if (brake > 0) {
      this.carSpeed -= brake * 18.0 * dt;
    } else {
      this.carSpeed *= Math.max(0, 1 - 1.8 * dt);
    }
    this.carSpeed = Math.max(-4.0, Math.min(this.carMaxSpeed, this.carSpeed));

    sounds.updateCarEngine(Math.abs(this.carSpeed) / this.carMaxSpeed);

    // Sturen (alleen als de auto beweegt)
    if (Math.abs(this.carSpeed) > 0.2) {
      const dir = this.carSpeed >= 0 ? 1 : -1;
      this.world.carGroup.rotation.y += -steer * 1.7 * dt * dir;
      // Limiteer stuurhoek
      this.world.carGroup.rotation.y = Math.max(-0.65, Math.min(0.65, this.world.carGroup.rotation.y));
    }

    // Positie updaten
    const rotY = this.world.carGroup.rotation.y;
    this.world.carGroup.position.x += Math.sin(rotY) * this.carSpeed * dt;
    this.world.carGroup.position.z += Math.cos(rotY) * this.carSpeed * dt;

    // Wegbegrenzing (blijf op straat tussen de stoepen)
    if (this.world.carGroup.position.z > 23.0) {
      if (this.world.carGroup.position.x < -3.6) {
        this.world.carGroup.position.x = -3.6;
        if (rotY < 0) this.world.carGroup.rotation.y *= 0.8;
      } else if (this.world.carGroup.position.x > 3.6) {
        this.world.carGroup.position.x = 3.6;
        if (rotY > 0) this.world.carGroup.rotation.y *= 0.8;
      }
    }

    // Wielen laten draaien
    if (this.world.carWheels) {
      for (const w of this.world.carWheels) {
        if (w.children[0]) {
          w.children[0].rotation.x += this.carSpeed * 3.0 * dt;
        }
      }
    }

    // Achtervolgingscamera
    const carPos = this.world.carGroup.position;
    const targetCam = new THREE.Vector3(
      carPos.x - Math.sin(rotY) * 5.4,
      carPos.y + 2.3,
      carPos.z - Math.cos(rotY) * 5.4
    );
    this.camera.position.lerp(targetCam, Math.min(dt * 8, 1.0));
    this.camera.lookAt(carPos.x, carPos.y + 1.1, carPos.z + 2.5);

    // Check of de school is bereikt (Kiss & Ride parkeerhaven bij z >= 74.0)
    if (this.world.carGroup.position.z >= 74.0) {
      this.arriveAtSchool();
    }
  }

  arriveAtSchool() {
    this.gameState = 'PLAYING';
    sounds.stopCarEngine();
    sounds.playCarDoor();

    this.world.carGroup.position.set(0.5, this.world.LOWER_Y, 76.5);
    this.world.carGroup.rotation.y = 0;
    this.carSpeed = 0;

    this.player.group.position.set(2.2, this.world.LOWER_Y, 77.0);
    this.player.position.copy(this.player.group.position);
    this.player.rotation = 0;
    this.player.group.rotation.y = 0;
    this.player.group.visible = true;

    this.cameraYaw = 0;
    this.cameraPitch = 0.35;
    this.currentCameraDistance = 4.2;

    if (this.world.lockerMarker) this.world.lockerMarker.visible = true;
    if (this.world.lockerArrow) this.world.lockerArrow.visible = true;

    this.setObjective('🏫 Je bent op school! Loop naar binnen door de dubbele schooldeuren naar kluisje #7!');
  }

  handleLockerReached() {
    if (this.gameState === 'WON' || this.lockerCompleted) return;
    this.lockerCompleted = true;

    this.world.openLocker();
    sounds.playLockerOpen();

    if (this.player.backpackGroup) {
      this.player.backpackGroup.visible = false;
    }

    this.triggerConfetti(this.world.interactiveObjects.locker.position);
    sounds.playItemComplete();

    this.setObjective('🔐 Alles veilig opgeborgen in kluisje #7!');

    setTimeout(() => {
      sounds.playLockerClose();
      sounds.playSchoolBell();
      this.finishGame();
    }, 1400);
  }

  finishGame() {
    if (this.gameState === 'WON') return;
    this.gameState = 'WON';
    this.elapsedTime = (performance.now() - this.startTime) / 1000;
    this.timeLeft = Math.max(0, this.totalTime - this.elapsedTime);
    this.setObjective('🎉 Je bent helemaal klaar en net op tijd voor de les!');

    const seconds = this.elapsedTime.toFixed(1);
    this.finalTimeEl.textContent = `${seconds}s`;
    if (this.finalTimeLeftEl) {
      this.finalTimeLeftEl.textContent = `${this.formatTime(this.timeLeft)} over!`;
    }

    // Speurtocht score
    const speurtochtBox = document.getElementById('speurtocht-result-box');
    if (speurtochtBox) {
      speurtochtBox.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 3px;">🌟 Speurtocht & Kluisje: 10/10</div>
        <div>Alle 5 schoolspullen gevonden, veilig in de auto meegenomen en netjes opgeborgen in kluisje #7!</div>
      `;
    }

    // Controleer weer-geschiktheid
    const weatherCheck = weather.checkOutfit(this.player.customization.topType);
    const feedbackBox = document.getElementById('weather-result-box');
    if (feedbackBox) {
      feedbackBox.className = 'weather-feedback-box ' + (weatherCheck.isSuitable ? 'match' : 'mismatch');
      feedbackBox.innerHTML = `
        <div style="font-size: 20px; margin-bottom: 4px;">${weatherCheck.isSuitable ? '🌟 Weer-Score: 10/10' : '⚠️ Weer-Waarschuwing'}</div>
        <div>${weatherCheck.message}</div>
      `;
    }

    // Toilet & Ochtendroutine score
    const toiletBox = document.getElementById('toilet-result-box');
    if (toiletBox) {
      if (this.player.toiletNeed === 0) {
        toiletBox.className = 'toilet-feedback-box';
        toiletBox.innerHTML = `
          <div style="font-size: 18px; margin-bottom: 3px;">🌟 Ochtendroutine: 10/10</div>
          <div>Netjes op tijd naar de wc geweest en fris aan de dag begonnen!</div>
        `;
      } else {
        toiletBox.className = 'toilet-feedback-box missed';
        toiletBox.innerHTML = `
          <div style="font-size: 18px; margin-bottom: 3px;">⚠️ Oei, volle blaas!</div>
          <div>Je bent vertrokken zonder naar de wc te gaan! Vergeet de badkamer volgende keer niet!</div>
        `;
      }
    }

    // Beschrijving van de gekozen outfit
    const outfitDesc = document.getElementById('victory-outfit-desc');
    if (outfitDesc) {
      const topName = this.player.customization.topType === 'SWEATER' ? 'warme trui' : 'T-shirt met korte mouwen';
      const bottomName = this.player.customization.bottomType === 'PANTS' ? 'lange broek' : 'korte broek';
      const genderName = this.player.customization.gender === 'BOY' ? 'stoere jongen' : 'hippe meid';
      const bagName = this.player.customization.backpackType === 'CLASSIC' ? 'rugzak' : (this.player.customization.backpackType === 'SPORT' ? 'schoudertas' : 'tas');
      outfitDesc.textContent = `Je zit klaar in de klas als een ${genderName} in een ${topName} en ${bottomName}. Je ${bagName} staat netjes in kluisje #7!`;
    }

    setTimeout(() => {
      this.victoryModal.classList.add('active');
    }, 1000);
  }

  animate(time) {
    requestAnimationFrame(this.animate);

    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    // Countdown timer voor schoolbel (08:30)
    if (this.gameState === 'PLAYING' || this.gameState === 'CUSTOMIZING' || this.gameState === 'DRIVING') {
      this.elapsedTime = (time - this.startTime) / 1000;
      this.timeLeft = Math.max(0, this.totalTime - this.elapsedTime);
      this.updateTimerUI();

      if (this.timeLeft <= 0) {
        this.handleTimeOut();
      }
    }

    if (this.gameState === 'DRIVING') {
      this.updateDriving(dt);
    } else {
      // Jump handling
      if (this.gameState === 'PLAYING') {
        if (this.controls.consumeJump()) {
          if (this.player.jump()) {
            sounds.playJump();
          }
        }
      }

      // Speler updaten (alleen lopen als gameState PLAYING is)
      const moveVector = (this.gameState === 'PLAYING') ? this.controls.getMoveVector() : new THREE.Vector2(0, 0);
      this.player.update(dt, moveVector, this.cameraYaw, sounds);
      this.updateCamera(dt);
    }

    this.world.update(dt, time / 1000);
    this.updateConfetti(dt);
    this.checkObjectives();

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
