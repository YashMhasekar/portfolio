// ============================================
// PROJECT PLANETS — Interactive 3D Planet Cards
// Each planet = one real project with cinematic burst reveal
// Mobile-optimised: touch tap, adaptive quality, canvas resize
// ============================================

import * as THREE from 'three';

// ============================================
// 1. PROJECT DATA
// ============================================

const PROJECT_PLANETS = [
  {
    id: 'mercury',
    planetName: 'Mercury',
    projectName: 'FootprintX',
    fullTitle: 'Digital Footprint & Privacy Risk Analyzer',
    achievement: null,
    description:
      'Engineered an AI-powered privacy management platform for digital footprint assessment and personalized privacy risk recommendations.',
    stack: ['React.js', 'Node.js', 'MongoDB', 'Python'],
    githubUrl: 'https://github.com/YashMhasekar/FootPrintX',
    liveUrl: 'https://footprintx-privacy.netlify.app/',
    glyphClass: 'glyph-mercury',
    accentColor: new THREE.Color(0x9a9080),
    burstColor: '#b0a898',
    atmosphereColor: 0x888070,
    atmosphereOpacity: 0.18,
    ringColor: 0x807060,
  },
  {
    id: 'venus',
    planetName: 'Venus',
    projectName: 'VisioTrack',
    fullTitle: 'AI Audio Navigation System',
    achievement: 'Zonal Finalist — IIT Bombay Eureka! 2025',
    description:
      'Built an AI-powered assistive navigation system with real-time object detection, OCR, and audio guidance for visually impaired users.',
    stack: ['React.js', 'Python', 'YOLO', 'OpenCV', 'Firebase'],
    githubUrl: 'https://github.com/YashMhasekar/VisioTrack',
    liveUrl: 'https://visiotrack-ai.netlify.app/',
    glyphClass: 'glyph-venus',
    accentColor: new THREE.Color(0xe8c870),
    burstColor: '#f0d080',
    atmosphereColor: 0xe8c870,
    atmosphereOpacity: 0.55,
    ringColor: 0xd4a840,
  },
  {
    id: 'earth',
    planetName: 'Earth',
    projectName: 'Momentum',
    fullTitle: 'AI Productivity Platform',
    achievement: '1st Place — HACKHIVE-2K26 National Hackathon',
    description:
      'Built an AI-powered productivity platform with smart task management, analytics, and real-time progress tracking.',
    stack: ['React.js', 'Node.js', 'Python', 'Firebase'],
    githubUrl: 'https://github.com/YashMhasekar/Momentum',
    liveUrl: 'https://momentum01.netlify.app',
    glyphClass: 'glyph-earth',
    accentColor: new THREE.Color(0x4499ff),
    burstColor: '#50aaff',
    atmosphereColor: 0x4499ff,
    atmosphereOpacity: 0.52,
    ringColor: 0x2266cc,
  },
  {
    id: 'mars',
    planetName: 'Mars',
    projectName: 'Feedback NLP Engine',
    fullTitle: 'Feedback NLP Engine',
    achievement: 'Runner-Up — Technovation 1.0 Hackathon',
    description:
      'Built a full-stack AI platform for automated student feedback analysis using sentiment classification and AI-generated insights.',
    stack: ['React.js', 'Flask', 'Python', 'Hugging Face', 'Gemini API'],
    githubUrl: 'https://github.com/YashMhasekar/feedback-nlp-engine',
    liveUrl: 'https://feedback-nlp-engine-frontend.onrender.com/',
    glyphClass: 'glyph-mars',
    accentColor: new THREE.Color(0xd04820),
    burstColor: '#e05030',
    atmosphereColor: 0xd04820,
    atmosphereOpacity: 0.22,
    ringColor: 0x8a2810,
  },
];

// ============================================
// 2. DEVICE / QUALITY DETECTION
// ============================================

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const IS_TOUCH  = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function detectQuality() {
  const cores   = navigator.hardwareConcurrency || 2;
  const isMob   = IS_MOBILE;
  if (isMob || cores <= 2) return 'low';
  if (cores <= 4)          return 'medium';
  return 'high';
}

const QUALITY    = detectQuality();
const PLANET_SEGS = QUALITY === 'low' ? 24 : QUALITY === 'medium' ? 36 : 52;

// Per-device DPR cap: mobile ≤ 1.5, desktop ≤ 2
function getDeviceDPR() {
  return IS_MOBILE
    ? Math.min(window.devicePixelRatio, 1.5)
    : Math.min(window.devicePixelRatio, 2);
}

// ============================================
// 3. CANVAS TEXTURE HELPERS
// ============================================

function makeCanvasTex(size, drawFn) {
  const c   = document.createElement('canvas');
  c.width   = c.height = size;
  const ctx = c.getContext('2d');
  drawFn(ctx, size);
  const tex       = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ---- Mercury ----
function buildMercuryTex() {
  return makeCanvasTex(256, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, '#8a8480'); g.addColorStop(0.4, '#6e6a66');
    g.addColorStop(0.7, '#949088'); g.addColorStop(1, '#807c78');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i++) {
      const x = Math.random()*s, y = Math.random()*s, r = 1.5+Math.random()*12;
      const rg = ctx.createRadialGradient(x-r*0.2, y-r*0.2, 0, x, y, r);
      rg.addColorStop(0, `rgba(55,52,48,${0.5+Math.random()*0.35})`);
      rg.addColorStop(0.7, `rgba(45,42,38,${0.3+Math.random()*0.2})`);
      rg.addColorStop(1, `rgba(130,124,118,0.15)`);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = rg; ctx.fill();
    }
  });
}

// ---- Venus ----
function buildVenusTex() {
  return makeCanvasTex(256, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0,'#f0d880'); g.addColorStop(0.25,'#d8b848');
    g.addColorStop(0.5,'#ecc860'); g.addColorStop(0.75,'#c8a030'); g.addColorStop(1,'#e4cc70');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 20; i++) {
      const y = (i/20)*s, h = 4+Math.random()*14, alpha = 0.06+Math.random()*0.16;
      ctx.beginPath();
      for (let x = 0; x <= s; x += 18) {
        const ny = y + Math.sin(x*0.038+i*1.3)*5;
        x === 0 ? ctx.moveTo(x,ny) : ctx.lineTo(x,ny);
      }
      ctx.lineTo(s,y+h); ctx.lineTo(0,y+h); ctx.closePath();
      ctx.fillStyle = i%3===0 ? `rgba(255,210,100,${alpha})` : `rgba(170,110,30,${alpha})`;
      ctx.fill();
    }
  });
}

// ---- Earth ----
function buildEarthTex() {
  return makeCanvasTex(512, (ctx, s) => {
    ctx.fillStyle = '#1565a0'; ctx.fillRect(0,0,s,s);
    // North America
    ctx.beginPath();
    ctx.moveTo(s*0.10,s*0.20); ctx.bezierCurveTo(s*0.22,s*0.17,s*0.29,s*0.22,s*0.27,s*0.32);
    ctx.bezierCurveTo(s*0.26,s*0.41,s*0.20,s*0.46,s*0.18,s*0.51);
    ctx.bezierCurveTo(s*0.13,s*0.49,s*0.07,s*0.43,s*0.07,s*0.32); ctx.closePath();
    ctx.fillStyle='#338844'; ctx.fill();
    // South America
    ctx.beginPath();
    ctx.moveTo(s*0.20,s*0.56); ctx.bezierCurveTo(s*0.27,s*0.53,s*0.31,s*0.61,s*0.28,s*0.69);
    ctx.bezierCurveTo(s*0.25,s*0.79,s*0.18,s*0.81,s*0.13,s*0.73);
    ctx.bezierCurveTo(s*0.11,s*0.63,s*0.14,s*0.57,s*0.20,s*0.56); ctx.closePath();
    ctx.fillStyle='#3a9040'; ctx.fill();
    // Europe
    ctx.beginPath();
    ctx.moveTo(s*0.46,s*0.22); ctx.bezierCurveTo(s*0.53,s*0.20,s*0.57,s*0.24,s*0.55,s*0.31);
    ctx.bezierCurveTo(s*0.52,s*0.37,s*0.46,s*0.37,s*0.43,s*0.30); ctx.closePath();
    ctx.fillStyle='#4a9430'; ctx.fill();
    // Africa
    ctx.beginPath();
    ctx.moveTo(s*0.46,s*0.35); ctx.bezierCurveTo(s*0.57,s*0.32,s*0.61,s*0.41,s*0.59,s*0.53);
    ctx.bezierCurveTo(s*0.57,s*0.65,s*0.50,s*0.71,s*0.47,s*0.66);
    ctx.bezierCurveTo(s*0.42,s*0.57,s*0.42,s*0.45,s*0.46,s*0.35); ctx.closePath();
    ctx.fillStyle='#5aa030'; ctx.fill();
    // Asia
    ctx.beginPath();
    ctx.moveTo(s*0.55,s*0.20); ctx.bezierCurveTo(s*0.73,s*0.17,s*0.84,s*0.22,s*0.85,s*0.31);
    ctx.bezierCurveTo(s*0.87,s*0.41,s*0.81,s*0.49,s*0.72,s*0.51);
    ctx.bezierCurveTo(s*0.64,s*0.53,s*0.55,s*0.49,s*0.54,s*0.38);
    ctx.bezierCurveTo(s*0.52,s*0.30,s*0.53,s*0.24,s*0.55,s*0.20); ctx.closePath();
    ctx.fillStyle='#3d8c34'; ctx.fill();
    // Australia
    ctx.beginPath(); ctx.ellipse(s*0.76,s*0.63,s*0.065,s*0.055,0.2,0,Math.PI*2);
    ctx.fillStyle='#8a9a30'; ctx.fill();
    // Polar caps
    const np = ctx.createRadialGradient(s/2,0,0,s/2,0,s*0.18);
    np.addColorStop(0,'rgba(218,232,255,0.92)'); np.addColorStop(1,'rgba(180,210,255,0)');
    ctx.fillStyle=np; ctx.fillRect(0,0,s,s*0.18);
    const sp = ctx.createRadialGradient(s/2,s,0,s/2,s,s*0.14);
    sp.addColorStop(0,'rgba(218,232,255,0.88)'); sp.addColorStop(1,'rgba(180,210,255,0)');
    ctx.fillStyle=sp; ctx.fillRect(0,s*0.86,s,s*0.14);
    // Clouds
    for (let i=0;i<65;i++){
      const cx=Math.random()*s,cy=Math.random()*s,cr=7+Math.random()*28;
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cr);
      cg.addColorStop(0,`rgba(255,255,255,${0.16+Math.random()*0.20})`);
      cg.addColorStop(0.5,`rgba(255,255,255,${0.05+Math.random()*0.08})`);
      cg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(cx,cy,cr,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill();
    }
  });
}

// ---- Mars ----
function buildMarsTex() {
  return makeCanvasTex(256, (ctx, s) => {
    const g = ctx.createLinearGradient(0,0,s,s);
    g.addColorStop(0,'#c1430e'); g.addColorStop(0.3,'#a83208');
    g.addColorStop(0.6,'#d4521a'); g.addColorStop(1,'#b83c0e');
    ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
    for (let i=0;i<130;i++){
      const x=Math.random()*s,y=Math.random()*s,r=2+Math.random()*16;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=Math.random()>0.55
        ?`rgba(${55+Math.random()*35},${15+Math.random()*15},${4+Math.random()*8},0.36)`
        :`rgba(${195+Math.random()*35},${78+Math.random()*30},${18+Math.random()*14},0.18)`;
      ctx.fill();
    }
    const npc=ctx.createRadialGradient(s/2,4,0,s/2,4,s*0.13);
    npc.addColorStop(0,'rgba(238,228,208,0.82)'); npc.addColorStop(1,'rgba(210,198,180,0)');
    ctx.fillStyle=npc; ctx.fillRect(0,0,s,s*0.13);
  });
}

// ============================================
// 4. ATMOSPHERE SHADER
// ============================================

function createAtmosphere(radius, color, opacity) {
  const geo = new THREE.SphereGeometry(radius, 28, 28);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      atmosphereColor: { value: new THREE.Color(color) },
      baseOpacity:     { value: opacity },
      hoverBoost:      { value: 0.0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3  atmosphereColor;
      uniform float baseOpacity;
      uniform float hoverBoost;
      varying vec3  vNormal;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
        float alpha   = fresnel * (baseOpacity + hoverBoost * 0.35);
        gl_FragColor  = vec4(atmosphereColor, alpha);
      }
    `,
    side:       THREE.BackSide,
    blending:   THREE.AdditiveBlending,
    transparent: true,
    depthWrite:  false,
  });
  return new THREE.Mesh(geo, mat);
}

// ============================================
// 5. PER-PLANET THREE.JS SCENE
// ============================================

class PlanetScene {
  constructor(data, canvasEl, quality) {
    this.data              = data;
    this.canvas            = canvasEl;
    this.quality           = quality;
    this.isHovered         = false;
    this.hoverProgress     = 0;
    this.isBursting        = false;
    this.isReconstructing  = false;
    this.animFrameId       = null;
    this.active            = false;
    this.emissiveIntensity = 0.04;
    this._build();
    this._startLoop();
  }

  _build() {
    const dpr = getDeviceDPR();
    const w   = this.canvas.offsetWidth  || 280;
    const h   = this.canvas.offsetHeight || 280;

    this.renderer = new THREE.WebGLRenderer({
      canvas:          this.canvas,
      antialias:       this.quality !== 'low',
      alpha:           true,
      powerPreference: this.quality === 'low' ? 'low-power' : 'high-performance',
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 3.2);
    this.camera.lookAt(0, 0, 0);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x111122, 0.55));
    const keyLight = new THREE.PointLight(0xfff5e8, 2.8, 30);
    keyLight.position.set(-2.5, 2.2, 4);
    this.scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x1a2040, 1.2, 20);
    fillLight.position.set(2.5, -1.5, -3);
    this.scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x203060, 0.5);
    rimLight.position.set(0, 3, -5);
    this.scene.add(rimLight);

    // Planet texture
    const texBuilder = { mercury: buildMercuryTex, venus: buildVenusTex, earth: buildEarthTex, mars: buildMarsTex }[this.data.id];
    const tex        = texBuilder();
    const roughness  = { mercury: 0.96, venus: 0.72, earth: 0.58, mars: 0.93 }[this.data.id];

    this.planetMat = new THREE.MeshStandardMaterial({
      map:              tex,
      roughness,
      metalness:        this.data.id === 'earth' ? 0.06 : 0.02,
      emissive:         this.data.accentColor.clone(),
      emissiveIntensity: this.emissiveIntensity,
    });

    this.planetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, PLANET_SEGS, PLANET_SEGS),
      this.planetMat
    );
    this.scene.add(this.planetMesh);

    // Atmosphere (skip on low quality)
    if (this.data.atmosphereOpacity > 0 && this.quality !== 'low') {
      this.atmosphere = createAtmosphere(1.10, this.data.atmosphereColor, this.data.atmosphereOpacity);
      this.scene.add(this.atmosphere);
    }

    const tilts  = { mercury: 0, venus: 0.05, earth: 0.41, mars: 0.44 };
    this.planetMesh.rotation.z = tilts[this.data.id] || 0;

    const speeds  = { mercury: 0.008, venus: 0.004, earth: 0.018, mars: 0.016 };
    // Slow rotation on mobile to save GPU
    this.rotSpeed = speeds[this.data.id] * (IS_MOBILE ? 0.7 : 1.0);

    this.clock = new THREE.Clock();
  }

  // Called when wrapper element resizes (ResizeObserver or window resize)
  resize() {
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    if (w < 1 || h < 1) return;
    const dpr = getDeviceDPR();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(dpr);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setHover(val) { this.isHovered = val; }

  _updateHover(delta) {
    const target      = this.isHovered ? 1 : 0;
    this.hoverProgress += (target - this.hoverProgress) * Math.min(delta * 6, 1);
    const baseEmit    = 0.04, hoverEmit = 0.22;
    this.emissiveIntensity             = baseEmit + (hoverEmit - baseEmit) * this.hoverProgress;
    this.planetMat.emissiveIntensity   = this.emissiveIntensity;
    if (this.atmosphere) {
      this.atmosphere.material.uniforms.hoverBoost.value = this.hoverProgress;
    }
  }

  _startLoop() {
    this.active = true;
    const loop  = () => {
      if (!this.active) return;
      this.animFrameId = requestAnimationFrame(loop);
      const delta      = this.clock.getDelta();
      if (!this.isBursting && !this.isReconstructing) {
        this.planetMesh.rotation.y += this.rotSpeed;
      }
      this._updateHover(delta);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  dispose() {
    this.active = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
  }
}

// ============================================
// 6. BURST ANIMATOR
// ============================================

class BurstAnimator {
  constructor() {
    this.canvas    = null;
    this.ctx       = null;
    this.animId    = null;
    this.particles = [];
    this.ring      = { radius: 0, maxRadius: 0, opacity: 0 };
    this.startTime = 0;
    // Shorter burst duration on mobile for snappier feel
    this.duration  = IS_MOBILE ? 700 : 900;
    this.onComplete = null;
    this.originX   = 0;
    this.originY   = 0;
    this.color     = '#ffffff';
    this._ensureCanvas();
  }

  _ensureCanvas() {
    let c = document.getElementById('burst-overlay-canvas');
    if (!c) {
      c           = document.createElement('canvas');
      c.id        = 'burst-overlay-canvas';
      c.className = 'planet-burst-canvas';
      c.setAttribute('aria-hidden', 'true');
      document.body.appendChild(c);
    }
    this.canvas = c;
    this.ctx    = c.getContext('2d');
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(originX, originY, color, onComplete) {
    this._resize();
    this.originX    = originX;
    this.originY    = originY;
    this.color      = color;
    this.onComplete = onComplete;
    this.startTime  = performance.now();
    this.canvas.style.display = 'block';
    this.canvas.style.opacity = '1';

    // Fewer particles on mobile
    const count = QUALITY === 'low'
      ? (IS_MOBILE ? 18 : 28)
      : QUALITY === 'medium'
        ? (IS_MOBILE ? 32 : 48)
        : (IS_MOBILE ? 44 : 68);

    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (i/count)*Math.PI*2 + Math.random()*0.4;
      // Smaller radius on mobile so particles stay within viewport
      const speedScale = IS_MOBILE ? 0.7 : 1.0;
      const speed = (80 + Math.random()*220) * speedScale;
      const size  = 2 + Math.random()*5;
      const life  = 0.55 + Math.random()*0.45;
      this.particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        size, life, maxLife: life,
        alpha: 0.7+Math.random()*0.3,
        colorShift: Math.random() > 0.7,
      });
    }

    const wrapperRadius = Math.min(window.innerWidth, window.innerHeight) * (IS_MOBILE ? 0.22 : 0.16);
    this.ring = { radius: wrapperRadius*0.5, maxRadius: wrapperRadius*2.2, opacity: 0.7 };

    if (this.animId) cancelAnimationFrame(this.animId);
    this._frame();
  }

  _frame() {
    const now     = performance.now();
    const elapsed = now - this.startTime;
    const t       = Math.min(elapsed / this.duration, 1);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Expanding ring
    const ringT = Math.min(t*1.6, 1);
    const ringR = this.ring.radius + (this.ring.maxRadius - this.ring.radius)*easeOutCubic(ringT);
    const ringA = this.ring.opacity * (1 - easeInCubic(t));
    if (ringA > 0.005) {
      this.ctx.save();
      this.ctx.strokeStyle = this.color;
      this.ctx.globalAlpha = ringA;
      this.ctx.lineWidth   = 2.5;
      this.ctx.shadowBlur  = 24;
      this.ctx.shadowColor = this.color;
      this.ctx.beginPath();
      this.ctx.arc(this.originX, this.originY, ringR, 0, Math.PI*2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Second ring
    if (t > 0.12) {
      const t2 = Math.min((t-0.12)*1.4, 1);
      const r2 = this.ring.radius*0.8 + this.ring.maxRadius*1.4*easeOutCubic(t2);
      const a2 = 0.35*(1-easeInCubic(t2));
      if (a2 > 0.005) {
        this.ctx.save();
        this.ctx.strokeStyle = this.color;
        this.ctx.globalAlpha = a2;
        this.ctx.lineWidth   = 1.2;
        this.ctx.shadowBlur  = 16;
        this.ctx.shadowColor = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.originX, this.originY, r2, 0, Math.PI*2);
        this.ctx.stroke();
        this.ctx.restore();
      }
    }

    // Central flare
    const flareT     = Math.min(t*3, 1);
    const flareAlpha = flareT < 0.5
      ? easeOutCubic(flareT*2)*0.55
      : (1-easeInCubic((flareT-0.5)*2))*0.55;
    if (flareAlpha > 0.005) {
      const flareR = 30 + 80*easeOutCubic(Math.min(t*2, 1));
      const fg     = this.ctx.createRadialGradient(this.originX,this.originY,0,this.originX,this.originY,flareR);
      fg.addColorStop(0, `${this.color}ff`);
      fg.addColorStop(0.3, `${this.color}88`);
      fg.addColorStop(1, `${this.color}00`);
      this.ctx.save();
      this.ctx.globalAlpha = flareAlpha;
      this.ctx.fillStyle   = fg;
      this.ctx.beginPath();
      this.ctx.arc(this.originX, this.originY, flareR, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Particles
    const dt = 0.016;
    this.particles.forEach(p => {
      if (p.life <= 0) return;
      p.x  += p.vx*dt; p.y  += p.vy*dt;
      p.vx *= 0.96;    p.vy *= 0.96;
      p.life -= dt*1.4;
      const lifeRatio = Math.max(p.life/p.maxLife, 0);
      const alpha     = p.alpha * lifeRatio * lifeRatio;
      if (alpha < 0.01) return;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle   = p.colorShift ? '#ffffff' : this.color;
      this.ctx.shadowBlur  = 8;
      this.ctx.shadowColor = this.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size*lifeRatio, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.restore();
    });

    if (t < 1) {
      this.animId = requestAnimationFrame(() => this._frame());
    } else {
      this.canvas.style.transition = 'opacity 0.3s ease';
      this.canvas.style.opacity    = '0';
      setTimeout(() => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.display    = 'none';
        this.canvas.style.transition = '';
        if (this.onComplete) this.onComplete();
      }, 320);
    }
  }

  // Reverse: particles converge back to centre
  reverse(originX, originY, color, onComplete) {
    this._resize();
    this.originX    = originX;
    this.originY    = originY;
    this.color      = color;
    this.onComplete = onComplete;
    this.startTime  = performance.now();
    this.duration   = IS_MOBILE ? 500 : 650;
    this.canvas.style.display = 'block';
    this.canvas.style.opacity = '1';

    const count = QUALITY === 'low'
      ? (IS_MOBILE ? 14 : 20)
      : QUALITY === 'medium'
        ? (IS_MOBILE ? 24 : 36)
        : (IS_MOBILE ? 34 : 50);

    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle     = (i/count)*Math.PI*2 + Math.random()*0.3;
      const startDist = (IS_MOBILE ? 40 : 60) + Math.random()*(IS_MOBILE ? 100 : 160);
      const sx        = originX + Math.cos(angle)*startDist;
      const sy        = originY + Math.sin(angle)*startDist;
      this.particles.push({
        sx, sy, x: sx, y: sy,
        tx: originX, ty: originY,
        size:       1.5+Math.random()*3.5,
        alpha:      0.4+Math.random()*0.4,
        delay:      Math.random()*0.25,
        colorShift: Math.random() > 0.65,
      });
    }
    if (this.animId) cancelAnimationFrame(this.animId);
    this._reverseFrame();
  }

  _reverseFrame() {
    const now = performance.now();
    const t   = Math.min((now - this.startTime) / this.duration, 1);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Converging ring
    const maxR  = Math.min(window.innerWidth, window.innerHeight) * (IS_MOBILE ? 0.18 : 0.22);
    const ringR = maxR * (1 - easeInCubic(t));
    const ringA = 0.45 * (1-t);
    if (ringA > 0.005 && ringR > 2) {
      this.ctx.save();
      this.ctx.strokeStyle = this.color;
      this.ctx.globalAlpha = ringA;
      this.ctx.lineWidth   = 1.5;
      this.ctx.shadowBlur  = 18;
      this.ctx.shadowColor = this.color;
      this.ctx.beginPath();
      this.ctx.arc(this.originX, this.originY, ringR, 0, Math.PI*2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    this.particles.forEach(p => {
      const pt = Math.max((t-p.delay)/(1-p.delay), 0);
      if (pt <= 0) return;
      const et  = easeInCubic(Math.min(pt, 1));
      p.x       = p.sx + (p.tx-p.sx)*et;
      p.y       = p.sy + (p.ty-p.sy)*et;
      const alpha = p.alpha*(1-et*0.7);
      if (alpha < 0.01) return;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle   = p.colorShift ? '#ffffff' : this.color;
      this.ctx.shadowBlur  = 6;
      this.ctx.shadowColor = this.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size*(1-et*0.5), 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Implosion flash
    if (t > 0.75) {
      const ft = (t-0.75)/0.25;
      const fa = easeOutCubic(ft)*0.4*(1-ft);
      if (fa > 0.005) {
        const fr = 20+60*easeOutCubic(ft);
        const fg = this.ctx.createRadialGradient(this.originX,this.originY,0,this.originX,this.originY,fr);
        fg.addColorStop(0, `${this.color}ff`); fg.addColorStop(1, `${this.color}00`);
        this.ctx.save();
        this.ctx.globalAlpha = fa;
        this.ctx.fillStyle   = fg;
        this.ctx.beginPath();
        this.ctx.arc(this.originX, this.originY, fr, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    if (t < 1) {
      this.animId = requestAnimationFrame(() => this._reverseFrame());
    } else {
      this.canvas.style.transition = 'opacity 0.25s ease';
      this.canvas.style.opacity    = '0';
      setTimeout(() => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.display    = 'none';
        this.canvas.style.transition = '';
        if (this.onComplete) this.onComplete();
      }, 260);
    }
  }
}

function easeOutCubic(t) { return 1 - Math.pow(1-t, 3); }
function easeInCubic(t)  { return t*t*t; }

// ============================================
// 7. MODAL
// ============================================

function openModal(data, reducedMotion) {
  const modal  = document.getElementById('project-modal');
  const glyph  = document.getElementById('modal-planet-glyph');
  const title  = document.getElementById('modal-title');
  const achEl  = document.getElementById('modal-achievement');
  const desc   = document.getElementById('modal-description');
  const stack  = document.getElementById('modal-stack');
  const github = document.getElementById('modal-github');
  const live   = document.getElementById('modal-live');

  glyph.className = `modal-planet-glyph ${data.glyphClass}`;

  title.innerHTML = `${data.projectName}<span style="font-size:0.72em;font-weight:400;color:rgba(255,255,255,0.45);display:block;margin-top:0.1rem;">${data.fullTitle}</span>`;

  if (data.achievement) {
    achEl.textContent  = '🏆 ' + data.achievement;
    achEl.style.display = 'block';
  } else {
    achEl.style.display = 'none';
  }

  desc.textContent = data.description;

  stack.innerHTML = data.stack
    .map(s => `<span class="stack-badge">${s}</span>`)
    .join('');

  github.href = data.githubUrl;
  live.href   = data.liveUrl;

  modal.setAttribute('aria-hidden', 'false');

  if (reducedMotion) {
    modal.style.transition = 'none';
    const mc = modal.querySelector('.modal-content');
    if (mc) mc.style.transition = 'none';
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { modal.classList.add('visible'); });
  });
}

function closeModal(reducedMotion, onClosed) {
  const modal = document.getElementById('project-modal');
  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
  const dur = reducedMotion ? 10 : 480;
  setTimeout(() => { if (onClosed) onClosed(); }, dur);
}

// ============================================
// 8. GET CENTRE OF DOM ELEMENT
// ============================================

function getElementCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}

// ============================================
// 9. TOUCH-TAP DETECTION
//    Distinguishes a deliberate tap from a scroll gesture.
//    Prevents modal opening when the user is just scrolling
//    through the planets section.
// ============================================

function makeTapDetector(onTap) {
  let startX = 0, startY = 0, startTime = 0;
  // Maximum movement (px) and duration (ms) allowed for a tap
  const MAX_MOVE = 12;
  const MAX_TIME = 400;

  return {
    onTouchStart(e) {
      startX    = e.touches[0].clientX;
      startY    = e.touches[0].clientY;
      startTime = Date.now();
    },
    onTouchEnd(e) {
      const dx      = Math.abs(e.changedTouches[0].clientX - startX);
      const dy      = Math.abs(e.changedTouches[0].clientY - startY);
      const elapsed = Date.now() - startTime;
      if (dx < MAX_MOVE && dy < MAX_MOVE && elapsed < MAX_TIME) {
        // Deliberate tap — prevent the synthetic click that follows
        e.preventDefault();
        onTap();
      }
    },
  };
}

// ============================================
// 10. MAIN CONTROLLER
// ============================================

const ProjectPlanets = (() => {
  let planetScenes    = [];   // desktop canvas PlanetScenes
  let mobilePlanetScenes = []; // mobile canvas PlanetScenes
  let burst           = null;
  let activeData      = null;
  let isOpen          = false;
  let reducedMotion   = false;
  let resizeOb        = null;
  let mobileMode      = false;

  function init() {
    reducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.body.classList.contains('reduced-motion');

    burst = new BurstAnimator();

    // ---- Desktop planets (inside fixed overlay) ----
    PROJECT_PLANETS.forEach(data => {
      const canvasEl = document.getElementById(`pc-${data.id}`);
      if (!canvasEl) return;
      const ps = new PlanetScene(data, canvasEl, QUALITY);
      planetScenes.push(ps);

      const wrapper = document.getElementById(`pw-${data.id}`);
      if (!wrapper) return;

      _wireWrapper(wrapper, ps, data);
    });

    // ---- Mobile planets (inside scrollable page) ----
    PROJECT_PLANETS.forEach(data => {
      const canvasEl = document.getElementById(`mp-pc-${data.id}`);
      if (!canvasEl) return;
      const ps = new PlanetScene(data, canvasEl, QUALITY);
      mobilePlanetScenes.push(ps);

      const wrapper = document.getElementById(`mp-pw-${data.id}`);
      if (!wrapper) return;

      _wireWrapper(wrapper, ps, data);
    });

    // Modal close
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', handleClose);

    const backdrop = document.getElementById('project-modal');
    if (backdrop) backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) handleClose();
    });

    // ---- ResizeObserver — all canvases ----
    if (window.ResizeObserver) {
      resizeOb = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const canvas = entry.target;
          const all    = [...planetScenes, ...mobilePlanetScenes];
          const ps     = all.find(p => p.canvas === canvas);
          if (ps) ps.resize();
        });
      });
      [...planetScenes, ...mobilePlanetScenes].forEach(ps => resizeOb.observe(ps.canvas));
    } else {
      const onResize = () => [...planetScenes, ...mobilePlanetScenes].forEach(ps => ps.resize());
      window.addEventListener('resize',            onResize);
      window.addEventListener('orientationchange', () => setTimeout(onResize, 250));
    }
  }

  // Wire pointer + touch + keyboard events onto a wrapper
  function _wireWrapper(wrapper, ps, data) {
    // ---- Desktop: hover + click ----
    wrapper.addEventListener('mouseenter', () => ps.setHover(true));
    wrapper.addEventListener('mouseleave', () => ps.setHover(false));
    wrapper.addEventListener('focusin',    () => ps.setHover(true));
    wrapper.addEventListener('focusout',   () => ps.setHover(false));
    wrapper.addEventListener('click', () => {
      if (IS_TOUCH) return;
      handlePlanetClick(data, wrapper, ps);
    });

    // ---- Touch: tap detection ----
    if (IS_TOUCH) {
      const tap = makeTapDetector(() => handlePlanetClick(data, wrapper, ps));
      wrapper.addEventListener('touchstart', tap.onTouchStart, { passive: true });
      wrapper.addEventListener('touchend',   tap.onTouchEnd,   { passive: false });
      wrapper.addEventListener('touchstart', () => ps.setHover(true),  { passive: true });
      wrapper.addEventListener('touchend',   () => ps.setHover(false), { passive: true });
      wrapper.addEventListener('touchcancel',() => ps.setHover(false), { passive: true });
    }

    // ---- Keyboard ----
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePlanetClick(data, wrapper, ps);
      }
    });
  }

  function handlePlanetClick(data, wrapper, ps) {
    if (isOpen) return;
    isOpen     = true;
    activeData = data;

    wrapper.classList.add('is-open');
    ps.setHover(false);

    // Ensure the sibling wrapper (desktop ↔ mobile) never has a stale is-open
    // that would block pointer-events on the wrong element
    const isMob = window.innerWidth <= 768;
    const siblingId = isMob
      ? `pw-${data.id}`        // we're on mobile, clear desktop sibling
      : `mp-pw-${data.id}`;    // we're on desktop, clear mobile sibling
    const sibling = document.getElementById(siblingId);
    if (sibling) {
      sibling.classList.remove('is-open');
      sibling.style.opacity    = '';
      sibling.style.transition = '';
    }

    if (reducedMotion) {
      openModal(data, true);
      return;
    }

    const center     = getElementCenter(wrapper);
    ps.isHovered     = true;
    const burstDelay = IS_MOBILE ? 80 : 120;

    setTimeout(() => {
      burst.start(center.x, center.y, data.burstColor, () => {
        openModal(data, false);
        ps.isHovered             = false;
        wrapper.style.opacity    = '0.35';
        wrapper.style.transition = 'opacity 0.4s ease';
      });
    }, burstDelay);
  }

  function handleClose() {
    if (!isOpen) return;

    if (reducedMotion) {
      closeModal(true, () => {
        isOpen     = false;
        activeData = null;
        _restoreAllWrappers();
      });
      return;
    }

    closeModal(false, () => {
      if (!activeData) { isOpen = false; return; }

      // On mobile, prefer the mobile wrapper; on desktop prefer the desktop one.
      // We must NOT use || short-circuit because both elements exist in the DOM
      // simultaneously — desktop wrapper is in the fixed overlay (hidden),
      // mobile wrapper is in the scrollable page. Using the wrong one leaves
      // is-open + opacity:0.35 stuck on the mobile wrapper permanently.
      const isMobile = window.innerWidth <= 768;
      const desktopWrapper = document.getElementById(`pw-${activeData.id}`);
      const mobileWrapper  = document.getElementById(`mp-pw-${activeData.id}`);
      const wrapper = isMobile ? (mobileWrapper || desktopWrapper)
                                : (desktopWrapper || mobileWrapper);

      const center = wrapper
        ? getElementCenter(wrapper)
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      burst.reverse(center.x, center.y, activeData.burstColor, () => {
        if (wrapper) {
          wrapper.style.transition = 'opacity 0.5s ease';
          wrapper.style.opacity    = '1';
          setTimeout(() => {
            wrapper.classList.remove('is-open');
            wrapper.style.transition = '';
            wrapper.style.opacity    = '';
          }, 520);
        }
        // Also ensure the OTHER wrapper (whichever wasn't used) is fully reset
        // in case it got partially modified
        const otherWrapper = isMobile ? desktopWrapper : mobileWrapper;
        if (otherWrapper && otherWrapper !== wrapper) {
          otherWrapper.classList.remove('is-open');
          otherWrapper.style.opacity    = '';
          otherWrapper.style.transition = '';
        }

        isOpen     = false;
        activeData = null;
      });
    });
  }

  function _restoreAllWrappers() {
    PROJECT_PLANETS.forEach(d => {
      [`pw-${d.id}`, `mp-pw-${d.id}`].forEach(id => {
        const w = document.getElementById(id);
        if (w) { w.classList.remove('is-open'); w.style.opacity = ''; w.style.transition = ''; }
      });
    });
  }

  // Called by main.js when switching between desktop/mobile layouts
  function setMobileMode(val) {
    mobileMode = val;
    // When switching to mobile mode, trigger a resize so canvases
    // pick up their new CSS dimensions
    if (val) {
      setTimeout(() => {
        mobilePlanetScenes.forEach(ps => ps.resize());
      }, 100);
    } else {
      setTimeout(() => {
        planetScenes.forEach(ps => ps.resize());
      }, 100);
    }
  }

  function onEscape() { if (isOpen) handleClose(); }
  function setReducedMotion(val) { reducedMotion = val; }

  return { init, onEscape, setReducedMotion, setMobileMode };
})();

// ============================================
// 11. BOOTSTRAP
// ============================================

function _boot() { ProjectPlanets.init(); }

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _boot);
} else {
  _boot();
}

window.ProjectPlanets = ProjectPlanets;
