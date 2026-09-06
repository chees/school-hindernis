// Web Audio API Sound Generator for School Hindernis
// Zero external asset dependencies, works instantly on mobile and desktop

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.alarmInterval = null;
    this.engineGain = null;
    this.engineOscs = [];
    this.engineFilter = null;
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

  // Mechanische klik bij uitzetten wekker
  playAlarmClick() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);

    // Korte lichte naklik
    setTimeout(() => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const o2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(840, t);
      o2.frequency.exponentialRampToValueAtTime(320, t + 0.04);
      g2.gain.setValueAtTime(0.12, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      o2.connect(g2);
      g2.connect(this.ctx.destination);
      o2.start(t);
      o2.stop(t + 0.04);
    }, 45);
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

  // Vrolijk bed-stuiteren met elastische matrasveer en vrolijke "Wheee!" geluidjes
  playBedBounce() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;

    // 1. Elastische matrasveer / cartoon "Boing!" klank
    const springOsc = this.ctx.createOscillator();
    const springGain = this.ctx.createGain();
    springOsc.type = 'triangle';
    springOsc.frequency.setValueAtTime(145 + Math.random() * 25, now);
    springOsc.frequency.exponentialRampToValueAtTime(420 + Math.random() * 40, now + 0.08);
    springOsc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

    springGain.gain.setValueAtTime(0.14, now);
    springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    springOsc.connect(springGain);
    springGain.connect(this.ctx.destination);
    springOsc.start(now);
    springOsc.stop(now + 0.24);

    // 2. Vrolijk stemmetje / "Wheeeee!" formant-synthese
    const voiceOsc = this.ctx.createOscillator();
    const voiceGain = this.ctx.createGain();
    const voiceFilter = this.ctx.createBiquadFilter();

    // Bandpass formant filter simuleert het heldere menselijke "eeeee" vokaal
    voiceFilter.type = 'bandpass';
    voiceFilter.frequency.setValueAtTime(2400 + (Math.random() * 260 - 130), now);
    voiceFilter.Q.setValueAtTime(3.6, now);

    const pitchVariant = Math.random();
    let startFreq, peakFreq, duration;

    if (pitchVariant < 0.35) {
      // Hoge speelse "Wheeeeee!"
      startFreq = 390;
      peakFreq = 840;
      duration = 0.52;
    } else if (pitchVariant < 0.70) {
      // Extra enthousiaste "Wahoo-wheee!"
      startFreq = 440;
      peakFreq = 960;
      duration = 0.58;
    } else {
      // Snelle vrolijke "Yippeee!"
      startFreq = 360;
      peakFreq = 780;
      duration = 0.46;
    }

    voiceOsc.type = 'sawtooth';
    voiceOsc.frequency.setValueAtTime(startFreq, now + 0.03);
    voiceOsc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.24);
    // Speels vibrato op het hoogtepunt van de sprong
    voiceOsc.frequency.linearRampToValueAtTime(peakFreq + 30, now + 0.34);
    voiceOsc.frequency.linearRampToValueAtTime(peakFreq - 20, now + 0.42);

    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.linearRampToValueAtTime(0.15, now + 0.08);
    voiceGain.gain.setValueAtTime(0.15, now + 0.28);
    voiceGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    voiceOsc.connect(voiceFilter);
    voiceFilter.connect(voiceGain);
    voiceGain.connect(this.ctx.destination);

    voiceOsc.start(now + 0.03);
    voiceOsc.stop(now + duration + 0.02);
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

  // WC doorspoelgeluid (waterkolk + navullen)
  playToiletFlush() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(320, now + 1.2);
    filter.frequency.linearRampToValueAtTime(500, now + 2.0);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 1.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.2);

    // Korte bubbelende lage sinus eronder
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(70, now + 1.0);
    oscGain.gain.setValueAtTime(0.12, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);

    // Opluchting jingle erna
    setTimeout(() => {
      this.playRelief();
    }, 1200);
  }

  // Kraan water kletterend geluid
  playWaterTap() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const duration = 1.4;
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  }

  // Douche regengeluid
  playShower() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const duration = 2.0;
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  }

  // Blij ontspannen belletjes / opluchting
  playRelief() {
    if (this.muted || !this.ctx) return;
    this.init();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      }, idx * 110);
    });
  }

  // Opraap-geluidje voor schooltas en schoolspullen
  playPickup() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const notes = [659.25, 880, 1046.5]; // E5, A5, C6 (sprankelend opgaand arpeggio)
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.28);
      }, idx * 75);
    });
  }

  // Triomfantelijk geluidje als alle 5 schoolspullen gevonden zijn
  playItemComplete() {
    if (this.muted || !this.ctx) return;
    this.init();

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.45);
      }, idx * 95);
    });
  }

  // Voordeur openzwaaien en vertrek naar school
  playFrontDoor() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    // Deurklink klik
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(450, now);
    clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.08);

    // Deur zwaai geluid
    setTimeout(() => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.linearRampToValueAtTime(150, t + 0.35);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    }, 90);
  }

  // Luidruchtige schoolbel (TRRRRRING!) als de tijd op is
  playSchoolBell() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const duration = 2.8;

    // Twee harmonische beltonen
    const bellOsc1 = this.ctx.createOscillator();
    const bellOsc2 = this.ctx.createOscillator();
    bellOsc1.type = 'triangle';
    bellOsc2.type = 'sine';
    bellOsc1.frequency.setValueAtTime(1480, now);
    bellOsc2.frequency.setValueAtTime(1760, now);

    // Snelle tremolo / klepel modulatie (26 Hz)
    const modOsc = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    modOsc.type = 'square';
    modOsc.frequency.setValueAtTime(26, now);
    modGain.gain.setValueAtTime(0.08, now);
    modOsc.connect(modGain.gain);

    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.18, now);
    mainGain.gain.setValueAtTime(0.18, now + duration - 0.4);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    bellOsc1.connect(mainGain);
    bellOsc2.connect(mainGain);
    modGain.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    bellOsc1.start(now);
    bellOsc2.start(now);
    modOsc.start(now);
    bellOsc1.stop(now + duration);
    bellOsc2.stop(now + duration);
    modOsc.stop(now + duration);
  }

  // Autodeur die dichtslaat
  playCarDoor() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;

    // 1. Snelle klik van het deurslot
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.04);

    // 2. Doffe zware autodeur klap (rubber + metaal)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(120, now + 0.02);
    thudOsc.frequency.exponentialRampToValueAtTime(38, now + 0.22);
    thudGain.gain.setValueAtTime(0.35, now + 0.02);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    thudOsc.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thudOsc.start(now + 0.02);
    thudOsc.stop(now + 0.25);
  }

  // Autotoeter (vrolijk toet-toet!)
  playCarHorn() {
    if (this.muted || !this.ctx) return;
    this.init();

    const playHonk = (startTime, dur) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      // Dual-tone auto toeter: A4 (440Hz) + C#5 (554Hz)
      osc1.frequency.setValueAtTime(440, startTime);
      osc2.frequency.setValueAtTime(554, startTime);

      gain.gain.setValueAtTime(0.16, startTime);
      gain.gain.setValueAtTime(0.16, startTime + dur - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + dur);
      osc2.stop(startTime + dur);
    };

    const now = this.ctx.currentTime;
    playHonk(now, 0.14);
    playHonk(now + 0.18, 0.18);
  }

  // Start continu motorgeluid van de auto
  startCarEngine() {
    if (this.muted || !this.ctx) return;
    this.init();
    this.stopCarEngine();

    const now = this.ctx.currentTime;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.01, now);
    this.engineGain.gain.linearRampToValueAtTime(0.09, now + 0.3);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(260, now);

    // Twee lage oscillatoren voor het snorrende motortoerental
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(48, now);
    osc2.frequency.setValueAtTime(96, now);

    osc1.connect(this.engineFilter);
    osc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    this.engineOscs = [osc1, osc2];
  }

  // Pas motorgeluid aan op rijsnelheid (speedFactor tussen 0 en 1)
  updateCarEngine(speedFactor) {
    if (!this.engineOscs || this.engineOscs.length === 0 || !this.ctx) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1.5, speedFactor));
    const baseFreq = 48 + clamped * 65; // Van 48Hz tot ~145Hz

    if (this.engineOscs[0]) {
      this.engineOscs[0].frequency.setTargetAtTime(baseFreq, now, 0.08);
    }
    if (this.engineOscs[1]) {
      this.engineOscs[1].frequency.setTargetAtTime(baseFreq * 2, now, 0.08);
    }
    if (this.engineFilter) {
      this.engineFilter.frequency.setTargetAtTime(260 + clamped * 350, now, 0.08);
    }
  }

  // Stop motorgeluid
  stopCarEngine() {
    if (this.engineGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.engineGain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      setTimeout(() => {
        for (const osc of this.engineOscs) {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        }
        this.engineOscs = [];
        this.engineGain = null;
        this.engineFilter = null;
      }, 260);
    }
  }

  // Schoolkluisje openen (mechanische kluisdeur klik en zacht piepje)
  playLockerOpen() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;

    // Klik van het slot
    const latchOsc = this.ctx.createOscillator();
    const latchGain = this.ctx.createGain();
    latchOsc.type = 'sine';
    latchOsc.frequency.setValueAtTime(1600, now);
    latchOsc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
    latchGain.gain.setValueAtTime(0.18, now);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    latchOsc.connect(latchGain);
    latchGain.connect(this.ctx.destination);
    latchOsc.start(now);
    latchOsc.stop(now + 0.06);

    // Metaalachtige galm
    const resOsc = this.ctx.createOscillator();
    const resGain = this.ctx.createGain();
    resOsc.type = 'triangle';
    resOsc.frequency.setValueAtTime(320, now + 0.03);
    resOsc.frequency.linearRampToValueAtTime(290, now + 0.3);
    resGain.gain.setValueAtTime(0.12, now + 0.03);
    resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    resOsc.connect(resGain);
    resGain.connect(this.ctx.destination);
    resOsc.start(now + 0.03);
    resOsc.stop(now + 0.35);
  }

  // Schoolkluisje dichtslaan (metalen kluisdeur 'KLAK')
  playLockerClose() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;

    // 1. Scherpe metalen sluiting
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(950, now);
    snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    snapGain.gain.setValueAtTime(0.25, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.09);

    // 2. Diepe holle metalen kast weerklank
    const boxOsc = this.ctx.createOscillator();
    const boxGain = this.ctx.createGain();
    boxOsc.type = 'triangle';
    boxOsc.frequency.setValueAtTime(190, now + 0.02);
    boxOsc.frequency.exponentialRampToValueAtTime(75, now + 0.4);
    boxGain.gain.setValueAtTime(0.28, now + 0.02);
    boxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    boxOsc.connect(boxGain);
    boxGain.connect(this.ctx.destination);
    boxOsc.start(now + 0.02);
    boxOsc.stop(now + 0.45);
  }
}

export const sounds = new SoundEffects();
