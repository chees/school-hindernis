import * as THREE from 'three';

export class InputControls {
  constructor(canvas) {
    this.canvas = canvas;

    // Toetsenbord status
    this.keys = {};
    
    // Joystick status (Mobiel)
    this.joystickVector = new THREE.Vector2(0, 0);
    this.isJoystickActive = false;
    this.joystickTouchId = null;
    this.joystickCenter = { x: 0, y: 0 };

    // Camera rotatie status
    this.cameraTouchId = null;
    this.lastTouchPos = { x: 0, y: 0 };
    this.deltaYaw = 0;
    this.deltaPitch = 0;
    this.isMouseDown = false;
    this.lastMousePos = { x: 0, y: 0 };

    // Actie triggers
    this.jumpRequested = false;
    this.interactRequested = false;

    // Detecteer of het een touchscreen betreft
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (this.isTouchDevice) {
      document.body.classList.add('has-touch');
    }
    window.addEventListener('touchstart', () => {
      document.body.classList.add('has-touch');
    }, { once: true, passive: true });

    this.initKeyboard();
    this.initMouse();
    this.initTouch();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        this.jumpRequested = true;
        e.preventDefault();
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        this.interactRequested = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  initMouse() {
    window.addEventListener('mousedown', (e) => {
      // Negeer clicks op interactieve knoppen of modals
      if (e.target.closest('button') || e.target.closest('.alarm-card') || e.target.closest('.victory-card')) {
        return;
      }
      if (e.button === 0) { // Linkermuisknop
        this.isMouseDown = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.deltaYaw -= dx * 0.006;
        this.deltaPitch += dy * 0.005;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });
  }

  initTouch() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');

    if (!joystickZone || !joystickBase || !joystickThumb) return;

    const maxRadius = 45; // max uitslag in pixels

    // Touch start op joystick
    joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      this.isJoystickActive = true;

      const rect = joystickBase.getBoundingClientRect();
      this.joystickCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      this.updateJoystick(touch.clientX, touch.clientY, maxRadius, joystickThumb);
    }, { passive: false });

    // Touch move
    window.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        
        // Joystick verplaatsing
        if (touch.identifier === this.joystickTouchId) {
          this.updateJoystick(touch.clientX, touch.clientY, maxRadius, joystickThumb);
        }

        // Camera vegen op rechter schermhelft
        if (touch.identifier === this.cameraTouchId) {
          const dx = touch.clientX - this.lastTouchPos.x;
          const dy = touch.clientY - this.lastTouchPos.y;
          this.deltaYaw -= dx * 0.008;
          this.deltaPitch += dy * 0.006;
          this.lastTouchPos = { x: touch.clientX, y: touch.clientY };
        }
      }
    }, { passive: false });

    // Touch end / cancel
    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.isJoystickActive = false;
          this.joystickTouchId = null;
          this.joystickVector.set(0, 0);
          joystickThumb.style.transform = 'translate(0px, 0px)';
        }
        if (touch.identifier === this.cameraTouchId) {
          this.cameraTouchId = null;
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    // Camera veeg touchzone (rechter schermhelft)
    const cameraZone = document.getElementById('camera-touch-zone');
    if (cameraZone) {
      cameraZone.addEventListener('touchstart', (e) => {
        const touch = e.changedTouches[0];
        if (this.cameraTouchId === null) {
          this.cameraTouchId = touch.identifier;
          this.lastTouchPos = { x: touch.clientX, y: touch.clientY };
        }
      });
    }

    // Touch & Click actieknoppen (werkt voor zowel muis als aanraking)
    const jumpBtn = document.getElementById('btn-jump');
    if (jumpBtn) {
      jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.jumpRequested = true;
      }, { passive: false });
      jumpBtn.addEventListener('click', (e) => {
        this.jumpRequested = true;
      });
    }

    const actionBtn = document.getElementById('btn-action');
    if (actionBtn) {
      actionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.interactRequested = true;
      }, { passive: false });
      actionBtn.addEventListener('click', (e) => {
        this.interactRequested = true;
      });
    }
  }

  updateJoystick(touchX, touchY, maxRadius, thumbElement) {
    let dx = touchX - this.joystickCenter.x;
    let dy = touchY - this.joystickCenter.y;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    thumbElement.style.transform = `translate(${dx}px, ${dy}px)`;

    // Genormaliseerde vector (-1 tot 1)
    // dy invert: omhoog swipen is vooruit (+Y in movement logic)
    this.joystickVector.set(dx / maxRadius, -dy / maxRadius);
  }

  getMoveVector() {
    const move = new THREE.Vector2(0, 0);

    // Toetsenbord input (WASD / Pijltjes)
    if (this.keys['KeyW'] || this.keys['ArrowUp']) move.y += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) move.y -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) move.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) move.x += 1;

    // Mobiele joystick input toevoegen
    if (this.isJoystickActive && this.joystickVector.lengthSq() > 0.05) {
      move.x += this.joystickVector.x;
      move.y += this.joystickVector.y;
    }

    // Normaliseren indien toetsenbord diagonaal
    if (move.length() > 1) {
      move.normalize();
    }

    return move;
  }

  consumeCameraDeltas() {
    const deltas = { yaw: this.deltaYaw, pitch: this.deltaPitch };
    this.deltaYaw = 0;
    this.deltaPitch = 0;
    return deltas;
  }

  consumeJump() {
    const jump = this.jumpRequested;
    this.jumpRequested = false;
    return jump;
  }

  consumeInteract() {
    const interact = this.interactRequested;
    this.interactRequested = false;
    return interact;
  }
}
