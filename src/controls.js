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

  isUIInteractive(target) {
    if (!target) return false;
    if (target.closest('button, input, select, textarea, a, label')) return true;
    if (target.closest('.alarm-card, .victory-card, .gameover-card, .wardrobe-card')) return true;
    if (target.closest('#joystick-zone')) return true;

    const wakeup = document.getElementById('wakeup-modal');
    if (wakeup && !wakeup.classList.contains('fade-out') && wakeup.style.display !== 'none') return true;
    const wardrobe = document.getElementById('wardrobe-modal');
    if (wardrobe && wardrobe.classList.contains('active')) return true;
    const victory = document.getElementById('victory-modal');
    if (victory && victory.classList.contains('active')) return true;
    const gameover = document.getElementById('gameover-modal');
    if (gameover && gameover.classList.contains('active')) return true;

    return false;
  }

  releasePointerLock() {
    this.isMouseDown = false;
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (err) {}
    }
    if (this.capturedPointerId !== null && this.canvas && this.canvas.releasePointerCapture) {
      try {
        this.canvas.releasePointerCapture(this.capturedPointerId);
      } catch (err) {}
      this.capturedPointerId = null;
    }
  }

  initMouse() {
    this.justLocked = false;
    this.capturedPointerId = null;

    document.addEventListener('pointerlockchange', () => {
      const isLocked = document.pointerLockElement === this.canvas;
      if (isLocked) {
        this.justLocked = true;
        if (!this.isMouseDown) {
          try {
            document.exitPointerLock();
          } catch (err) {}
        }
      } else {
        this.isMouseDown = false;
      }
    });

    document.addEventListener('pointerlockerror', () => {
      this.justLocked = false;
    });

    const onPointerDown = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (e.button !== 0) return;
      if (this.isUIInteractive(e.target)) return;

      this.isMouseDown = true;
      this.lastMousePos = { x: e.clientX, y: e.clientY };

      if (e.pointerId !== undefined && this.canvas && this.canvas.setPointerCapture) {
        try {
          this.canvas.setPointerCapture(e.pointerId);
          this.capturedPointerId = e.pointerId;
        } catch (err) {}
      }

      if (this.canvas && this.canvas.requestPointerLock) {
        try {
          const promise = this.canvas.requestPointerLock({ unadjustedMovement: true });
          if (promise && promise.catch) {
            promise.catch((err) => {
              if (err && err.name === 'NotSupportedError') {
                try {
                  this.canvas.requestPointerLock();
                } catch (e2) {}
              }
            });
          }
        } catch (err) {
          try {
            this.canvas.requestPointerLock();
          } catch (e2) {}
        }
      }
    };

    const onPointerMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (!this.isMouseDown) return;

      let dx = 0;
      let dy = 0;

      if (document.pointerLockElement === this.canvas) {
        if (this.justLocked) {
          this.justLocked = false;
          return;
        }
        dx = e.movementX || 0;
        dy = e.movementY || 0;
      } else {
        if (e.movementX !== undefined && Math.abs(e.movementX) < 250) {
          dx = e.movementX;
          dy = e.movementY;
        } else {
          dx = e.clientX - this.lastMousePos.x;
          dy = e.clientY - this.lastMousePos.y;
        }
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }

      if (Math.abs(dx) > 300) dx = 0;
      if (Math.abs(dy) > 300) dy = 0;

      this.deltaYaw -= dx * 0.006;
      this.deltaPitch += dy * 0.005;
    };

    const onPointerUp = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (e.button === 0) {
        this.releasePointerLock();
      }
    };

    if (window.PointerEvent) {
      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    } else {
      window.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
    }

    window.addEventListener('blur', () => {
      this.releasePointerLock();
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
        if (this.isUIInteractive(e.target)) return;
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
      let lastJumpTime = 0;
      const triggerJump = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.jumpRequested = true;
      };

      jumpBtn.addEventListener('touchstart', (e) => {
        lastJumpTime = Date.now();
        triggerJump(e);
      }, { passive: false });

      jumpBtn.addEventListener('click', (e) => {
        if (Date.now() - lastJumpTime < 400) return;
        triggerJump(e);
      });
    }

    const actionBtn = document.getElementById('btn-action');
    if (actionBtn) {
      let lastActionTime = 0;
      const triggerAction = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (actionBtn.disabled) return;
        this.interactRequested = true;
      };

      actionBtn.addEventListener('touchstart', (e) => {
        lastActionTime = Date.now();
        triggerAction(e);
      }, { passive: false });

      actionBtn.addEventListener('click', (e) => {
        if (Date.now() - lastActionTime < 400) return;
        triggerAction(e);
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
