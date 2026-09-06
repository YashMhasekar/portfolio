// ============================================
// 3D Dynamic Developer Portfolio — Main Script
// ============================================

import * as THREE from 'three';
import { skills, projects } from './data.js';

// ============================================
// Constants
// ============================================
const SECTION_COUNT = 6;
const SECTION_NAMES = ['Home', 'About', 'Skills', 'Projects', 'Contact', 'Achievements'];
const CAMERA_POSITIONS = [
    { x: 0, y: 0, z: 5 },
    { x: 0, y: 0.5, z: -10 },
    { x: 0, y: 0, z: -35 },
    { x: 0, y: 0, z: -55 },
    { x: 0, y: 0, z: -75 },
    { x: 0, y: 0, z: -75 },  // Achievements reuses contact camera depth; overlay handles visuals
];
const LERP_SPEED = 0.04;

// ============================================
// State
// ============================================
let currentSection = 0;
let targetSection = 0;
let isTransitioning = false;
let scrollCooldown = false;
let reducedMotion = false;
let mouseX = 0;
let mouseY = 0;
let clock = new THREE.Clock();
let modalOpen = false;

// ============================================
// Device Capability Detection
// ============================================
function getDeviceQuality() {
    const cores = navigator.hardwareConcurrency || 2;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile || cores <= 2) return 'low';
    if (cores <= 4) return 'medium';
    return 'high';
}

const quality = getDeviceQuality();
const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const particleCount = quality === 'high' ? 2000 : quality === 'medium' ? 1000 : 400;

// Cap DPR: mobile ≤ 1.5, desktop ≤ 2
const dpr = isMobileDevice
    ? Math.min(window.devicePixelRatio, 1.5)
    : Math.min(window.devicePixelRatio, 2);

// Returns true when viewport width is in the mobile range
function isMobileLayout() {
    return window.innerWidth <= 768;
}

// ============================================
// Three.js Setup
// ============================================
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality !== 'low',
    alpha: true,
    powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(dpr);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = quality !== 'low';
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(CAMERA_POSITIONS[0].x, CAMERA_POSITIONS[0].y, CAMERA_POSITIONS[0].z);

// ============================================
// Lighting
// ============================================
const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
scene.add(ambientLight);

const mainLight = new THREE.PointLight(0x6c63ff, 2, 80);
mainLight.position.set(5, 5, 8);
scene.add(mainLight);

const secondaryLight = new THREE.PointLight(0x8b83ff, 1.2, 60);
secondaryLight.position.set(-5, 3, -10);
scene.add(secondaryLight);

const accentLight = new THREE.PointLight(0x4ade80, 0.6, 50);
accentLight.position.set(3, -2, -35);
scene.add(accentLight);

const projectLight = new THREE.PointLight(0x6c63ff, 1.5, 60);
projectLight.position.set(0, 3, -55);
scene.add(projectLight);

const contactLight = new THREE.PointLight(0x8b83ff, 1, 50);
contactLight.position.set(0, 2, -75);
scene.add(contactLight);

const sunLight = new THREE.PointLight(0xfff5e0, quality === 'high' ? 6 : 4, 120);
sunLight.position.set(0, 0, -12);
if (quality !== 'low') {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(512, 512);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
}
scene.add(sunLight);

const fillLight = new THREE.PointLight(0x112244, 0.8, 80);
fillLight.position.set(-8, 2, -20);
scene.add(fillLight);

// ============================================
// Materials (shared)
// ============================================
const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x6c63ff,
    emissive: 0x6c63ff,
    emissiveIntensity: 0.15,
    metalness: 0.7,
    roughness: 0.3,
});

const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x6c63ff,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
});

// ============================================
// Hero Section — Milky Way Galaxy
// ============================================
const heroGroup = new THREE.Group();
heroGroup.position.set(0, 0, 0);

const GALAXY = {
    arms: 4,
    armSpread: 0.35,
    armCurve: 2.8,
    armParticles: quality === 'high' ? 12000 : quality === 'medium' ? 7000 : 3500,
    bulgeParticles: quality === 'high' ? 4000 : quality === 'medium' ? 2500 : 1200,
    hazeParticles: quality === 'high' ? 3000 : quality === 'medium' ? 1500 : 800,
    radius: 4.5,
    bulgeRadius: 1.0,
    thickness: 0.15,
    bulgeThickness: 0.6,
};

(function createBulge() {
    const count = GALAXY.bulgeParticles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.5) * GALAXY.bulgeRadius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const flatFactor = 0.6;
        positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.cos(phi) * flatFactor;
        positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        const t = r / GALAXY.bulgeRadius;
        const color = new THREE.Color();
        color.setHSL(0.12 - t * 0.06, 0.3 + t * 0.3, 0.95 - t * 0.35);
        colors[i3] = color.r; colors[i3 + 1] = color.g; colors[i3 + 2] = color.b;
        sizes[i] = (1.0 - t * 0.5) * (0.8 + Math.random() * 0.6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
    heroGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.06, vertexColors: true, transparent: true, opacity: 0.9,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
})();

(function createSpiralArms() {
    const count = GALAXY.armParticles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const armIndex = Math.floor(Math.random() * GALAXY.arms);
        const armAngleOffset = (armIndex / GALAXY.arms) * Math.PI * 2;
        const dist = GALAXY.bulgeRadius * 0.5 + Math.pow(Math.random(), 0.7) * (GALAXY.radius - GALAXY.bulgeRadius * 0.5);
        const spiralAngle = dist * GALAXY.armCurve + armAngleOffset;
        const spread = (Math.random() - 0.5 + (Math.random() - 0.5)) * GALAXY.armSpread * (0.5 + dist / GALAXY.radius);
        positions[i3]     = Math.cos(spiralAngle + spread) * dist;
        positions[i3 + 1] = (Math.random() - 0.5) * GALAXY.thickness * (1 + dist * 0.3);
        positions[i3 + 2] = Math.sin(spiralAngle + spread) * dist;
        const t = dist / GALAXY.radius;
        const color = new THREE.Color();
        if (t < 0.3)      color.setHSL(0.12, 0.2 + t, 0.85 - t * 0.3);
        else if (t < 0.6) { const b = (t - 0.3) / 0.3; color.setHSL(0.12 + b * 0.5, 0.3, 0.7 - b * 0.1); }
        else               color.setHSL(0.6 + Math.random() * 0.05, 0.4 + Math.random() * 0.2, 0.5 + Math.random() * 0.2);
        if (Math.random() < 0.05 && t > 0.2) color.setHSL(0.95 + Math.random() * 0.1, 0.6, 0.4 + Math.random() * 0.2);
        colors[i3] = color.r; colors[i3 + 1] = color.g; colors[i3 + 2] = color.b;
        sizes[i] = (0.3 + Math.random() * 0.7) * (1.0 - t * 0.4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
    heroGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.04, vertexColors: true, transparent: true, opacity: 0.85,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
})();

(function createDiskHaze() {
    const count = GALAXY.hazeParticles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const dist = Math.pow(Math.random(), 0.5) * GALAXY.radius;
        const angle = Math.random() * Math.PI * 2;
        positions[i3]     = Math.cos(angle) * dist;
        positions[i3 + 1] = (Math.random() - 0.5) * GALAXY.thickness * 2;
        positions[i3 + 2] = Math.sin(angle) * dist;
        const color = new THREE.Color();
        color.setHSL(0.65, 0.15, 0.25 + (dist / GALAXY.radius) * 0.1);
        colors[i3] = color.r; colors[i3 + 1] = color.g; colors[i3 + 2] = color.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    heroGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.1, vertexColors: true, transparent: true, opacity: 0.25,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
})();

(function createCoreGlow() {
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff4e0, transparent: true, opacity: 0.6 }));
    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffe8c0, transparent: true, opacity: 0.15 }));
    heroGroup.add(g1, g2);
})();

heroGroup.rotation.x = 0.8;
heroGroup.rotation.z = 0.2;
scene.add(heroGroup);

// ============================================
// About Section — Solar System
// ============================================

const solarSystemGroup = new THREE.Group();
solarSystemGroup.position.set(0, 0, -12);
scene.add(solarSystemGroup);

function createAtmosphere(radius, color, opacity, segments = 20) {
    const geo = new THREE.SphereGeometry(radius, segments, segments);
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            atmosphereColor: { value: new THREE.Color(color) },
            opacity: { value: opacity },
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 atmosphereColor;
            uniform float opacity;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(atmosphereColor, intensity * opacity);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
    });
    return new THREE.Mesh(geo, mat);
}

function createOrbitRing(radius, inclinationX, inclinationZ, color = 0x6c63ff, opacity = 0.05) {
    const geo = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 128);
    const mat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2 + inclinationX;
    ring.rotation.z = inclinationZ;
    return ring;
}

function makePlanetTexture(size, drawFn) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    drawFn(ctx, size);
    return new THREE.CanvasTexture(c);
}

// ---- Sun ----
function buildSun() {
    const group = new THREE.Group();
    const sunTex = makePlanetTexture(256, (ctx, s) => {
        const grad = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
        grad.addColorStop(0,'#fff8e7'); grad.addColorStop(0.2,'#ffe066');
        grad.addColorStop(0.6,'#ff9900'); grad.addColorStop(1.0,'#cc4400');
        ctx.fillStyle = grad; ctx.fillRect(0,0,s,s);
        for (let i=0;i<120;i++){
            const x=Math.random()*s,y=Math.random()*s,r=Math.random()*12+2;
            const g2=ctx.createRadialGradient(x,y,0,x,y,r);
            g2.addColorStop(0,'rgba(255,220,50,0.25)'); g2.addColorStop(1,'rgba(255,100,0,0)');
            ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        }
    });
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.9,32,32), new THREE.MeshBasicMaterial({map:sunTex}));
    group.add(sunMesh);
    const coronaData = [
        {r:1.1,opacity:0.45,color:0xffcc44},{r:1.35,opacity:0.2,color:0xff9900},
        {r:1.75,opacity:0.09,color:0xff6600},{r:2.4,opacity:0.04,color:0xff4400},
    ];
    const coronaMeshes = [];
    coronaData.forEach(d => {
        const m = new THREE.Mesh(
            new THREE.SphereGeometry(d.r,24,24),
            new THREE.MeshBasicMaterial({color:d.color,transparent:true,opacity:d.opacity,blending:THREE.AdditiveBlending,depthWrite:false})
        );
        group.add(m); coronaMeshes.push(m);
    });
    return { group, mesh: sunMesh, coronaMeshes };
}

const sunObj = buildSun();
solarSystemGroup.add(sunObj.group);

const PLANET_CONFIGS = [
    { name:'Mercury', orbitRadius:2.1, size:0.09, inclinationX:0.12, inclinationZ:0.05, zOffset:0.8, orbitSpeed:1.5, selfRotation:0.003, startAngle:Math.random()*Math.PI*2,
      buildSurface:()=>{ const tex=makePlanetTexture(128,(ctx,s)=>{ ctx.fillStyle='#888888';ctx.fillRect(0,0,s,s); for(let i=0;i<60;i++){const x=Math.random()*s,y=Math.random()*s,r=Math.random()*8+2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=`rgba(${50+Math.floor(Math.random()*40)},${50+Math.floor(Math.random()*40)},${50+Math.floor(Math.random()*40)},0.6)`;ctx.fill();}});return new THREE.MeshStandardMaterial({map:tex,roughness:0.95,metalness:0.05}); }, atmosphere:null },
    { name:'Venus', orbitRadius:2.9, size:0.16, inclinationX:-0.08, inclinationZ:0.07, zOffset:-0.6, orbitSpeed:1.1, selfRotation:0.001, startAngle:Math.random()*Math.PI*2,
      buildSurface:()=>{ const tex=makePlanetTexture(128,(ctx,s)=>{ const g=ctx.createLinearGradient(0,0,s,s);g.addColorStop(0,'#e8c87a');g.addColorStop(0.3,'#d4a855');g.addColorStop(0.6,'#c49040');g.addColorStop(1,'#e8c87a');ctx.fillStyle=g;ctx.fillRect(0,0,s,s); for(let i=0;i<20;i++){ctx.beginPath();ctx.moveTo(0,Math.random()*s);ctx.bezierCurveTo(s*0.3,Math.random()*s,s*0.7,Math.random()*s,s,Math.random()*s);ctx.lineWidth=2+Math.random()*3;ctx.strokeStyle='rgba(200,150,60,0.3)';ctx.stroke();}});return new THREE.MeshStandardMaterial({map:tex,roughness:0.7,metalness:0.0}); }, atmosphere:{color:0xe8c870,opacity:0.55,scale:1.12} },
    { name:'Earth', orbitRadius:3.7, size:0.17, inclinationX:0.03, inclinationZ:-0.04, zOffset:-1.4, orbitSpeed:0.95, selfRotation:0.008, startAngle:Math.random()*Math.PI*2,
      buildSurface:()=>{ const tex=makePlanetTexture(256,(ctx,s)=>{ ctx.fillStyle='#1a6ea8';ctx.fillRect(0,0,s,s); [{x:0.35,y:0.35,w:0.18,h:0.28,c:'#2d7a2d'},{x:0.57,y:0.30,w:0.14,h:0.22,c:'#3a8a30'},{x:0.68,y:0.36,w:0.12,h:0.18,c:'#4a7a25'},{x:0.15,y:0.42,w:0.08,h:0.10,c:'#c8a050'},{x:0.42,y:0.70,w:0.20,h:0.08,c:'#e8e8f0'}].forEach(o=>{ctx.fillStyle=o.c;ctx.beginPath();ctx.ellipse(o.x*s,o.y*s,o.w*s*0.5,o.h*s*0.5,Math.random(),0,Math.PI*2);ctx.fill();}); for(let i=0;i<30;i++){const x=Math.random()*s,y=Math.random()*s,r=8+Math.random()*16;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${0.15+Math.random()*0.2})`;ctx.fill();}});return new THREE.MeshStandardMaterial({map:tex,roughness:0.6,metalness:0.05}); }, atmosphere:{color:0x4499ff,opacity:0.5,scale:1.10} },
    { name:'Mars', orbitRadius:4.6, size:0.12, inclinationX:0.18, inclinationZ:0.06, zOffset:-2.2, orbitSpeed:0.75, selfRotation:0.007, startAngle:Math.random()*Math.PI*2,
      buildSurface:()=>{ const tex=makePlanetTexture(128,(ctx,s)=>{ const g=ctx.createLinearGradient(0,0,s,0);g.addColorStop(0,'#c1440e');g.addColorStop(0.4,'#a83210');g.addColorStop(0.7,'#d4521a');g.addColorStop(1,'#b83c0e');ctx.fillStyle=g;ctx.fillRect(0,0,s,s); for(let i=0;i<40;i++){const x=Math.random()*s,y=Math.random()*s,r=3+Math.random()*10;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=`rgba(${80+Math.floor(Math.random()*40)},${20+Math.floor(Math.random()*20)},${5+Math.floor(Math.random()*10)},0.4)`;ctx.fill();}});return new THREE.MeshStandardMaterial({map:tex,roughness:0.9,metalness:0.02}); }, atmosphere:{color:0xd4521a,opacity:0.18,scale:1.08} },
    { name:'Jupiter', orbitRadius:6.4, size:0.46, inclinationX:-0.06, inclinationZ:-0.05, zOffset:-4.5, orbitSpeed:0.42, selfRotation:0.018, startAngle:Math.random()*Math.PI*2,
      buildSurface:()=>{ const tex=makePlanetTexture(256,(ctx,s)=>{ ['#e8d5a3','#c8a870','#b89060','#d4b885','#c09050','#e8d5a3','#b88050','#d4c090','#c8a870','#b07840','#e0cc98','#c09060','#d8b878','#b88050','#e8d5a3'].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,i*(s/15),s,(s/15)+1);}); const gx=s*0.62,gy=s*0.56;const gg=ctx.createRadialGradient(gx,gy,0,gx,gy,22);gg.addColorStop(0,'rgba(180,60,30,0.95)');gg.addColorStop(1,'rgba(140,70,30,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.ellipse(gx,gy,22,14,0.2,0,Math.PI*2);ctx.fill();});return new THREE.MeshStandardMaterial({map:tex,roughness:0.65,metalness:0.0}); }, atmosphere:{color:0xd4b880,opacity:0.22,scale:1.06} },
    { name:'Saturn', orbitRadius:8.0, size:0.38, inclinationX:0.10, inclinationZ:0.08, zOffset:-7.0, orbitSpeed:0.32, selfRotation:0.015, startAngle:Math.random()*Math.PI*2, hasRings:true,
      buildSurface:()=>{ const tex=makePlanetTexture(256,(ctx,s)=>{ ['#f0e0a0','#d8c070','#e8d090','#c8b060','#f0e0a0','#d0b860','#e8d090','#c8a850','#f0e0a0','#d8c070'].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,i*(s/10),s,(s/10)+1);});});return new THREE.MeshStandardMaterial({map:tex,roughness:0.6,metalness:0.0}); }, atmosphere:{color:0xe8d090,opacity:0.2,scale:1.06} },
    { name:'Uranus', orbitRadius:9.8, size:0.24, inclinationX:-0.22, inclinationZ:0.14, zOffset:-10.0, orbitSpeed:0.22, selfRotation:0.010, selfRotationTilt:Math.PI*0.45, startAngle:Math.random()*Math.PI*2, hasFaintRings:true,
      buildSurface:()=>{ const tex=makePlanetTexture(128,(ctx,s)=>{ const g=ctx.createLinearGradient(0,0,0,s);g.addColorStop(0,'#7ecfcf');g.addColorStop(0.3,'#6abfbf');g.addColorStop(0.6,'#7edcdc');g.addColorStop(1,'#5ab0b0');ctx.fillStyle=g;ctx.fillRect(0,0,s,s);});return new THREE.MeshStandardMaterial({map:tex,roughness:0.55,metalness:0.0}); }, atmosphere:{color:0x6adcdc,opacity:0.3,scale:1.09} },
    { name:'Neptune', orbitRadius:11.2, size:0.22, inclinationX:0.16, inclinationZ:-0.12, zOffset:-13.0, orbitSpeed:0.16, selfRotation:0.011, startAngle:Math.random()*Math.PI*2,
      buildSurface:()=>{ const tex=makePlanetTexture(128,(ctx,s)=>{ const g=ctx.createLinearGradient(0,0,0,s);g.addColorStop(0,'#1a3aaa');g.addColorStop(0.5,'#2040b0');g.addColorStop(1,'#1a3aaa');ctx.fillStyle=g;ctx.fillRect(0,0,s,s);});return new THREE.MeshStandardMaterial({map:tex,roughness:0.5,metalness:0.0}); }, atmosphere:{color:0x2040cc,opacity:0.38,scale:1.10} },
];

const planets = [];
let saturnObj = null;

function buildSaturnRings(planetSize) {
    const ringGroup = new THREE.Group();
    [{inner:1.55,outer:2.05,color:'#d4c88a',opacity:0.45},{inner:2.05,outer:2.25,color:'#d0bc78',opacity:0.4},{inner:2.25,outer:2.55,color:'#a09050',opacity:0.12}].forEach(layer => {
        const mat = new THREE.MeshBasicMaterial({color:layer.color,transparent:true,opacity:layer.opacity,side:THREE.DoubleSide,depthWrite:false});
        const mesh = new THREE.Mesh(new THREE.RingGeometry(planetSize*layer.inner,planetSize*layer.outer,128,4), mat);
        mesh.rotation.x = Math.PI/2; ringGroup.add(mesh);
    });
    ringGroup.rotation.x = 0.44; ringGroup.rotation.z = 0.08;
    return ringGroup;
}

function buildFaintRings(planetSize) {
    const ringGroup = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.RingGeometry(planetSize*1.5,planetSize*1.9,80), new THREE.MeshBasicMaterial({color:0x88cccc,transparent:true,opacity:0.12,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
    mesh.rotation.x = Math.PI/2; ringGroup.rotation.z = 1.55; ringGroup.add(mesh);
    return ringGroup;
}

PLANET_CONFIGS.forEach(cfg => {
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.x = cfg.inclinationX; orbitGroup.rotation.z = cfg.inclinationZ;
    const pivot = new THREE.Group(); pivot.rotation.y = cfg.startAngle;
    const planetGroup = new THREE.Group(); planetGroup.position.x = cfg.orbitRadius;
    if (cfg.selfRotationTilt !== undefined) planetGroup.rotation.z = cfg.selfRotationTilt;
    const mat = cfg.buildSurface(cfg.size);
    const geo = new THREE.SphereGeometry(cfg.size, quality==='low'?16:32, quality==='low'?16:32);
    const mesh = new THREE.Mesh(geo, mat);
    if (quality !== 'low') { mesh.castShadow = true; mesh.receiveShadow = true; }
    planetGroup.add(mesh);
    if (cfg.atmosphere && quality !== 'low') planetGroup.add(createAtmosphere(cfg.size*cfg.atmosphere.scale,cfg.atmosphere.color,cfg.atmosphere.opacity,quality==='medium'?16:24));
    if (cfg.hasRings) { const rings = buildSaturnRings(cfg.size); planetGroup.add(rings); saturnObj = {rings}; }
    if (cfg.hasFaintRings && quality !== 'low') planetGroup.add(buildFaintRings(cfg.size));
    orbitGroup.add(createOrbitRing(cfg.orbitRadius,0,0,0x6c63ff,0.055));
    orbitGroup.position.z = cfg.zOffset;
    pivot.add(planetGroup); orbitGroup.add(pivot); solarSystemGroup.add(orbitGroup);
    planets.push({ pivot, mesh, group: planetGroup, speed: cfg.orbitSpeed, selfRotation: cfg.selfRotation, name: cfg.name, orbitRadius: cfg.orbitRadius });
});

// ============================================
// Asteroid Belt
// ============================================
const asteroidCount = quality==='high'?800:quality==='medium'?400:180;
const asteroidGeo = new THREE.SphereGeometry(0.018, quality==='low'?4:6, quality==='low'?4:6);
const asteroidMat = new THREE.MeshStandardMaterial({color:0x888877,roughness:0.95,metalness:0.05});
const asteroidMesh = new THREE.InstancedMesh(asteroidGeo,asteroidMat,asteroidCount);
asteroidMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
const asteroidData = [];
const _dummy = new THREE.Object3D();
for (let i=0;i<asteroidCount;i++){
    const angle=Math.random()*Math.PI*2,radius=5.1+Math.random()*1.1;
    const y=(Math.random()-0.5)*0.45,z=(Math.random()-0.5)*1.8,scale=0.5+Math.random()*1.5;
    asteroidData.push({angle,radius,y,z,scale,speed:0.008+Math.random()*0.012});
    _dummy.position.set(Math.cos(angle)*radius,y,z); _dummy.scale.setScalar(scale*0.022); _dummy.updateMatrix();
    asteroidMesh.setMatrixAt(i,_dummy.matrix);
}
asteroidMesh.instanceMatrix.needsUpdate = true;
const asteroidBeltGroup = new THREE.Group(); asteroidBeltGroup.add(asteroidMesh); solarSystemGroup.add(asteroidBeltGroup);

// ============================================
// Skills Section — Floating Orbs
// ============================================
const skillsGroup = new THREE.Group(); skillsGroup.position.set(0,0,-35);
const allSkills = [...skills.frontend.map(s=>({...s,category:'frontend'})),...skills.backend.map(s=>({...s,category:'backend'})),...skills.tools.map(s=>({...s,category:'tools'}))];
const categoryColors = {frontend:0x6c63ff,backend:0x4ade80,tools:0xfbbf24};
const skillOrbs = [];
const orbCount = Math.min(allSkills.length,quality==='low'?8:18);
for (let i=0;i<orbCount;i++){
    const skill=allSkills[i%allSkills.length];
    const angle=(i/orbCount)*Math.PI*2, radius=2.5+Math.random()*1.5, y=(Math.random()-0.5)*2.5;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12+Math.random()*0.1,16,16),new THREE.MeshStandardMaterial({color:categoryColors[skill.category],emissive:categoryColors[skill.category],emissiveIntensity:0.5,metalness:0.5,roughness:0.3}));
    orb.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
    orb.userData={basePos:orb.position.clone(),speed:0.3+Math.random()*0.5,offset:Math.random()*Math.PI*2};
    skillOrbs.push(orb); skillsGroup.add(orb);
}
const dodecMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6,0),accentMaterial.clone()); skillsGroup.add(dodecMesh);
const dodecWire = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8,0),wireframeMaterial); skillsGroup.add(dodecWire);
scene.add(skillsGroup);

// ============================================
// Projects Section — 3D Floating Planes
// ============================================
const projectsGroup = new THREE.Group(); projectsGroup.position.set(0,0,-55);
const projectMeshes = [];
projects.forEach((project,i) => {
    const cardGroup = new THREE.Group();
    const col=i%3,row=Math.floor(i/3),x=(col-1)*2.8,y=-row*2.2+0.5;
    const planeMesh = new THREE.Mesh(new THREE.BoxGeometry(2,1.5,0.05),new THREE.MeshPhysicalMaterial({color:0x1a1a2e,emissive:0x6c63ff,emissiveIntensity:0.04,metalness:0.3,roughness:0.5,transparent:true,opacity:0.8}));
    cardGroup.add(planeMesh);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(2,0.03,0.06),new THREE.MeshBasicMaterial({color:0x6c63ff,transparent:true,opacity:0.6}));
    edge.position.y=0.75; cardGroup.add(edge);
    cardGroup.position.set(x,y,0); cardGroup.userData={projectIndex:i,basePos:new THREE.Vector3(x,y,0),baseRotation:new THREE.Euler(0,0,0)};
    projectMeshes.push(cardGroup); projectsGroup.add(cardGroup);
});
scene.add(projectsGroup);

// ============================================
// Contact Section — Particle Grid
// ============================================
const contactGroup = new THREE.Group(); contactGroup.position.set(0,0,-75);
const gridSize=quality==='low'?6:10, gridSpacing=0.8;
for (let x=-gridSize/2;x<=gridSize/2;x++){
    for (let y=-gridSize/2;y<=gridSize/2;y++){
        const dot=new THREE.Mesh(new THREE.SphereGeometry(0.02,6,6),new THREE.MeshBasicMaterial({color:0x6c63ff,transparent:true,opacity:0.2+Math.random()*0.2}));
        dot.position.set(x*gridSpacing,y*gridSpacing,-1+Math.random()*0.5); contactGroup.add(dot);
    }
}
scene.add(contactGroup);

// ============================================
// Background Particles
// ============================================
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount*3);
const particleSizes = new Float32Array(particleCount);
for (let i=0;i<particleCount;i++){
    const i3=i*3;
    particlePositions[i3]=(Math.random()-0.5)*50; particlePositions[i3+1]=(Math.random()-0.5)*25; particlePositions[i3+2]=10-Math.random()*100;
    particleSizes[i]=Math.random()*2+0.5;
}
particleGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
particleGeometry.setAttribute('size',new THREE.BufferAttribute(particleSizes,1));
const particleMaterial = new THREE.PointsMaterial({color:0xffffff,size:0.1,transparent:true,opacity:0.8,sizeAttenuation:true,blending:THREE.AdditiveBlending,depthWrite:false});
const particles = new THREE.Points(particleGeometry,particleMaterial);
scene.add(particles);

// ============================================
// UI Population
// ============================================
function populateSkills() {
    const categories = {frontend:'frontend-skills',backend:'backend-skills',tools:'tools-skills'};
    for (const [category,elementId] of Object.entries(categories)){
        const container = document.getElementById(elementId);
        if (!container) continue;
        skills[category].forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `${skill.name}<span class="tooltip">${skill.level}</span>`;
            container.appendChild(tag);
        });
    }
}

function closeModal() {
    if (window.ProjectPlanets) window.ProjectPlanets.onEscape();
}

// ============================================
// Mobile Projects Page
// ============================================
const mobileProjectsPage = document.getElementById('mobile-projects-page');

function showMobileProjects() {
    if (!mobileProjectsPage) return;
    mobileProjectsPage.setAttribute('aria-hidden', 'false');
    mobileProjectsPage.classList.add('active');
    document.body.classList.add('mobile-projects-active');
    // Reset scroll to top every time
    mobileProjectsPage.scrollTop = 0;
}

function hideMobileProjects() {
    if (!mobileProjectsPage) return;
    mobileProjectsPage.classList.remove('active');
    mobileProjectsPage.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mobile-projects-active');
}

// Wire "Continue to Contact" button
const mpContinueBtn = document.querySelector('.mp-continue-btn');
if (mpContinueBtn) {
    mpContinueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSection(parseInt(mpContinueBtn.dataset.section));
    });
}

// Swipe at boundaries inside mobile projects page
if (mobileProjectsPage) {
    let mpTouchY = 0;
    mobileProjectsPage.addEventListener('touchstart', (e) => {
        mpTouchY = e.touches[0].clientY;
    }, { passive: true });

    mobileProjectsPage.addEventListener('touchend', (e) => {
        const dy         = mpTouchY - e.changedTouches[0].clientY;
        const scrollTop  = mobileProjectsPage.scrollTop;
        const maxScroll  = mobileProjectsPage.scrollHeight - mobileProjectsPage.clientHeight;
        const atTop      = scrollTop <= 2;
        const atBottom   = scrollTop >= maxScroll - 4;

        if (dy < -80 && atTop)    goToSection(currentSection - 1);
        else if (dy > 80 && atBottom) goToSection(currentSection + 1);
    }, { passive: true });
}

// ============================================
// Mobile Hamburger Menu
// ============================================
const mobileMenuBtn  = document.getElementById('mobile-menu-btn');
const mobileNav      = document.getElementById('mobile-nav');
const mobileNavClose = document.getElementById('mobile-nav-close');
const mobileBackdrop = document.getElementById('mobile-nav-backdrop');

function openMobileMenu() {
    if (!mobileNav || !mobileMenuBtn) return;
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
    if (!mobileNav || !mobileMenuBtn) return;
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
}

if (mobileMenuBtn)  mobileMenuBtn.addEventListener('click', openMobileMenu);
if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileMenu);
if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

// Mobile nav link clicks
document.querySelectorAll('.mobile-nav-link[data-section]').forEach(link => {
    link.addEventListener('click', () => {
        goToSection(parseInt(link.dataset.section));
        closeMobileMenu();
    });
});

// ============================================
// Section Navigation
// ============================================
function goToSection(index) {
    if (index < 0 || index >= SECTION_COUNT || index === currentSection || isTransitioning) return;
    isTransitioning = true;
    targetSection   = index;

    // Sync all nav active states
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.indicator').forEach(i => i.classList.remove('active'));
    document.querySelectorAll(`.nav-link[data-section="${index}"]`).forEach(l => l.classList.add('active'));
    document.querySelectorAll(`.indicator[data-section="${index}"]`).forEach(i => i.classList.add('active'));
    document.querySelectorAll('.mobile-nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`.mobile-nav-link[data-section="${index}"]`).forEach(l => l.classList.add('active'));

    // Hide all fixed overlay sections
    document.querySelectorAll('.overlay-section').forEach(s => s.classList.remove('active'));

    const overlayIds = ['hero-overlay','about-overlay','skills-overlay','projects-overlay','contact-overlay','achievements-overlay'];

    if (isMobileLayout() && index === 3) {
        // Mobile Projects — use dedicated scrollable page
        hideMobileProjects();
        setTimeout(() => {
            showMobileProjects();
            if (window.ProjectPlanets) window.ProjectPlanets.setMobileMode(true);
        }, 50);
    } else {
        // Desktop OR non-projects section — use fixed overlay
        hideMobileProjects();
        if (window.ProjectPlanets) window.ProjectPlanets.setMobileMode(false);
        setTimeout(() => {
            const overlay = document.getElementById(overlayIds[index]);
            if (overlay) overlay.classList.add('active');
        }, 400);
    }

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) scrollIndicator.style.opacity = index === 0 ? '1' : '0';

    currentSection = index;
    setTimeout(() => { isTransitioning = false; }, 1200);
}

// ============================================
// Scroll / Touch / Keyboard
// ============================================
function onWheel(e) {
    // Don't intercept when mobile projects page is visible
    if (mobileProjectsPage && mobileProjectsPage.classList.contains('active')) return;
    if (scrollCooldown || modalOpen) return;
    const delta = Math.sign(e.deltaY);
    const next = currentSection + delta;
    if (next >= 0 && next < SECTION_COUNT) {
        goToSection(next);
        scrollCooldown = true;
        setTimeout(() => { scrollCooldown = false; }, 1000);
    }
}

let touchStartY = 0, touchStartX = 0, touchStartTime = 0;

function onTouchStart(e) {
    // Skip if mobile projects page is handling scroll
    if (mobileProjectsPage && mobileProjectsPage.classList.contains('active')) return;
    touchStartY    = e.touches[0].clientY;
    touchStartX    = e.touches[0].clientX;
    touchStartTime = Date.now();
}

function onTouchMove(e) { /* passive — just records movement */ }

function onTouchEnd(e) {
    if (mobileProjectsPage && mobileProjectsPage.classList.contains('active')) return;
    if (modalOpen) return;
    const dy    = touchStartY - e.changedTouches[0].clientY;
    const dx    = e.changedTouches[0].clientX - touchStartX;
    const absDy = Math.abs(dy), absDx = Math.abs(dx);
    // Only fire on clearly vertical swipes with enough distance
    if (absDy < 60 || absDy < absDx * 1.5) return;
    if (scrollCooldown) return;
    const next = currentSection + (dy > 0 ? 1 : -1);
    if (next >= 0 && next < SECTION_COUNT) {
        goToSection(next);
        scrollCooldown = true;
        setTimeout(() => { scrollCooldown = false; }, 1000);
    }
}

function onKeyDown(e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) { closeMobileMenu(); return; }
    if (e.key === 'Escape' && window.ProjectPlanets) { window.ProjectPlanets.onEscape(); return; }
    if (modalOpen) { if (e.key === 'Escape') closeModal(); return; }
    switch (e.key) {
        case 'ArrowDown': case 'PageDown': e.preventDefault(); goToSection(currentSection+1); break;
        case 'ArrowUp':   case 'PageUp':   e.preventDefault(); goToSection(currentSection-1); break;
        case 'Home': e.preventDefault(); goToSection(0); break;
        case 'End':  e.preventDefault(); goToSection(SECTION_COUNT-1); break;
        case '1':case '2':case '3':case '4':case '5': goToSection(parseInt(e.key)-1); break;
        case '6': goToSection(5); break;
    }
}

function onMouseMove(e) {
    mouseX = (e.clientX/window.innerWidth)*2-1;
    mouseY = -(e.clientY/window.innerHeight)*2+1;
}

function onClick(e) { /* planets handled by universe.js */ }

// ============================================
// Resize Handler — debounced
// ============================================
let resizeTimer = null;

function handleResize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    const newDpr = isMobileDevice ? Math.min(window.devicePixelRatio,1.5) : Math.min(window.devicePixelRatio,2);
    renderer.setPixelRatio(newDpr);

    // Re-evaluate which project layout to use if we're on section 3
    if (currentSection === 3) {
        if (isMobileLayout()) {
            if (!mobileProjectsPage.classList.contains('active')) {
                document.querySelectorAll('.overlay-section').forEach(s => s.classList.remove('active'));
                showMobileProjects();
                if (window.ProjectPlanets) window.ProjectPlanets.setMobileMode(true);
            }
        } else {
            if (mobileProjectsPage.classList.contains('active')) {
                hideMobileProjects();
                if (window.ProjectPlanets) window.ProjectPlanets.setMobileMode(false);
                const overlay = document.getElementById('projects-overlay');
                if (overlay) overlay.classList.add('active');
            }
        }
    }
}

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 100);
});

window.addEventListener('orientationchange', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 250);
});

// ============================================
// Animation Loop
// ============================================
function animate() {
    requestAnimationFrame(animate);
    const delta   = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    if (reducedMotion) {
        const target = CAMERA_POSITIONS[currentSection];
        camera.position.x += (target.x - camera.position.x) * LERP_SPEED * 2;
        camera.position.y += (target.y - camera.position.y) * LERP_SPEED * 2;
        camera.position.z += (target.z - camera.position.z) * LERP_SPEED * 2;
        renderer.render(scene, camera); return;
    }

    const target   = CAMERA_POSITIONS[currentSection];
    const parallaxX = isMobileDevice ? 0 : mouseX * 0.3;
    const parallaxY = isMobileDevice ? 0 : mouseY * 0.15;
    camera.position.x += (target.x + parallaxX - camera.position.x) * LERP_SPEED;
    camera.position.y += (target.y + parallaxY - camera.position.y) * LERP_SPEED;
    camera.position.z += (target.z - camera.position.z) * LERP_SPEED;
    camera.lookAt(camera.position.x*0.5, camera.position.y*0.3, camera.position.z-10);

    heroGroup.rotation.y = elapsed * 0.03;

    sunObj.mesh.rotation.y = elapsed * 0.04;
    const sunScale = 1.0 + Math.sin(elapsed*1.5)*0.03;
    sunObj.group.scale.setScalar(sunScale);
    sunObj.coronaMeshes.forEach((c,i) => { c.material.opacity = c.material.opacity*0.98 + (0.04+Math.sin(elapsed*0.7+i)*0.015)*0.02; });
    sunLight.intensity = (quality==='high'?6:4) + Math.sin(elapsed*1.2)*0.6;

    planets.forEach(planet => {
        planet.pivot.rotation.y += planet.speed * delta * 0.28;
        planet.mesh.rotation.y  += planet.selfRotation;
    });

    for (let i=0;i<asteroidCount;i++){
        const d = asteroidData[i]; d.angle += d.speed * delta;
        _dummy.position.set(Math.cos(d.angle)*d.radius, d.y, d.z);
        _dummy.rotation.y += 0.02; _dummy.scale.setScalar(d.scale*0.022); _dummy.updateMatrix();
        asteroidMesh.setMatrixAt(i,_dummy.matrix);
    }
    asteroidMesh.instanceMatrix.needsUpdate = true;

    skillOrbs.forEach(orb => {
        const {basePos,speed,offset}=orb.userData;
        orb.position.x=basePos.x+Math.sin(elapsed*speed+offset)*0.3;
        orb.position.y=basePos.y+Math.cos(elapsed*speed*0.7+offset)*0.2;
        orb.position.z=basePos.z+Math.sin(elapsed*speed*0.5+offset*2)*0.2;
    });
    dodecMesh.rotation.x=elapsed*0.2; dodecMesh.rotation.y=elapsed*0.15;
    dodecWire.rotation.x=-elapsed*0.1; dodecWire.rotation.y=-elapsed*0.12;

    projectMeshes.forEach((group,i) => {
        const {basePos}=group.userData;
        group.position.y=basePos.y+Math.sin(elapsed*0.5+i*0.8)*0.08;
        group.rotation.y=Math.sin(elapsed*0.3+i)*0.03;
    });

    contactGroup.children.forEach((dot,i) => { dot.material.opacity=0.15+Math.sin(elapsed*0.5+i*0.1)*0.1; });

    const particlePos = particles.geometry.attributes.position.array;
    for (let i=0;i<particleCount;i++) particlePos[i*3+1] += Math.sin(elapsed*0.2+i)*0.001;
    particles.geometry.attributes.position.needsUpdate = true;

    mainLight.position.x=Math.sin(elapsed*0.3)*5;
    mainLight.position.y=Math.cos(elapsed*0.2)*3+3;
    secondaryLight.position.x=Math.cos(elapsed*0.4)*4-3;

    renderer.render(scene, camera);
}

// ============================================
// Event Listeners
// ============================================
window.addEventListener('wheel',      onWheel,      { passive: true });
window.addEventListener('keydown',    onKeyDown);
window.addEventListener('mousemove',  onMouseMove);
window.addEventListener('click',      onClick);
window.addEventListener('touchstart', onTouchStart, { passive: true });
window.addEventListener('touchmove',  onTouchMove,  { passive: true });
window.addEventListener('touchend',   onTouchEnd,   { passive: true });

document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); goToSection(parseInt(link.dataset.section)); });
});
document.querySelectorAll('.indicator[data-section]').forEach(dot => {
    dot.addEventListener('click', () => { goToSection(parseInt(dot.dataset.section)); });
});
document.querySelectorAll('.btn[data-section]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); goToSection(parseInt(btn.dataset.section)); });
});

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('project-modal').addEventListener('click', (e) => { if (e.target===e.currentTarget) closeModal(); });

const motionToggle = document.getElementById('reduced-motion-toggle');
motionToggle.addEventListener('click', () => {
    reducedMotion = !reducedMotion;
    document.body.classList.toggle('reduced-motion', reducedMotion);
    motionToggle.classList.toggle('active', reducedMotion);
    if (window.ProjectPlanets) window.ProjectPlanets.setReducedMotion(reducedMotion);
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reducedMotion = true;
    document.body.classList.add('reduced-motion');
    motionToggle.classList.add('active');
}

// ============================================
// Profile Photo Lightbox
// ============================================
(function () {
  const btn      = document.getElementById('avatar-btn');
  const lightbox = document.getElementById('avatar-lightbox');
  const backdrop = document.getElementById('avatar-lightbox-backdrop');
  const closeBtn = document.getElementById('avatar-lightbox-close');
  if (!btn || !lightbox) return;

  function openLightbox() {
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    btn.focus();
  }

  btn.addEventListener('click', openLightbox);
  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);

  // Close on Escape (handled alongside existing onKeyDown)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
})();

// ============================================
// Initialize
// ============================================
function init() {
    populateSkills();
    setTimeout(() => { document.getElementById('loader').classList.add('hidden'); }, 1500);
    animate();
}

init();
