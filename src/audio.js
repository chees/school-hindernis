// Web Audio API Sound Generator for School Hindernis
// Zero external asset dependencies, works instantly on mobile and desktop

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.alarmInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Wekker alarm
  startAlarm() {
    this.init();
    if (this.alarmInterval) return;
    
    const playBeep = () => {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(885, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);

      // Tweede piepje snel erna
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const now2 = this.ctx.currentTime;
        const o3 = this.ctx.createOscillator();
        const g3 = this.ctx.createGain();
        o3.type = 'square';
        o3.frequency.setValueAtTime(1046.5, now2); // C6
        g3.gain.setValueAtTime(0.12, now2);
        g3.gain.exponentialRampToValueAtTime(0.001, now2 + 0.14);
        o3.connect(g3);
        g3.connect(this.ctx.destination);
        o3.start(now2);
        o3.stop(now2 + 0.14);
      }, 150);
    };

    playBeep();
    this.alarmInterval = setInterval(playBeep, 800);
  }

  stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  // Voetstap geluid
  playStep(isStairs = false) {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = isStairs ? 180 : 130;
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 25, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(isStairs ? 0.08 : 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Spring geluid
  playJump() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.2);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Kleerkast openen & succes jingle
  playWardrobeOpen() {
    if (this.muted || !this.ctx) return;
    this.init();

    // Creak
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.25);
    osc.frequency.linearRampToValueAtTime(70, now + 0.5);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);

    // Blijde overwinning / succes arpeggio
    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const t = this.ctx.currentTime;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, t);

        noteGain.gain.setValueAtTime(0.12, t);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        noteOsc.connect(noteGain);
        noteGain.connect(this.ctx.destination);

        noteOsc.start(t);
        noteOsc.stop(t + 0.4);
      }, 400 + idx * 130);
    });
  }

  // Algemene klik / interactie blip
  playBlip() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const sounds = new SoundEffects();
