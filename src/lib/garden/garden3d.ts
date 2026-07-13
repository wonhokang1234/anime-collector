/* Garden3D — procedural 3D Japanese estate zen garden (module three build) */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type ThreeNS = typeof THREE;

export interface GardenZone {
  x: number;
  z: number;
  r: number;
  prompt?: string;
}
export interface Garden3DOptions {
  mood: "midnight" | "dawn";
  zones: Record<string, GardenZone>;
  onNear: (zone: string | null) => void;
}
export interface Garden3DData {
  trees: { pct: number }[];
  koi: { c1: string; c2: string }[];
  seeds: number;
}

interface MoodDef {
  sky: number;
  ambient: number;
  ambientI: number;
  dirColor: number;
  dirI: number;
  lanternI: number;
  water: number;
  waterTex: number; // tint used instead of `water` once the painted map loads
  stars: boolean;
  fogD: number;
  shoji: number;
  moon: number;
  groundTint: number;
  gravelTint: number;
  envI: number;
  bloom: number;
  haloO: number;
  fireflyO: number;
}

const MOODS: Record<string, MoodDef> = {
  midnight: {
    sky: 0x0a1612,
    ambient: 0x4a6a62,
    ambientI: 0.98,
    dirColor: 0xcfe0d0,
    dirI: 0.58,
    lanternI: 1.7,
    water: 0x143028,
    waterTex: 0xbcd8ca,
    stars: true,
    fogD: 0.0052,
    shoji: 1.3,
    moon: 0xf2f7ee,
    groundTint: 0xffffff,
    gravelTint: 0xdddddd,
    envI: 0.3,
    bloom: 0.45,
    haloO: 0.34,
    fireflyO: 0.9,
  },
  dawn: {
    sky: 0xdfe8d6,
    ambient: 0xfff2d8,
    ambientI: 1.05,
    dirColor: 0xfff3d0,
    dirI: 1.05,
    lanternI: 0.25,
    water: 0x6fb09a,
    waterTex: 0xffffff,
    stars: false,
    fogD: 0.0038,
    shoji: 0.15,
    moon: 0xfff3d0,
    groundTint: 0xcccccc,
    gravelTint: 0xbdb9ac,
    envI: 0.55,
    bloom: 0.18,
    haloO: 0.08,
    fireflyO: 0,
  },
};

function noiseTexture(
  THREE: ThreeNS,
  base: number,
  blotch: number,
  n: number,
  alpha: number,
) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#" + base.toString(16).padStart(6, "0");
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#" + blotch.toString(16).padStart(6, "0");
  for (let i = 0; i < n; i++) {
    g.globalAlpha = alpha * (0.3 + Math.random() * 0.7);
    const r = 8 + Math.random() * 46;
    g.beginPath();
    g.ellipse(
      Math.random() * 512,
      Math.random() * 512,
      r,
      r * (0.5 + Math.random() * 0.5),
      Math.random() * 3,
      0,
      7,
    );
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class Garden3D {
  THREE!: ThreeNS;
  opts!: Garden3DOptions;
  zones!: Record<string, GardenZone>;
  onNear!: (zone: string | null) => void;
  mood!: "midnight" | "dawn";
  paused!: boolean;
  hidden!: boolean;
  private _near!: string | null;
  private _keys!: Record<string, boolean>;
  private _dataSig!: string;
  renderer!: THREE.WebGLRenderer | null;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  px!: number;
  pz!: number;
  vx!: number;
  vz!: number;
  moving!: boolean;
  zoom!: number;
  private _zoomT!: number;
  M!: Record<string, THREE.MeshStandardMaterial>;
  dynGroup!: THREE.Group;
  private _onResize!: () => void;
  private _kd!: (e: KeyboardEvent) => void;
  private _ku!: (e: KeyboardEvent) => void;
  private _wheel!: (e: WheelEvent) => void;
  private _clock!: THREE.Clock;
  private _lastTick!: number;
  private _raf!: number;
  private _watchdog!: ReturnType<typeof setInterval>;
  ambient!: THREE.AmbientLight;
  hemi!: THREE.HemisphereLight;
  dir!: THREE.DirectionalLight;
  lanternLights!: THREE.PointLight[];
  shojiMats!: THREE.MeshStandardMaterial[];
  groundTex!: THREE.CanvasTexture;
  groundMat!: THREE.MeshStandardMaterial;
  gravelTex!: THREE.CanvasTexture;
  gravelMat!: THREE.MeshStandardMaterial;
  waterMat!: THREE.MeshStandardMaterial;
  moonMat!: THREE.MeshBasicMaterial;
  moonMesh!: THREE.Mesh;
  starPoints!: THREE.Points;
  starMat!: THREE.PointsMaterial;
  mossMat!: THREE.MeshStandardMaterial;
  pathMat!: THREE.MeshStandardMaterial;
  shoreMat!: THREE.MeshStandardMaterial;
  private _texLoader!: THREE.TextureLoader;
  private _texList!: THREE.Texture[];
  private _sky!: { midnight?: THREE.Texture; dawn?: THREE.Texture };
  private _composer!: EffectComposer;
  private _bloom!: UnrealBloomPass;
  private _groundTintMats!: THREE.MeshStandardMaterial[];
  private _gravelTintMats!: THREE.MeshStandardMaterial[];
  private _halos!: THREE.Sprite[];
  private _pathPts!: number[];
  private _fireflies!: THREE.Points;
  private _fireflyBase!: Float32Array;
  private _moonStreak!: THREE.Mesh;
  petalMat!: THREE.PointsMaterial;
  sakuraMat!: THREE.MeshStandardMaterial;
  sakura!: THREE.Group;
  player!: THREE.Group;
  private _petalV!: Float32Array;
  petals!: THREE.Points;
  private _koi?: {
    g: THREE.Group;
    rx: number;
    rz: number;
    speed: number;
    phase: number;
  }[];

  constructor(container: HTMLElement, opts: Garden3DOptions) {
    this.THREE = THREE;
    this.opts = opts || {};
    this.zones = this.opts.zones || {};
    this.onNear = this.opts.onNear || function () {};
    this.mood = this.opts.mood || "midnight";
    this.paused = false;
    this.hidden = false;
    this._near = null;
    this._keys = {};
    this._dataSig = "";

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.16;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 420);

    // soft neutral environment reflections lift every PBR surface (water
    // especially) out of the flat-albedo look
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = envTex;
    this._texList = [envTex as THREE.Texture];
    this._texLoader = new THREE.TextureLoader();
    this._sky = {};
    this._groundTintMats = [];
    this._gravelTintMats = [];
    this._halos = [];
    this._pathPts = [];

    // bloom keeps lanterns / shoji / moonlight ethereal
    this._composer = new EffectComposer(this.renderer);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    this._bloom = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      0.42,
      0.65,
      0.8,
    );
    this._composer.addPass(this._bloom);
    this._composer.addPass(new OutputPass());

    this.px = 0;
    this.pz = 10;
    this.vx = 0;
    this.vz = 0;
    this.moving = false;
    this.zoom = 1;
    this._zoomT = 1;

    // shared materials — one unified palette
    this.M = {
      woodD: this.mat(0x2b2019, 0.85), // dark structural wood
      woodM: this.mat(0x54402e, 0.85), // mid wood
      woodL: this.mat(0x7a5f42, 0.8), // light wood / engawa
      roof: this.mat(0x39424c, 0.55, 0.18), // slate tile
      roofL: this.mat(0x46505a, 0.55, 0.18),
      plaster: this.mat(0xd8d2bf, 0.95),
      stone: this.mat(0x777c70, 0.95),
      stoneD: this.mat(0x4d5248, 0.95),
      vermilion: this.mat(0xa63b2a, 0.55),
      vermilionD: this.mat(0x7e2c1f, 0.55),
      leafD: this.mat(0x2c5540, 0.92),
      leafM: this.mat(0x3d7055, 0.92),
      leafL: this.mat(0x578a68, 0.92),
      pine: this.mat(0x24503c, 0.92),
      bark: this.mat(0x453425, 0.95),
      gravelPath: this.mat(0x9a9e8e, 1),
    };
    // alpha fade across the ribbon width so path edges dissolve into moss
    const pc = document.createElement("canvas");
    pc.width = 128;
    pc.height = 2;
    const pg = pc.getContext("2d")!;
    const pgrad = pg.createLinearGradient(0, 0, 128, 0);
    pgrad.addColorStop(0, "#000");
    pgrad.addColorStop(0.22, "#fff");
    pgrad.addColorStop(0.78, "#fff");
    pgrad.addColorStop(1, "#000");
    pg.fillStyle = pgrad;
    pg.fillRect(0, 0, 128, 2);
    const pathAlpha = new THREE.CanvasTexture(pc);
    pathAlpha.wrapS = THREE.ClampToEdgeWrapping;
    pathAlpha.wrapT = THREE.RepeatWrapping;
    this._texList.push(pathAlpha);
    this.pathMat = new THREE.MeshStandardMaterial({
      color: 0x9a9e8e,
      roughness: 1,
      side: THREE.DoubleSide,
      transparent: true,
      alphaMap: pathAlpha,
      depthWrite: false,
    });
    this._gravelTintMats.push(this.pathMat);

    this._buildLights();
    this._buildStatic();
    this.dynGroup = new THREE.Group();
    this.scene.add(this.dynGroup);
    this._buildPlayer();
    this._buildPetals();
    this.setMood(this.mood);
    this._loadArt();

    this._onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer!.setSize(w, h);
      this._composer.setSize(w, h);
    };
    this._onResize();
    window.addEventListener("resize", this._onResize);

    this._kd = (e) => {
      if (this.paused) return; // interiors own the keyboard while the world is paused
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        e.preventDefault();
      this._keys[e.key.toLowerCase()] = true;
      if (e.key === "-" || e.key === "_") this.zoomBy(1.15);
      if (e.key === "+" || e.key === "=") this.zoomBy(1 / 1.15);
    };
    this._ku = (e) => {
      this._keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", this._kd);
    window.addEventListener("keyup", this._ku);
    this._wheel = (e) => {
      if (this.paused) return;
      e.preventDefault();
      this._zoomT = Math.max(
        0.55,
        Math.min(2.6, this._zoomT * (e.deltaY > 0 ? 1.09 : 1 / 1.09)),
      );
    };
    window.addEventListener("wheel", this._wheel, { passive: false });

    this._clock = new THREE.Clock();
    this._lastTick = 0;
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this._lastTick = performance.now();
      this._tick(this._clock.getDelta(), this._clock.elapsedTime);
    };
    loop();
    // watchdog: the host runtime can cancel pending animation frames on
    // re-render; if no frame has run recently, re-arm the loop.
    this._watchdog = setInterval(() => {
      if (!this.renderer) return;
      if (performance.now() - this._lastTick > 250) {
        cancelAnimationFrame(this._raf);
        loop();
      }
    }, 300);
  }

  mat(color: THREE.ColorRepresentation, rough?: number, metal?: number) {
    return new this.THREE.MeshStandardMaterial({
      color,
      roughness: rough == null ? 0.9 : rough,
      metalness: metal || 0,
    });
  }

  private _texApply(
    url: string,
    rx: number,
    ry: number,
    apply: (t: THREE.Texture) => void,
  ) {
    const THREE = this.THREE;
    const t = this._texLoader.load(url, () => {
      if (!this.renderer) return; // disposed before the image decoded
      apply(t);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(rx, ry);
    t.anisotropy = this.renderer!.capabilities.getMaxAnisotropy();
    this._texList.push(t);
    return t;
  }

  /* ---- palette-locked texture: composites the painted image over a flat
     palette base at reduced opacity, so every surface shares one color
     family and reads as cohesive scenery instead of competing patterns ---- */
  private _softTex(
    url: string,
    base: number,
    alpha: number,
    rx: number,
    ry: number,
    apply: (t: THREE.Texture) => void,
  ) {
    new this.THREE.ImageLoader().load(url, (img) => {
      if (!this.renderer) return;
      const c = document.createElement("canvas");
      c.width = c.height = 1024;
      const g = c.getContext("2d")!;
      g.fillStyle = "#" + base.toString(16).padStart(6, "0");
      g.fillRect(0, 0, 1024, 1024);
      g.globalAlpha = alpha;
      g.drawImage(img, 0, 0, 1024, 1024);
      const t = new this.THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = this.THREE.RepeatWrapping;
      t.colorSpace = this.THREE.SRGBColorSpace;
      t.repeat.set(rx, ry);
      t.anisotropy = this.renderer!.capabilities.getMaxAnisotropy();
      this._texList.push(t);
      apply(t);
    });
  }

  /* ---- soft feathered disc of a flat color (boulder moss contact,
     ground transitions) ---- */
  featherDisc(r: number, g: number, b: number, solid = 0.5) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 64 * solid * 0.5, 64, 64, 63);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(solid, `rgba(${r},${g},${b},.92)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const t = new this.THREE.CanvasTexture(c);
    t.colorSpace = this.THREE.SRGBColorSpace;
    this._texList.push(t);
    return t;
  }

  /* ---- feathered moss band straddling a hard surface boundary so
     circles/ellipses dissolve into the ground instead of ending in a
     drawn line ---- */
  _featherBand(
    x: number,
    z: number,
    sx: number,
    sy: number,
    color: number,
    y: number,
    peak = 0.78,
    width = 0.18,
  ) {
    const THREE = this.THREE;
    const cr = (color >> 16) & 255,
      cg = (color >> 8) & 255,
      cb = color & 255;
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 255);
    grad.addColorStop(Math.max(0, peak - width), `rgba(${cr},${cg},${cb},0)`);
    grad.addColorStop(peak, `rgba(${cr},${cg},${cb},.9)`);
    grad.addColorStop(Math.min(1, peak + width), `rgba(${cr},${cg},${cb},0)`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._texList.push(t);
    const mat = new THREE.MeshStandardMaterial({
      map: t,
      transparent: true,
      depthWrite: false,
      roughness: 1,
    });
    mat.color.setHex(MOODS[this.mood].groundTint);
    this._groundTintMats.push(mat);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    m.rotation.x = -Math.PI / 2;
    m.scale.set(sx, sy, 1);
    m.position.set(x, y, z);
    this.scene.add(m);
    return m;
  }

  /* ---- soft-edged variation patch: a feathered disc of a painted texture
     laid over the base ground to break tiling repetition ---- */
  private _patchTex(
    url: string,
    base: number,
    alpha: number,
    cb: (t: THREE.CanvasTexture) => void,
  ) {
    new this.THREE.ImageLoader().load(url, (img) => {
      if (!this.renderer) return;
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const g = c.getContext("2d")!;
      g.fillStyle = "#" + base.toString(16).padStart(6, "0");
      g.fillRect(0, 0, 512, 512);
      g.globalAlpha = alpha;
      g.drawImage(img, 0, 0, 512, 512);
      g.globalAlpha = 1;
      const grad = g.createRadialGradient(256, 256, 140, 256, 256, 252);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.globalCompositeOperation = "destination-in";
      g.fillStyle = grad;
      g.fillRect(0, 0, 512, 512);
      const t = new this.THREE.CanvasTexture(c);
      t.colorSpace = this.THREE.SRGBColorSpace;
      this._texList.push(t);
      cb(t);
    });
  }

  private _addPatches(t: THREE.CanvasTexture, spots: number[][], y: number) {
    const THREE = this.THREE;
    const mat = new THREE.MeshStandardMaterial({
      map: t,
      transparent: true,
      depthWrite: false,
      roughness: 1,
    });
    mat.color.setHex(MOODS[this.mood].groundTint);
    this._groundTintMats.push(mat);
    spots.forEach(([x, z, s], i) => {
      const p = new THREE.Mesh(new THREE.CircleGeometry(1, 26), mat);
      p.rotation.x = -Math.PI / 2;
      p.rotation.z = x * 1.3 + z * 0.7;
      p.scale.set(s, s * (0.75 + 0.02 * i), 1);
      p.position.set(x, y + i * 0.0015, z);
      p.receiveShadow = true;
      this.scene.add(p);
    });
  }

  /* ---- generated art (public/garden) progressively replaces the flat /
     procedural surfaces; until each image decodes — or if one is missing —
     the original look renders unchanged ---- */
  _loadArt() {
    this._softTex("/garden/textures/moss-painterly.webp", 0x2f5546, 0.55, 18, 18, (t) => {
      // mirror-wrap hides the tile seam on the huge ground plane
      t.wrapS = t.wrapT = this.THREE.MirroredRepeatWrapping;
      this.groundTex.dispose();
      this.groundMat.map = t;
      this.groundMat.needsUpdate = true;
      const mound = t.clone();
      mound.repeat.set(6, 6);
      mound.needsUpdate = true;
      this._texList.push(mound);
      if (this.mossMat.map) this.mossMat.map.dispose();
      this.mossMat.map = mound;
      this.mossMat.needsUpdate = true;
      // a rotated large-scale copy blended over the base decorrelates the
      // tiling so the far field stops reading as a repeated motif
      const breaker = t.clone();
      breaker.repeat.set(3.3, 3.3);
      breaker.center.set(0.5, 0.5);
      breaker.rotation = Math.PI / 2;
      breaker.needsUpdate = true;
      this._texList.push(breaker);
      const overlayMat = new THREE.MeshStandardMaterial({
        map: breaker,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        roughness: 1,
      });
      overlayMat.color.setHex(MOODS[this.mood].groundTint);
      this._groundTintMats.push(overlayMat);
      const overlay = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        overlayMat,
      );
      overlay.rotation.x = -Math.PI / 2;
      overlay.position.y = 0.012;
      overlay.receiveShadow = true;
      this.scene.add(overlay);
    });
    // clover/wildflower and fallen-petal patches break the tiling and give
    // the grounds hand-dressed variety (petals gather under the sakura)
    this._patchTex("/garden/textures/moss-flowers.webp", 0x2c5244, 0.55, (t) => {
      this._addPatches(
        t,
        [
          [-12, -27, 7.5],
          [10, -19, 5.5],
          [-18, 3, 6],
          [8, 20, 6.5],
          [18, 30, 7],
          [34, -30, 7.5],
          [-36, 16, 5.5],
          [-30, -2, 6.5],
        ],
        0.02,
      );
    });
    this._patchTex("/garden/textures/moss-petals.webp", 0x2c5244, 0.6, (t) => {
      this._addPatches(
        t,
        [
          [-4, -16, 5.5],
          [4.5, -10.5, 4.5],
          [0.5, -18.5, 3.8],
        ],
        0.026,
      );
    });
    // rebuild the authored karesansui with painted gravel grain under the
    // furrows once the image is available
    new this.THREE.ImageLoader().load(
      "/garden/textures/gravel-fine.webp",
      (img) => {
        if (!this.renderer) return;
        const old = this.gravelMat.map;
        this.gravelMat.map = this._karesansuiTex(img);
        this.gravelMat.needsUpdate = true;
        if (old) old.dispose();
      },
    );
    this._softTex("/garden/textures/stone-paving.webp", 0x71776a, 0.5, 1, 1, (t) => {
      this.pathMat.map = t;
      this.pathMat.needsUpdate = true;
    });
    this._softTex("/garden/textures/gravel-fine.webp", 0xa39f8b, 0.42, 9, 6, (t) => {
      this.shoreMat.map = t;
      this.shoreMat.needsUpdate = true;
    });
    this._softTex("/garden/textures/plaster-wall.webp", 0xe6e0cf, 0.5, 1, 1, (t) => {
      this.M.plaster.map = t;
      this.M.plaster.color.setHex(0xfaf5e8);
      this.M.plaster.needsUpdate = true;
    });
    this._softTex("/garden/textures/bark.webp", 0x463527, 0.45, 2, 1, (t) => {
      this.M.bark.map = t;
      this.M.bark.color.setHex(0xcabcaa);
      this.M.bark.needsUpdate = true;
    });
    // the rock texture generates as masonry blocks; sample the interior of
    // one large block per material so boulders read as continuous stone
    this._softTex("/garden/textures/stone-rock.webp", 0x878d80, 0.5, 0.3, 0.2, (t) => {
      t.offset.set(0.06, 0.32);
      this.M.stone.map = t;
      this.M.stone.color.setHex(0xd0d4c8);
      this.M.stone.needsUpdate = true;
      const t2 = t.clone();
      t2.offset.set(0.55, 0.15);
      t2.needsUpdate = true;
      this._texList.push(t2);
      this.M.stoneD.map = t2;
      this.M.stoneD.color.setHex(0x9aa094);
      this.M.stoneD.needsUpdate = true;
    });
    // painted moss doubles as painterly foliage for every leaf pad
    this._softTex("/garden/textures/moss-painterly.webp", 0x35604d, 0.32, 1.5, 1.5, (t) => {
      (
        [
          [this.M.leafD, 0xaebfb2],
          [this.M.leafM, 0xc9dbca],
          [this.M.leafL, 0xe6f2e2],
          [this.M.pine, 0xbccfbe],
        ] as [THREE.MeshStandardMaterial, number][]
      ).forEach(([m, tint]) => {
        m.map = t;
        m.color.setHex(tint);
        m.needsUpdate = true;
      });
    });
    // soft painterly clusters on the sakura canopy
    this._softTex("/garden/textures/moss-painterly.webp", 0xc793aa, 0.22, 1.5, 1.5, (t) => {
      this.sakuraMat.map = t;
      this.sakuraMat.color.setHex(0xf7dee8);
      this.sakuraMat.needsUpdate = true;
    });
    this._texApply("/garden/textures/water-pond.webp", 2.2, 1.6, (t) => {
      this.waterMat.map = t;
      // high metalness blacks out the albedo map without an env map, so
      // shift toward a dielectric painted surface once the texture drives
      // it; envMapIntensity stays low or the room-env light panels reflect
      // as rectangles on the surface
      this.waterMat.metalness = 0.15;
      this.waterMat.roughness = 0.42;
      this.waterMat.envMapIntensity = 0.25;
      this.waterMat.needsUpdate = true;
      this.setMood(this.mood); // switch to the textured water tint
    });
    // note: roof-tiles.webp is intentionally NOT applied — the stacked
    // 4-sided frustum roofs shear any wrapped texture into noise; the flat
    // charcoal silhouette reads better (texture kept for future use)
    this._softTex("/garden/textures/wood-planks.webp", 0x54402e, 0.5, 2, 2, (t) => {
      this.M.woodL.map = t;
      this.M.woodL.color.setHex(0xe6d8c4);
      this.M.woodL.needsUpdate = true;
      this.M.woodM.map = t;
      this.M.woodM.color.setHex(0xc4b29e);
      this.M.woodM.needsUpdate = true;
    });
    // painted mood skies replace the flat clear color; the polygon moon and
    // star points hide because both are painted into the panoramas
    (["midnight", "dawn"] as const).forEach((m) => {
      this._texApply(`/garden/sky/${m}.webp`, 1, 1, (t) => {
        t.wrapS = t.wrapT = this.THREE.ClampToEdgeWrapping;
        this._sky[m] = t;
        this.setMood(this.mood);
      });
    });
  }

  shadowed(g: THREE.Object3D) {
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return g;
  }

  /* ---- deterministic vertex jitter: turns perfect spheres into
     hand-sculpted foliage pads, boulders, and mounds ---- */
  organic(geo: THREE.BufferGeometry, amp: number, freq = 1.6) {
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const n =
        Math.sin(x * freq * 2.1 + y * 1.7) *
          Math.cos(y * freq * 1.9 + z * 2.3) +
        Math.sin(z * freq * 2.7 + x * 1.3) * 0.5;
      const d = 1 + amp * n * 0.55;
      p.setXYZ(i, x * d, y * d, z * d);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  /* ---- painterly grass tuft sprite drawn at runtime: curved tapered
     blades, dark base to light tip, palette-locked by construction ---- */
  grassTuftTex() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.lineCap = "round";
    const darks = ["#3d6b54", "#417257", "#38614c"];
    const lights = ["#a8d0ac", "#b5dcb4", "#93bf9a"];
    for (let i = 0; i < 13; i++) {
      const bx = 14 + (i / 12) * 100 + (Math.random() - 0.5) * 10;
      const lean = (Math.random() - 0.5) * 54;
      const h = 50 + Math.random() * 58;
      const grad = g.createLinearGradient(0, 128, 0, 128 - h);
      grad.addColorStop(0, darks[i % 3]);
      grad.addColorStop(1, lights[i % 3]);
      g.strokeStyle = grad;
      g.lineWidth = 7 - (i % 3) * 1.5;
      g.beginPath();
      g.moveTo(bx, 130);
      g.quadraticCurveTo(bx + lean * 0.3, 128 - h * 0.6, bx + lean, 128 - h);
      g.stroke();
    }
    const t = new this.THREE.CanvasTexture(c);
    t.colorSpace = this.THREE.SRGBColorSpace;
    this._texList.push(t);
    return t;
  }

  /* ---- macro light painting: big soft pools of warm light and teal shade
     blended over the whole ground, the way a background painter blocks in
     value variation before detailing ---- */
  _macroShade() {
    const THREE = this.THREE;
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const g = c.getContext("2d")!;
    const blobs: [number, number, number, number, number, number, number][] = [
      [200, 260, 300, 150, 190, 150, 0.15],
      [760, 180, 260, 20, 52, 40, 0.22],
      [850, 700, 320, 150, 185, 145, 0.13],
      [330, 800, 300, 18, 48, 38, 0.2],
      [560, 460, 380, 140, 180, 150, 0.1],
      [90, 620, 240, 16, 44, 34, 0.18],
      [960, 420, 220, 150, 190, 155, 0.12],
      [520, 90, 260, 18, 50, 40, 0.16],
      [680, 900, 240, 145, 185, 150, 0.12],
    ];
    blobs.forEach(([x, y, r, cr, cg, cb, a]) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._texList.push(t);
    const mat = new THREE.MeshStandardMaterial({
      map: t,
      transparent: true,
      depthWrite: false,
      roughness: 1,
    });
    mat.color.setHex(MOODS[this.mood].groundTint);
    this._groundTintMats.push(mat);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.008;
    this.scene.add(m);
  }

  /* ---- instanced grass: thousands of tuft billboards scattered over the
     moss, avoiding plaza / pond / paths / buildings ---- */
  _buildGrass() {
    const THREE = this.THREE;
    const geo = new THREE.PlaneGeometry(1.15, 0.85);
    geo.translate(0, 0.4, 0);
    const mat = new THREE.MeshStandardMaterial({
      map: this.grassTuftTex(),
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      roughness: 1,
    });
    this._groundTintMats.push(mat);
    const N = 1800;
    const mesh = new THREE.InstancedMesh(geo, mat, N);
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    let placed = 0,
      guard = 0;
    while (placed < N && guard++ < N * 40) {
      const x = (Math.random() - 0.5) * 90;
      const z = -45 + Math.random() * 84;
      if (this.blocked(x, z)) continue;
      if (Math.hypot(x, z) < 14.4) continue; // plaza
      const pdx = (x - 24) / 24.6,
        pdz = (z + 6) / 17.6;
      if (pdx * pdx + pdz * pdz < 1) continue; // pond incl. shore
      if (Math.abs(Math.abs(x) - 44) < 1.6) continue; // side walls
      if (Math.abs(z + 38) < 1.6 || Math.abs(z - 42) < 1.6) continue;
      let nearPath = false;
      for (let i = 0; i < this._pathPts.length; i += 2) {
        if (
          Math.hypot(x - this._pathPts[i], z - this._pathPts[i + 1]) < 2.7
        ) {
          nearPath = true;
          break;
        }
      }
      if (nearPath) continue;
      dummy.position.set(x, 0, z);
      dummy.rotation.y = Math.random() * Math.PI;
      const s = 0.85 + Math.random() * 0.95;
      dummy.scale.set(s, s * (0.75 + Math.random() * 0.5), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(placed, dummy.matrix);
      col.setHSL(
        0.36 + Math.random() * 0.05,
        0.22 + Math.random() * 0.12,
        0.62 + Math.random() * 0.28,
      );
      mesh.setColorAt(placed, col);
      placed++;
    }
    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    this.scene.add(mesh);
  }

  /* ---- authored karesansui: the plaza is one hand-drawn canvas following
     real dry-garden raking conventions — straight samon furrows (calm
     water) across the field, sazanami ripple rings around each rock island,
     border-following furrows at the enclosure edge ---- */
  _karesansuiTex(grain?: HTMLImageElement) {
    const THREE = this.THREE;
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const g = c.getContext("2d")!;
    const BASE = "#ddd4bc";
    g.fillStyle = BASE;
    g.fillRect(0, 0, 1024, 1024);
    if (grain) {
      g.globalAlpha = 0.3;
      g.drawImage(grain, 0, 0, 1024, 1024);
      g.globalAlpha = 1;
    }
    const groove = (draw: () => void) => {
      // every furrow is a dark cut with a light crest above — reads as relief
      g.strokeStyle = "rgba(118,110,86,.5)";
      g.lineWidth = 2.6;
      draw();
      g.translate(0, -2.2);
      g.strokeStyle = "rgba(255,250,232,.42)";
      g.lineWidth = 1.3;
      draw();
      g.setTransform(1, 0, 0, 1, 0, 0);
    };
    // 1. straight samon furrows across the whole field (calm water)
    for (let y = 8; y < 1024; y += 16) {
      const phase = y * 0.45;
      groove(() => {
        g.beginPath();
        for (let x = 0; x <= 1024; x += 16) {
          const yy = y + Math.sin(x * 0.013 + phase) * 1.1;
          if (x === 0) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.stroke();
      });
    }
    // 2. border-following furrows just inside the enclosure edge
    g.fillStyle = BASE;
    g.beginPath();
    g.arc(512, 512, 512, 0, 7);
    g.arc(512, 512, 462, 0, 7, true);
    g.fill();
    [468, 482, 496].forEach((r) => {
      groove(() => {
        g.beginPath();
        g.arc(512, 512, r, 0, Math.PI * 2);
        g.stroke();
      });
    });
    // 3. rock islands: erase the field, then ripple rings lapping outward
    //    (canvas px = (world+13)/26*1024; groups match the stone clusters)
    const islands: [number, number, number][] = [
      [323, 406, 128], // main triad
      [719, 616, 100], // flat pair
      [486, 807, 84], // south pair
    ];
    islands.forEach(([cx, cy, r0]) => {
      g.fillStyle = BASE;
      g.beginPath();
      g.arc(cx, cy, r0 + 62, 0, 7);
      g.fill();
      for (let r = r0 - 20; r <= r0 + 58; r += 15) {
        groove(() => {
          g.beginPath();
          g.arc(cx, cy, r, 0, Math.PI * 2);
          g.stroke();
        });
      }
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.anisotropy = this.renderer!.capabilities.getMaxAnisotropy();
    this._texList.push(t);
    return t;
  }

  /* ---- soft radial glow sprite drawn at runtime (petals, fireflies,
     lantern halos, moon streak) ---- */
  glowTex(r: number, g: number, b: number) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.55, `rgba(${r},${g},${b},.45)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const t = new this.THREE.CanvasTexture(c);
    t.colorSpace = this.THREE.SRGBColorSpace;
    this._texList.push(t);
    return t;
  }

  /* ---- curved Japanese hip roof: stacked 4-side frustums = concave silhouette ---- */
  curvedRoof(w: number, d: number, hgt: number, mat: THREE.Material) {
    const THREE = this.THREE;
    const g = new THREE.Group();
    const layers = [
      [1.1, 0.8, 0.26],
      [0.8, 0.48, 0.34],
      [0.48, 0.05, 0.4],
    ];
    let y = 0;
    layers.forEach(([rb, rt, hf]) => {
      const h = hgt * hf;
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(rt, rb, h, 4, 1),
        mat,
      );
      m.rotation.y = Math.PI / 4;
      m.scale.set(w * 0.72, 1, d * 0.72);
      m.position.y = y + h / 2;
      y += h;
      g.add(m);
    });
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(
        Math.max(w, d) * 0.3,
        hgt * 0.14,
        Math.min(w, d) * 0.09,
      ),
      mat,
    );
    if (d > w) ridge.rotation.y = Math.PI / 2;
    ridge.position.y = hgt * 1.0;
    g.add(ridge);
    // onigawara tips
    [-1, 1].forEach((s) => {
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(hgt * 0.09, 10, 8),
        mat,
      );
      if (d > w) tip.position.set(0, hgt * 1.0, s * d * 0.15);
      else tip.position.set(s * w * 0.15, hgt * 1.0, 0);
      g.add(tip);
    });
    return g;
  }

  /* ---- matsu pine: leaning trunk, layered cloud pads ---- */
  pine(x: number, z: number, s: number, lean: number) {
    const THREE = this.THREE;
    const g = new THREE.Group();
    const t1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 * s, 0.26 * s, 2.4 * s, 8),
      this.M.bark,
    );
    t1.position.y = 1.2 * s;
    t1.rotation.z = lean;
    const t2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1 * s, 0.16 * s, 1.6 * s, 8),
      this.M.bark,
    );
    t2.position.set(Math.sin(lean) * -2.4 * s, 2.7 * s, 0);
    t2.rotation.z = lean * 1.8;
    g.add(t1, t2);
    const pads = [
      [0, 3.4, 0, 1.5],
      [-1.1, 2.7, 0.5, 1.0],
      [0.9, 2.9, -0.4, 0.9],
      [-0.3, 4.0, 0.2, 0.85],
    ];
    pads.forEach(([px, py, pz, ps]) => {
      const pad = new THREE.Mesh(
        this.organic(new THREE.SphereGeometry(ps * s, 20, 15), 0.22),
        this.M.pine,
      );
      pad.position.set(px * s + Math.sin(lean) * -2 * s, py * s, pz * s);
      pad.scale.y = 0.38;
      g.add(pad);
    });
    g.position.set(x, 0, z);
    this.shadowed(g);
    this.scene.add(g);
  }

  /* ---- smooth stone-paved path ribbon along a curve, gently varying
     width, replacing the old stacked-disc look ---- */
  pathRibbon(points: number[][], width: number) {
    const THREE = this.THREE;
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], 0, p[1])),
    );
    const len = curve.getLength();
    const seg = Math.max(10, Math.ceil(len * 2));
    const pos: number[] = [],
      uv: number[] = [],
      idx: number[] = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const pt = curve.getPoint(t);
      if (i % 2 === 0) this._pathPts.push(pt.x, pt.z);
      const tg = curve.getTangent(t);
      const nx = -tg.z,
        nz = tg.x;
      const w = width * (1 + 0.16 * Math.sin(t * len * 0.85 + points[0][0]));
      pos.push(pt.x - nx * w, 0.05, pt.z - nz * w);
      pos.push(pt.x + nx * w, 0.05, pt.z + nz * w);
      const v = (t * len) / (width * 2);
      uv.push(0, v, 1, v);
    }
    for (let i = 0; i < seg; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, this.pathMat);
    m.receiveShadow = true;
    this.scene.add(m);
  }

  /* ---- estate wall segment with tile cap ---- */
  wallSeg(x1: number, z1: number, x2: number, z2: number) {
    const THREE = this.THREE;
    const dx = x2 - x1,
      dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const ang = Math.atan2(dx, dz);
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 2.3, len),
      this.M.plaster,
    );
    body.position.y = 1.15;
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.5, len),
      this.M.stoneD,
    );
    base.position.y = 0.25;
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, len, 3, 1),
      this.M.roof,
    );
    cap.rotation.x = Math.PI / 2;
    cap.rotation.y = Math.PI / 2;
    cap.scale.set(1, 1, 0.55);
    cap.position.y = 2.55;
    g.add(body, base, cap);
    // posts
    const nPosts = Math.floor(len / 9);
    for (let i = 1; i <= nPosts; i++) {
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 2.4, 0.5),
        this.M.woodD,
      );
      p.position.set(0, 1.2, -len / 2 + (len / (nPosts + 1)) * i);
      g.add(p);
    }
    g.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
    g.rotation.y = ang;
    this.shadowed(g);
    this.scene.add(g);
  }

  _buildLights() {
    const THREE = this.THREE;
    this.ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambient);
    this.hemi = new THREE.HemisphereLight(0xbfd8c8, 0x18241c, 0.62);
    this.scene.add(this.hemi);
    this.dir = new THREE.DirectionalLight(0xffffff, 0.8);
    this.dir.position.set(-38, 55, -26);
    this.dir.castShadow = true;
    // half-strength shadows: shading, not black holes
    this.dir.shadow.intensity = 0.55;
    this.dir.shadow.radius = 6;
    this.dir.shadow.mapSize.set(2048, 2048);
    this.dir.shadow.camera.left = -65;
    this.dir.shadow.camera.right = 65;
    this.dir.shadow.camera.top = 65;
    this.dir.shadow.camera.bottom = -65;
    this.dir.shadow.camera.far = 170;
    this.dir.shadow.bias = -0.0004;
    this.scene.add(this.dir);
    this.lanternLights = [];
    this.shojiMats = [];
  }

  _addLanternLight(x: number, y: number, z: number, dist?: number) {
    const THREE = this.THREE;
    const l = new THREE.PointLight(0xffc873, 1.4, dist || 16, 2);
    l.position.set(x, y, z);
    l.userData.base = 1.4;
    this.scene.add(l);
    this.lanternLights.push(l);
    // soft additive halo so the flame reads as a glow, not a bare bulb
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTex(255, 200, 115),
        color: 0xffc873,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    halo.position.set(x, y, z);
    halo.scale.set(3.6, 3.6, 1);
    this.scene.add(halo);
    this._halos.push(halo);
    return l;
  }

  _stoneLantern(x: number, z: number, s?: number) {
    const THREE = this.THREE;
    s = s || 1;
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * s, 0.72 * s, 0.4 * s, 12),
      this.M.stone,
    );
    base.position.y = 0.2 * s;
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2 * s, 0.25 * s, 1.35 * s, 10),
      this.M.stone,
    );
    post.position.y = 1.05 * s;
    const shelf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * s, 0.42 * s, 0.18 * s, 12),
      this.M.stone,
    );
    shelf.position.y = 1.8 * s;
    const lm = new THREE.MeshStandardMaterial({
      color: 0xffd9a3,
      emissive: 0xffc873,
      emissiveIntensity: 1.6,
    });
    this.shojiMats.push(lm);
    const box = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4 * s, 0.4 * s, 0.62 * s, 6),
      lm,
    );
    box.position.y = 2.2 * s;
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * s, 0.85 * s, 0.5 * s, 6),
      this.M.stone,
    );
    roof.position.y = 2.75 * s;
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.13 * s, 8, 6),
      this.M.stone,
    );
    tip.position.y = 3.1 * s;
    g.add(base, post, shelf, box, roof, tip);
    g.position.set(x, 0, z);
    this.shadowed(g);
    this.scene.add(g);
    this._addLanternLight(x, 2.2 * s, z, 14);
  }

  _buildStatic() {
    const THREE = this.THREE;
    const S = this.scene;

    // ground
    this.groundTex = noiseTexture(THREE, 0x16281c, 0x1f3a29, 130, 0.5);
    this.groundTex.repeat.set(6, 6);
    this.groundMat = new THREE.MeshStandardMaterial({
      map: this.groundTex,
      roughness: 1,
    });
    this._groundTintMats.push(this.groundMat);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      this.groundMat,
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    S.add(ground);

    // ===== estate walls (enclosing rectangle, opening at north gate) =====
    const W = 44,
      N = -38,
      So = 42,
      E = 44;
    this.wallSeg(-W, N, -4.5, N); // north-left
    this.wallSeg(4.5, N, E, N); // north-right
    this.wallSeg(-W, So, E, So); // south
    this.wallSeg(-W, N, -W, So); // west
    this.wallSeg(E, N, E, So); // east

    // ===== entrance gate (yakuimon) at north opening =====
    const gate = new THREE.Group();
    [-3.2, 3.2].forEach((x) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.5, 4.6, 12),
        this.M.woodD,
      );
      post.position.set(x, 2.3, 0);
      gate.add(post);
    });
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.55, 1.1),
      this.M.woodM,
    );
    beam.position.y = 4.4;
    gate.add(beam);
    const gRoof = this.curvedRoof(11, 4.6, 2.1, this.M.roof);
    gRoof.position.y = 4.7;
    gate.add(gRoof);
    gate.position.set(0, 0, -38);
    this.shadowed(gate);
    S.add(gate);
    this._addLanternLight(0, 3.6, -37, 15);

    // torii just outside the gate
    const torii = new THREE.Group();
    [-3.4, 3.4].forEach((x) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.44, 6.6, 12),
        this.M.vermilion,
      );
      post.position.set(x, 3.3, 0);
      torii.add(post);
    });
    const kasagi = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 10.4, 10),
      this.M.vermilionD,
    );
    kasagi.rotation.z = Math.PI / 2;
    kasagi.position.y = 6.7;
    const kasagi2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 11.2, 10),
      this.M.vermilion,
    );
    kasagi2.rotation.z = Math.PI / 2;
    kasagi2.position.y = 7.15;
    const nuki = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.4, 0.5),
      this.M.vermilion,
    );
    nuki.position.y = 5.4;
    torii.add(kasagi, kasagi2, nuki);
    torii.position.set(0, 0, -45);
    this.shadowed(torii);
    S.add(torii);

    // ===== raked gravel courtyard (karesansui) =====
    this.gravelTex = noiseTexture(THREE, 0x8a8f7f, 0x767b6b, 80, 0.3);
    this.gravelTex.repeat.set(3, 3);
    this.gravelMat = new THREE.MeshStandardMaterial({
      map: this._karesansuiTex(),
      roughness: 1,
    });
    this.gravelTex.dispose();
    this._gravelTintMats.push(this.gravelMat);
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(13, 64),
      this.gravelMat,
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.receiveShadow = true;
    S.add(plaza);
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(13, 13.6, 64),
      this.M.stoneD,
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.03;
    S.add(rim);
    // moss dissolves over the plaza rim instead of ending in a drawn circle
    this._featherBand(0, 0, 35, 35, 0x3a634f, 0.055);
    // soft moss contact disc shared by every boulder (feathered, replaces
    // the old hard-edged dark circles)
    const mossContact = new THREE.MeshStandardMaterial({
      map: this.featherDisc(74, 112, 92, 0.35),
      transparent: true,
      depthWrite: false,
      roughness: 1,
    });
    this._groundTintMats.push(mossContact);
    // courtyard stones — asymmetric odd-count island groups in the
    // karesansui manner: a standing stone with flat companions, each group
    // skirted in moss, ripple rings drawn around them in the sand
    const boulder = (
      x: number,
      z: number,
      s: number,
      m: THREE.Material,
      sy = 0.62,
    ) => {
      const geo = this.organic(new THREE.SphereGeometry(s, 18, 14), 0.24, 1.1);
      const r = new THREE.Mesh(geo, m);
      r.position.set(x, s * sy * 0.72, z);
      r.scale.set(1, sy, 0.84);
      r.rotation.y = x * 2.1;
      r.castShadow = r.receiveShadow = true;
      S.add(r);
      const mossRing = new THREE.Mesh(
        new THREE.CircleGeometry(s * 1.45, 20),
        mossContact,
      );
      mossRing.rotation.x = -Math.PI / 2;
      mossRing.position.set(x, 0.04, z);
      S.add(mossRing);
    };
    // main triad — tall standing stone flanked by a flat and a small stone
    boulder(-5.0, -3.6, 1.15, this.M.stone, 1.9);
    boulder(-3.5, -2.5, 0.95, this.M.stoneD, 0.55);
    boulder(-5.9, -2.0, 0.55, this.M.stone, 0.6);
    // flat pair
    boulder(5.8, 2.1, 1.05, this.M.stone, 0.5);
    boulder(4.7, 3.2, 0.6, this.M.stoneD, 0.7);
    // south pair
    boulder(-1.2, 7.2, 0.8, this.M.stone, 0.6);
    boulder(-0.1, 7.8, 0.45, this.M.stoneD, 0.65);

    // ===== continuous gravel paths =====
    this.pathRibbon(
      [
        [0, -36],
        [0, -24],
        [0, -14],
      ],
      1.9,
    ); // gate → plaza
    this.pathRibbon(
      [
        [-9, -9],
        [-16, -13],
        [-22, -17],
      ],
      1.6,
    ); // plaza → grove
    this.pathRibbon(
      [
        [12, -3],
        [18, -8],
        [24, -13],
        [24, -20],
      ],
      1.6,
    ); // plaza → bridge north
    this.pathRibbon(
      [
        [24, 9],
        [24, 14],
        [22, 19],
      ],
      1.6,
    ); // bridge south → house
    this.pathRibbon(
      [
        [-10, 8],
        [-17, 13],
        [-24, 16.5],
      ],
      1.6,
    ); // plaza → kura
    this.pathRibbon(
      [
        [6, 12],
        [2, 22],
        [-4, 30],
      ],
      1.5,
    ); // plaza → pavilion

    // ===== moss grove (soft mounded bed, no hard cylinder) =====
    const mossTex = noiseTexture(THREE, 0x21402d, 0x2c5540, 90, 0.5);
    this.mossMat = new THREE.MeshStandardMaterial({
      map: mossTex,
      roughness: 1,
    });
    this._groundTintMats.push(this.mossMat);
    const mound = new THREE.Mesh(
      this.organic(new THREE.SphereGeometry(13, 36, 26), 0.06, 0.35),
      this.mossMat,
    );
    mound.position.set(-28, -11.9, -20);
    mound.scale.y = 1;
    mound.receiveShadow = true;
    S.add(mound);
    // ground moss laps up against the mound base
    this._featherBand(-28, -20, 33, 33, 0x3a634f, 0.06, 0.72, 0.24);
    // edging stones around grove
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const st = new THREE.Mesh(
        this.organic(
          new THREE.SphereGeometry(0.5 + Math.random() * 0.4, 14, 10),
          0.28,
          2.2,
        ),
        i % 3 ? this.M.stone : this.M.stoneD,
      );
      st.position.set(-28 + Math.cos(a) * 12.6, 0.22, -20 + Math.sin(a) * 12.6);
      st.scale.y = 0.55;
      st.castShadow = true;
      S.add(st);
    }

    // ===== pond with sand shore + smooth rocks + bridge =====
    // sand shore
    this.shoreMat = this.mat(0x8a8f7f, 1);
    this._gravelTintMats.push(this.shoreMat);
    const shore = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      this.shoreMat,
    );
    shore.rotation.x = -Math.PI / 2;
    shore.scale.set(23.4, 16.4, 1);
    shore.position.set(24, 0.015, -6);
    shore.receiveShadow = true;
    S.add(shore);
    // feathered moss transition around the sand shore
    this._featherBand(24, -6, 61, 43, 0x3a634f, 0.045);
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x143028,
      roughness: 0.12,
      metalness: 0.6,
      transparent: true,
      opacity: 0.94,
    });
    const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 64), this.waterMat);
    pond.rotation.x = -Math.PI / 2;
    pond.scale.set(21, 14, 1);
    pond.position.set(24, 0.06, -6);
    S.add(pond);
    // soft moon pool on the water (midnight only) — a gentle oval of light
    // rather than a streak, so it reads as reflection, not a smudge
    this._moonStreak = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: this.glowTex(240, 248, 240),
        color: 0xe8f4e8,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this._moonStreak.rotation.x = -Math.PI / 2;
    this._moonStreak.scale.set(9, 6, 1);
    this._moonStreak.position.set(17, 0.085, -10);
    S.add(this._moonStreak);
    // smooth shore rocks, partially sunk, varied
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2 + Math.random() * 0.1;
      const s = 0.55 + Math.random() * 1.05;
      const r = new THREE.Mesh(
        this.organic(new THREE.SphereGeometry(s, 16, 12), 0.26, 1.4),
        i % 3 ? this.M.stone : this.M.stoneD,
      );
      r.position.set(
        24 + Math.cos(a) * (21.3 + Math.random() * 1.2),
        s * 0.28,
        -6 + Math.sin(a) * (14.3 + Math.random() * 1.2),
      );
      r.scale.set(1, 0.55 + Math.random() * 0.2, 0.75 + Math.random() * 0.3);
      r.rotation.y = i * 1.7;
      r.castShadow = r.receiveShadow = true;
      S.add(r);
    }
    // lily pads
    [
      [18, -12, 1.1],
      [30, -2, 1.4],
      [21, 2, 0.9],
      [28, -11, 0.8],
    ].forEach(([x, z, s]) => {
      const p = new THREE.Mesh(
        new THREE.CircleGeometry(s, 22, 0.4, 5.6),
        this.M.leafD,
      );
      p.rotation.x = -Math.PI / 2;
      p.position.set(x, 0.1, z);
      S.add(p);
    });
    // vermilion arched bridge
    const bridgeG = new THREE.Group();
    const N2 = 15;
    for (let i = 0; i < N2; i++) {
      const t = i / (N2 - 1);
      const z = -21 + t * 30;
      const y = 0.45 + Math.sin(t * Math.PI) * 2.0;
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.2, 2.2),
        this.M.vermilionD,
      );
      plank.position.set(24, y, z);
      plank.rotation.x = Math.atan(
        ((Math.cos(t * Math.PI) * Math.PI * 2.0) / 30) * 2.4,
      );
      bridgeG.add(plank);
    }
    [-1.95, 1.95].forEach((px) => {
      const pts = [];
      for (let i = 0; i <= 28; i++) {
        const t = i / 28;
        pts.push(
          new THREE.Vector3(
            24 + px,
            1.6 + Math.sin(t * Math.PI) * 2.0,
            -21 + t * 30,
          ),
        );
      }
      const rail = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.1, 10),
        this.M.vermilion,
      );
      bridgeG.add(rail);
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const z = -21 + t * 30;
        const y = 0.45 + Math.sin(t * Math.PI) * 2.0;
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.13, 1.2, 10),
          this.M.vermilion,
        );
        post.position.set(24 + px, y + 0.72, z);
        bridgeG.add(post);
        const knob = new THREE.Mesh(
          new THREE.SphereGeometry(0.17, 10, 8),
          this.M.vermilionD,
        );
        knob.position.set(24 + px, y + 1.4, z);
        bridgeG.add(knob);
      }
    });
    this.shadowed(bridgeG);
    S.add(bridgeG);

    // ===== sakura tree (courtyard north) =====
    const sakura = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.55, 4.2, 12),
      this.M.bark,
    );
    trunk.position.y = 2.1;
    trunk.rotation.z = 0.09;
    sakura.add(trunk);
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.2, 2.4, 8),
      this.M.bark,
    );
    branch.position.set(1.1, 4.0, 0.2);
    branch.rotation.z = -0.9;
    sakura.add(branch);
    this.sakuraMat = new THREE.MeshStandardMaterial({
      color: 0xdcaac6,
      roughness: 0.85,
      emissive: 0xdcaac6,
      emissiveIntensity: 0.05,
    });
    [
      [0, 5.6, 0, 2.7],
      [-1.9, 4.8, 0.5, 1.7],
      [1.9, 5.0, -0.4, 1.7],
      [0.4, 4.5, 1.5, 1.3],
      [2.4, 4.4, 0.4, 1.1],
    ].forEach(([x, y, z, s]) => {
      const c = new THREE.Mesh(
        this.organic(new THREE.SphereGeometry(s, 22, 16), 0.2, 1.2),
        this.sakuraMat,
      );
      c.position.set(x, y, z);
      c.scale.y = 0.72;
      sakura.add(c);
    });
    sakura.position.set(0, 0, -13);
    this.shadowed(sakura);
    S.add(sakura);
    this.sakura = sakura;

    // ===== matsu pines placed around the estate =====
    this.pine(-38, -30, 1.3, 0.14);
    this.pine(38, -26, 1.1, -0.12);
    this.pine(-38, 8, 1.0, 0.1);
    this.pine(38, 6, 1.25, -0.16);
    this.pine(10, 36, 1.05, 0.12);
    this.pine(-14, -34, 0.9, -0.1);

    // ===== stone lanterns =====
    this._stoneLantern(-13.5, -3, 1);
    this._stoneLantern(13.5, 9, 1);
    this._stoneLantern(9, -24, 0.85);
    this._stoneLantern(-24, 8, 0.85);

    // ===== tea pavilion (azumaya, open structure) =====
    const pav = new THREE.Group();
    const pavBase = new THREE.Mesh(
      new THREE.CylinderGeometry(3.4, 3.6, 0.5, 8),
      this.M.stoneD,
    );
    pavBase.position.y = 0.25;
    pav.add(pavBase);
    const deck = new THREE.Mesh(
      new THREE.CylinderGeometry(3.1, 3.1, 0.22, 8),
      this.M.woodL,
    );
    deck.position.y = 0.6;
    pav.add(deck);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 2.9, 10),
        this.M.woodM,
      );
      post.position.set(Math.cos(a) * 2.4, 2.05, Math.sin(a) * 2.4);
      pav.add(post);
    }
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.16, 0.7),
      this.M.woodL,
    );
    bench.position.set(0, 1.05, 0);
    pav.add(bench);
    const pavRoof = this.curvedRoof(8, 8, 2.4, this.M.roofL);
    pavRoof.position.y = 3.5;
    pav.add(pavRoof);
    pav.position.set(-6, 0, 33);
    this.shadowed(pav);
    S.add(pav);
    this._addLanternLight(-6, 3, 33, 13);

    // ===== records house — main estate residence =====
    this._buildHouse(24, 26);
    // ===== kura storehouse =====
    this._buildKura(-27, 22);

    // moon + stars
    this.moonMat = new THREE.MeshBasicMaterial({ color: 0xf2f7ee });
    this.moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 24, 18),
      this.moonMat,
    );
    this.moonMesh.position.set(-55, 48, -85);
    S.add(this.moonMesh);
    const starGeo = new THREE.BufferGeometry();
    const sp = [];
    for (let i = 0; i < 320; i++) {
      const a = Math.random() * Math.PI * 2,
        e = Math.random() * Math.PI * 0.42 + 0.08,
        r = 160;
      sp.push(
        Math.cos(a) * Math.cos(e) * r,
        Math.sin(e) * r,
        Math.sin(a) * Math.cos(e) * r,
      );
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xdfe8e0,
      size: 0.55,
      transparent: true,
      opacity: 0.8,
    });
    this.starPoints = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.starPoints);

    // bamboo clusters softening the wall line (inside corners)
    const clump = (x: number, z: number) => {
      for (let i = 0; i < 6; i++) {
        const h = 6 + Math.random() * 5;
        const b = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.11, h, 8),
          this.M.leafM,
        );
        b.position.set(
          x + (Math.random() - 0.5) * 2.6,
          h / 2,
          z + (Math.random() - 0.5) * 2.6,
        );
        b.rotation.z = (Math.random() - 0.5) * 0.07;
        b.castShadow = true;
        S.add(b);
        const lv = new THREE.Mesh(
          this.organic(
            new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 14, 10),
            0.3,
            2,
          ),
          this.M.leafD,
        );
        lv.position.set(b.position.x, h - 0.4, b.position.z);
        lv.scale.set(0.8, 1.5, 0.8);
        S.add(lv);
      }
    };
    [
      [-40, -34],
      [40, -34],
      [-40, 38],
      [40, 38],
      [-40, -12],
      [40, -10],
      [14, 38],
      [-22, 38],
    ].forEach(([x, z]) => clump(x, z));

    // azalea shrubs (smooth mounds) scattered for cohesion
    const shrub = (x: number, z: number, s: number, m: THREE.Material) => {
      const sh = new THREE.Mesh(
        this.organic(new THREE.SphereGeometry(s, 18, 14), 0.24, 1.5),
        m,
      );
      sh.position.set(x, s * 0.4, z);
      sh.scale.y = 0.6;
      sh.castShadow = sh.receiveShadow = true;
      S.add(sh);
    };
    shrub(-9, -13, 1.4, this.M.leafM);
    shrub(-6.5, -14.5, 1.0, this.M.leafD);
    shrub(12, 14, 1.3, this.M.leafM);
    shrub(14.5, 12.5, 0.9, this.M.leafL);
    shrub(-16, 17, 1.2, this.M.leafD);
    shrub(36, 18, 1.6, this.M.leafM);
    shrub(-35, -2, 1.4, this.M.leafD);
    shrub(6, -30, 1.1, this.M.leafM);
    shrub(33, 33, 1.3, this.M.leafD);
    shrub(-33, 32, 1.2, this.M.leafM);

    // ground dressing: macro light/shade painting + instanced grass tufts
    this._macroShade();
    this._buildGrass();
  }

  _buildHouse(hx: number, hz: number) {
    const THREE = this.THREE,
      S = this.scene;
    const g = new THREE.Group();
    // stone foundation
    const found = new THREE.Mesh(
      new THREE.BoxGeometry(17, 0.6, 12.4),
      this.M.stoneD,
    );
    found.position.y = 0.3;
    // engawa deck wrapping front
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(16.2, 0.35, 11.6),
      this.M.woodL,
    );
    deck.position.y = 0.78;
    // main body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(13.6, 3.4, 9),
      this.M.woodD,
    );
    body.position.y = 2.6;
    g.add(found, deck, body);
    // round pillars along engawa front
    for (let i = -3; i <= 3; i++) {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 3.9, 10),
        this.M.woodM,
      );
      p.position.set(i * 2.55, 2.7, -5.4);
      g.add(p);
    }
    // shoji panels (warm glow) across the front
    const shoji = new THREE.MeshStandardMaterial({
      color: 0xffd9a3,
      emissive: 0xffc873,
      emissiveIntensity: 1.1,
    });
    this.shojiMats.push(shoji);
    const latMat = this.M.woodD;
    for (let sx = -2; sx <= 2; sx++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.3), shoji);
      s.position.set(sx * 2.55, 2.3, -4.52);
      g.add(s);
      for (let i = -1; i <= 1; i++) {
        const v = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 2.3, 0.03),
          latMat,
        );
        v.position.set(sx * 2.55 + i * 0.72, 2.3, -4.53);
        g.add(v);
      }
      for (let i = 0; i < 3; i++) {
        const hbar = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.06, 0.03),
          latMat,
        );
        hbar.position.set(sx * 2.55, 1.45 + i * 0.8, -4.53);
        g.add(hbar);
      }
    }
    // curved two-tier roof
    const roof = this.curvedRoof(19, 13.6, 3.2, this.M.roof);
    roof.position.y = 4.3;
    g.add(roof);
    const roof2 = this.curvedRoof(9, 6.6, 1.7, this.M.roofL);
    roof2.position.y = 7.2;
    g.add(roof2);
    // side wing (attached, lower) — gives estate massing
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 2.6, 6.6),
      this.M.woodD,
    );
    wing.position.set(-9.2, 1.9, 1.4);
    g.add(wing);
    const wingRoof = this.curvedRoof(8.6, 8.4, 2.0, this.M.roofL);
    wingRoof.position.set(-9.2, 3.2, 1.4);
    g.add(wingRoof);
    // hanging lanterns at entry
    [-1.4, 1.4].forEach((x) => {
      const lm = new THREE.MeshStandardMaterial({
        color: 0xffd9a3,
        emissive: 0xffc873,
        emissiveIntensity: 1.5,
      });
      this.shojiMats.push(lm);
      const lant = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), lm);
      lant.position.set(x, 3.6, -5.5);
      lant.scale.y = 1.25;
      g.add(lant);
    });
    g.position.set(hx, 0, hz);
    this.shadowed(g);
    S.add(g);
    const l = new this.THREE.PointLight(0xffc873, 1.3, 24, 2);
    l.position.set(hx, 3.4, hz - 7);
    l.userData.base = 1.3;
    S.add(l);
    this.lanternLights.push(l);
  }

  _buildKura(kx: number, kz: number) {
    const THREE = this.THREE,
      S = this.scene;
    const g = new THREE.Group();
    const found = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 0.5, 7.2),
      this.M.stoneD,
    );
    found.position.y = 0.25;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 4.4, 6.2),
      this.M.plaster,
    );
    body.position.y = 2.6;
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 1.4, 6.4),
      this.M.woodD,
    );
    band.position.y = 1.0;
    g.add(found, body, band);
    // namako diagonal lattice on front band
    for (let i = -3; i <= 3; i++) {
      const d1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.4, 0.05),
        this.M.plaster,
      );
      d1.position.set(i * 1.1, 1.0, 3.24);
      d1.rotation.z = 0.6;
      g.add(d1);
      const d2 = d1.clone();
      d2.rotation.z = -0.6;
      g.add(d2);
    }
    // door with awning
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 2.6, 0.25),
      this.M.woodD,
    );
    door.position.set(0, 2.1, 3.2);
    const awning = this.curvedRoof(3.4, 1.6, 0.7, this.M.roofL);
    awning.position.set(0, 3.7, 3.4);
    g.add(door, awning);
    // curved gable roof
    const roof = this.curvedRoof(10.4, 8, 2.6, this.M.roof);
    roof.position.y = 4.9;
    g.add(roof);
    g.position.set(kx, 0, kz);
    this.shadowed(g);
    S.add(g);
  }

  _buildPlayer() {
    const THREE = this.THREE;
    const g = new THREE.Group();
    const kimono = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 0.5, 8, 16),
      this.mat(0x6f9a80, 0.85),
    );
    kimono.position.y = 0.85;
    const sash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.16, 16),
      this.mat(0xc9a85c, 0.6),
    );
    sash.position.y = 0.85;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 14),
      this.mat(0xe8c9a8, 0.8),
    );
    head.position.y = 1.62;
    const hat = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 0.35, 18),
      this.mat(0x33291f, 0.9),
    );
    hat.position.y = 1.92;
    g.add(kimono, sash, head, hat);
    g.traverse((o) => {
      o.castShadow = true;
    });
    this.player = g;
    this.scene.add(g);
    this.camera.position.set(0, 27, 30);
  }

  _buildPetals() {
    const THREE = this.THREE;
    const n = 130;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    this._petalV = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = Math.random() * 26;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
      this._petalV[i] = 0.8 + Math.random() * 1.4;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.petalMat = new THREE.PointsMaterial({
      color: 0xf0bcd4,
      size: 0.5,
      map: this.glowTex(244, 214, 228),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.petals = new THREE.Points(geo, this.petalMat);
    this.scene.add(this.petals);

    // fireflies drifting low over the moss (midnight only)
    const fn = 42;
    const fpos = new Float32Array(fn * 3);
    this._fireflyBase = new Float32Array(fn * 3);
    for (let i = 0; i < fn; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = 0.6 + Math.random() * 2.2;
      const z = (Math.random() - 0.5) * 76;
      fpos.set([x, y, z], i * 3);
      this._fireflyBase.set([x, y, z], i * 3);
    }
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
    this._fireflies = new THREE.Points(
      fgeo,
      new THREE.PointsMaterial({
        color: 0xffd98a,
        size: 0.55,
        map: this.glowTex(255, 217, 138),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(this._fireflies);
  }

  blocked(x: number, z: number) {
    // pond ellipse minus bridge corridor
    const pdx = (x - 24) / 22,
      pdz = (z + 6) / 15;
    if (pdx * pdx + pdz * pdz < 1 && Math.abs(x - 24) > 2.0) return true;
    // house + wing
    if (x > 15 && x < 33 && z > 19.5 && z < 32.5) return true;
    if (x > 11.5 && x < 18.5 && z > 24 && z < 31) return true;
    // kura
    if (x > -32 && x < -22 && z > 18.2 && z < 26) return true;
    // moss mound
    if (Math.hypot(x + 28, z + 20) < 12.8) return true;
    // pavilion core
    if (Math.hypot(x + 6, z - 33) < 3.1) return true;
    // sakura
    if (Math.hypot(x, z + 13) < 1.3) return true;
    // gate posts
    if (Math.hypot(x + 3.2, z + 38) < 0.9 || Math.hypot(x - 3.2, z + 38) < 0.9)
      return true;
    // stone islands
    if (
      Math.hypot(x + 4.8, z + 2.8) < 3.0 ||
      Math.hypot(x - 5.3, z - 2.6) < 2.3 ||
      Math.hypot(x + 0.7, z - 7.5) < 1.9
    )
      return true;
    // lanterns
    if (
      Math.hypot(x + 13.5, z + 3) < 1 ||
      Math.hypot(x - 13.5, z - 9) < 1 ||
      Math.hypot(x - 9, z + 24) < 1 ||
      Math.hypot(x + 24, z - 8) < 1
    )
      return true;
    // pines
    const P = [
      [-38, -30],
      [38, -26],
      [-38, 8],
      [38, 6],
      [10, 36],
      [-14, -34],
    ];
    for (let i = 0; i < P.length; i++)
      if (Math.hypot(x - P[i][0], z - P[i][1]) < 1.2) return true;
    return false;
  }

  bridgeY(x: number, z: number) {
    if (Math.abs(x - 24) < 2.0 && z > -21 && z < 9) {
      const t = (z + 21) / 30;
      const pdx = (x - 24) / 22,
        pdz = (z + 6) / 15;
      if (pdx * pdx + pdz * pdz < 1.15)
        return 0.55 + Math.sin(t * Math.PI) * 2.0;
    }
    return 0;
  }

  _tick(dt: number, time: number) {
    if (!this.renderer) return;
    dt = Math.min(dt, 0.05);
    if (!this.paused) {
      let ax = 0,
        az = 0;
      if (this._keys["arrowleft"] || this._keys["a"]) ax -= 1;
      if (this._keys["arrowright"] || this._keys["d"]) ax += 1;
      if (this._keys["arrowup"] || this._keys["w"]) az -= 1;
      if (this._keys["arrowdown"] || this._keys["s"]) az += 1;
      if (ax || az) {
        const n = Math.hypot(ax, az);
        this.vx += (ax / n) * 78 * dt;
        this.vz += (az / n) * 78 * dt;
      }
      const fr = Math.pow(0.0035, dt);
      this.vx *= fr;
      this.vz *= fr;
      const sp = Math.hypot(this.vx, this.vz);
      const MAX = 17;
      if (sp > MAX) {
        this.vx *= MAX / sp;
        this.vz *= MAX / sp;
      }
      if (sp < 0.04) {
        this.vx = 0;
        this.vz = 0;
      }
      let nx = Math.max(-42, Math.min(42, this.px + this.vx * dt));
      let nz = Math.max(-43, Math.min(40, this.pz + this.vz * dt));
      if (this.blocked(nx, nz)) {
        if (!this.blocked(nx, this.pz)) {
          nz = this.pz;
          this.vz = 0;
        } else if (!this.blocked(this.px, nz)) {
          nx = this.px;
          this.vx = 0;
        } else {
          nx = this.px;
          nz = this.pz;
          this.vx = this.vz = 0;
        }
      }
      this.px = nx;
      this.pz = nz;
      this.moving = Math.hypot(this.vx, this.vz) > 0.6;
      let near = null,
        best = 1;
      for (const k in this.zones) {
        const zn = this.zones[k];
        const d = Math.hypot(this.px - zn.x, this.pz - zn.z) / zn.r;
        if (d < 1 && d < best) {
          best = d;
          near = k;
        }
      }
      if (near !== this._near) {
        this._near = near;
        this.onNear(near);
      }
    } else {
      this.vx = this.vz = 0;
      this.moving = false;
    }
    const by = this.bridgeY(this.px, this.pz);
    this.player.position.set(
      this.px,
      by + (this.moving ? Math.abs(Math.sin(time * 9)) * 0.14 : 0),
      this.pz,
    );
    if (this.moving) {
      const target = Math.atan2(this.vx, this.vz);
      let d = target - this.player.rotation.y;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.player.rotation.y += d * Math.min(1, dt * 10);
      this.player.rotation.z = -Math.max(
        -0.14,
        Math.min(0.14, this.vx * 0.012),
      );
    } else {
      this.player.rotation.z *= 0.9;
    }
    // camera follow (semi-tall birds eye, zoomable)
    this.zoom += (this._zoomT - this.zoom) * Math.min(1, dt * 6);
    const zf = this.zoom;
    this.camera.position.x +=
      (this.px - this.camera.position.x) * Math.min(1, dt * 3);
    this.camera.position.z +=
      (this.pz + 19 * zf - this.camera.position.z) * Math.min(1, dt * 3);
    this.camera.position.y +=
      (by + 24 * zf - this.camera.position.y) * Math.min(1, dt * 3);
    this.camera.lookAt(this.px, 0.8, this.pz);
    if (this.sakura) this.sakura.rotation.z = Math.sin(time * 0.5) * 0.012;
    if (this.waterMat) {
      this.waterMat.opacity = 0.9 + Math.sin(time * 1.2) * 0.045;
      const wm = this.waterMat.map;
      if (wm) {
        wm.offset.x = time * 0.006;
        wm.offset.y = time * 0.0045;
      }
    }
    if (this._koi) {
      this._koi.forEach((k, i) => {
        const t = time * k.speed + k.phase;
        k.g.position.set(
          24 + Math.cos(t) * k.rx,
          0.22,
          -6 + Math.sin(t) * k.rz,
        );
        k.g.rotation.y = -t - Math.PI / 2 + Math.sin(time * 3 + i) * 0.15;
      });
    }
    if (this.petals) {
      const p = this.petals.geometry.attributes
        .position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        let y = p.getY(i) - this._petalV[i] * dt;
        let x = p.getX(i) - dt * 0.9;
        if (y < 0.1) {
          y = 22 + Math.random() * 5;
          x = (Math.random() - 0.5) * 90;
        }
        if (x < -46) x = 46;
        p.setY(i, y);
        p.setX(i, x);
      }
      p.needsUpdate = true;
    }
    this.lanternLights.forEach((l, i) => {
      l.intensity =
        (l.userData.base || 1.4) *
        (0.88 +
          Math.sin(time * 7 + i * 2.3) * 0.08 +
          Math.sin(time * 13.7 + i) * 0.05);
    });
    if (
      this._fireflies &&
      (this._fireflies.material as THREE.PointsMaterial).opacity > 0
    ) {
      const fp = this._fireflies.geometry.attributes
        .position as THREE.BufferAttribute;
      for (let i = 0; i < fp.count; i++) {
        const b = i * 3;
        fp.setXYZ(
          i,
          this._fireflyBase[b] + Math.sin(time * 0.7 + i * 2.1) * 1.7,
          this._fireflyBase[b + 1] + Math.sin(time * 1.1 + i) * 0.5,
          this._fireflyBase[b + 2] + Math.cos(time * 0.5 + i * 1.7) * 1.7,
        );
      }
      fp.needsUpdate = true;
    }
    // Physics/state above stays warm; skip only the GPU draw while an opaque
    // interior fully covers the world (see setHidden).
    if (this.hidden) return;
    this._composer.render();
  }

  updateData(data: Garden3DData) {
    const sig = JSON.stringify(data);
    if (sig === this._dataSig) return;
    this._dataSig = sig;
    const THREE = this.THREE;
    while (this.dynGroup.children.length) {
      const child = this.dynGroup.children[0];
      child.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) m.geometry.dispose();
        // do NOT dispose materials — this.M materials are shared; per-koi materials are small and freed on context loss
      });
      this.dynGroup.remove(child);
    }
    this._koi = [];
    // grove bonsai (smooth, growing)
    const TP = [
      [-31, -24],
      [-24, -17],
      [-31, -15],
      [-23, -24],
      [-27, -20],
    ];
    (data.trees || []).slice(0, 5).forEach((t, i) => {
      const g = new THREE.Group();
      const h = 1.3 + t.pct * 3.2;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.24, h, 10),
        this.M.bark,
      );
      trunk.position.y = h / 2;
      trunk.rotation.z = 0.08 * (i % 2 ? 1 : -1);
      g.add(trunk);
      const bloom = t.pct >= 0.8;
      (
        [
          [0, h + 0.15, 0, 0.65 + t.pct * 0.85, this.M.leafM],
          [-0.55, h - 0.45, 0.3, 0.42 + t.pct * 0.5, this.M.leafD],
          [0.55, h - 0.35, -0.3, 0.4 + t.pct * 0.42, this.M.leafL],
        ] as [number, number, number, number, THREE.MeshStandardMaterial][]
      ).forEach(([x, y, z, s, m]) => {
        const c = new THREE.Mesh(
          this.organic(new THREE.SphereGeometry(s, 18, 14), 0.22, 1.8),
          m,
        );
        c.position.set(x, y, z);
        c.scale.y = 0.62;
        g.add(c);
      });
      if (bloom) {
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 12, 10),
          this.sakuraMat,
        );
        b.position.set(0.25, h + 0.7, 0.25);
        b.scale.y = 0.7;
        g.add(b);
      }
      this.shadowed(g);
      g.position.set(TP[i % TP.length][0], 1.0, TP[i % TP.length][1]);
      this.dynGroup.add(g);
    });
    // koi
    (data.koi || []).slice(0, 12).forEach((k, i) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.6, 6, 12),
        this.mat(parseInt((k.c1 || "#c47d7d").slice(1), 16), 0.55),
      );
      body.rotation.x = Math.PI / 2;
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.5, 10),
        this.mat(parseInt((k.c2 || "#894a4a").slice(1), 16), 0.55),
      );
      tail.rotation.x = -Math.PI / 2;
      tail.position.z = -0.7;
      g.add(body, tail);
      this.dynGroup.add(g);
      this._koi!.push({
        g,
        rx: 6 + (i % 5) * 2.6,
        rz: 4 + (i % 4) * 2.1,
        speed: 0.25 + (i % 3) * 0.09,
        phase: i * 1.3,
      });
    });
    // seed crates by kura
    const n = Math.min(data.seeds || 0, 6);
    for (let i = 0; i < n; i++) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.7, 0.9),
        this.M.woodM,
      );
      crate.position.set(
        -22 + (i % 3) * 1.15,
        0.35 + Math.floor(i / 3) * 0.75,
        27,
      );
      crate.castShadow = crate.receiveShadow = true;
      this.dynGroup.add(crate);
    }
  }

  setMood(mood: "midnight" | "dawn") {
    const THREE = this.THREE;
    const M = MOODS[mood] || MOODS.midnight;
    this.mood = mood;
    const sky = this._sky[mood];
    this.scene.background = sky || new THREE.Color(M.sky);
    if (this.moonMesh) this.moonMesh.visible = !sky;
    if (this.starPoints) this.starPoints.visible = !sky;
    this.scene.fog = new THREE.FogExp2(M.sky, M.fogD);
    this.ambient.color.setHex(M.ambient);
    this.ambient.intensity = M.ambientI;
    this.dir.color.setHex(M.dirColor);
    this.dir.intensity = M.dirI;
    this._groundTintMats.forEach((m) => m.color.setHex(M.groundTint));
    this._gravelTintMats.forEach((m) => m.color.setHex(M.gravelTint));
    this.waterMat.color.setHex(this.waterMat.map ? M.waterTex : M.water);
    this.starMat.opacity = M.stars ? 0.8 : 0;
    this.moonMat.color.setHex(M.moon);
    this.scene.environmentIntensity = M.envI;
    this._bloom.strength = M.bloom;
    this._halos.forEach((h) => {
      h.material.opacity = M.haloO;
    });
    if (this._fireflies)
      (this._fireflies.material as THREE.PointsMaterial).opacity = M.fireflyO;
    if (this._moonStreak) this._moonStreak.visible = mood === "midnight";
    this.lanternLights.forEach((l) => {
      l.userData.base = M.lanternI;
    });
    (this.shojiMats || []).forEach((m) => {
      m.emissiveIntensity = M.shoji;
    });
  }

  setPaused(p: boolean) {
    this.paused = p;
    if (p) this._keys = {}; // drop held keys so nothing sticks across an interior visit
  }
  setHidden(h: boolean) {
    this.hidden = h;
  }
  zoomBy(f: number) {
    this._zoomT = Math.max(0.55, Math.min(2.6, this._zoomT * f));
  }
  setPlayerPos(x: number, z: number) {
    this.px = x;
    this.pz = z;
    this.vx = this.vz = 0;
  }
  dispose() {
    if (!this.renderer) return;
    cancelAnimationFrame(this._raf);
    clearInterval(this._watchdog);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("keydown", this._kd);
    window.removeEventListener("keyup", this._ku);
    window.removeEventListener("wheel", this._wheel);
    this._texList.forEach((t) => t.dispose());
    this._composer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode)
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    this.renderer = null;
  }
}
