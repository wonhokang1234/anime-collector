/* Garden3D — procedural 3D Japanese estate zen garden (module three build) */
import * as THREE from "three";

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
  stars: boolean;
  fogD: number;
  shoji: number;
  moon: number;
  groundTint: number;
  gravelTint: number;
}

const MOODS: Record<string, MoodDef> = {
  midnight: {
    sky: 0x0a1612,
    ambient: 0x42605a,
    ambientI: 0.72,
    dirColor: 0xcfe0d0,
    dirI: 0.72,
    lanternI: 1.7,
    water: 0x143028,
    stars: true,
    fogD: 0.0052,
    shoji: 1.3,
    moon: 0xf2f7ee,
    groundTint: 0xffffff,
    gravelTint: 0xdddddd,
  },
  dawn: {
    sky: 0xdfe8d6,
    ambient: 0xfff2d8,
    ambientI: 0.9,
    dirColor: 0xfff3d0,
    dirI: 1.4,
    lanternI: 0.25,
    water: 0x6fb09a,
    stars: false,
    fogD: 0.0038,
    shoji: 0.15,
    moon: 0xfff3d0,
    groundTint: 0xcccccc,
    gravelTint: 0xffffff,
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
  rakeMat!: THREE.MeshStandardMaterial;
  waterMat!: THREE.MeshStandardMaterial;
  moonMat!: THREE.MeshBasicMaterial;
  starMat!: THREE.PointsMaterial;
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
    this.renderer.toneMappingExposure = 1.08;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 420);

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
      roof: this.mat(0x272d33, 0.55, 0.18), // charcoal tile
      roofL: this.mat(0x333a41, 0.55, 0.18),
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

    this._buildLights();
    this._buildStatic();
    this.dynGroup = new THREE.Group();
    this.scene.add(this.dynGroup);
    this._buildPlayer();
    this._buildPetals();
    this.setMood(this.mood);

    this._onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer!.setSize(w, h);
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

  shadowed(g: THREE.Object3D) {
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return g;
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
        new THREE.SphereGeometry(ps * s, 14, 10),
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

  /* ---- continuous gravel path ribbon along a curve ---- */
  pathRibbon(points: number[][], width: number) {
    const THREE = this.THREE;
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], 0, p[1])),
    );
    const len = curve.getLength();
    const n = Math.ceil(len / 1.0);
    const geo = new THREE.CylinderGeometry(width, width, 0.07, 12);
    for (let i = 0; i <= n; i++) {
      const pt = curve.getPoint(i / n);
      const m = new THREE.Mesh(geo, this.M.gravelPath);
      m.position.set(pt.x, 0.035, pt.z);
      m.receiveShadow = true;
      this.scene.add(m);
    }
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
    this.hemi = new THREE.HemisphereLight(0xbfd8c8, 0x101812, 0.4);
    this.scene.add(this.hemi);
    this.dir = new THREE.DirectionalLight(0xffffff, 0.8);
    this.dir.position.set(-38, 55, -26);
    this.dir.castShadow = true;
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
    const l = new this.THREE.PointLight(0xffc873, 1.4, dist || 16, 2);
    l.position.set(x, y, z);
    l.userData.base = 1.4;
    this.scene.add(l);
    this.lanternLights.push(l);
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
      map: this.gravelTex,
      roughness: 1,
    });
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
    this.rakeMat = this.mat(0x6a6f60, 1);
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.4 + i * 2.05, 2.52 + i * 2.05, 72),
        this.rakeMat,
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.035;
      S.add(ring);
    }
    // courtyard boulders (smooth)
    const boulder = (x: number, z: number, s: number, m: THREE.Material) => {
      const geo = new THREE.SphereGeometry(s, 12, 9);
      const r = new THREE.Mesh(geo, m);
      r.position.set(x, s * 0.42, z);
      r.scale.set(1, 0.62, 0.84);
      r.rotation.y = x * 2.1;
      r.castShadow = r.receiveShadow = true;
      S.add(r);
      const mossRing = new THREE.Mesh(
        new THREE.CircleGeometry(s * 1.3, 16),
        this.M.leafD,
      );
      mossRing.rotation.x = -Math.PI / 2;
      mossRing.position.set(x, 0.04, z);
      S.add(mossRing);
    };
    boulder(-4, -3, 1.6, this.M.stone);
    boulder(-2.4, -1.9, 0.8, this.M.stoneD);
    boulder(5, 2, 1.15, this.M.stone);

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
    const mossMat = new THREE.MeshStandardMaterial({
      map: mossTex,
      roughness: 1,
    });
    const mound = new THREE.Mesh(new THREE.SphereGeometry(13, 28, 20), mossMat);
    mound.position.set(-28, -11.9, -20);
    mound.scale.y = 1;
    mound.receiveShadow = true;
    S.add(mound);
    // edging stones around grove
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const st = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 0.4, 10, 8),
        i % 3 ? this.M.stone : this.M.stoneD,
      );
      st.position.set(-28 + Math.cos(a) * 12.6, 0.22, -20 + Math.sin(a) * 12.6);
      st.scale.y = 0.55;
      st.castShadow = true;
      S.add(st);
    }

    // ===== pond with sand shore + smooth rocks + bridge =====
    // sand shore
    const shore = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      this.mat(0x8a8f7f, 1),
    );
    shore.rotation.x = -Math.PI / 2;
    shore.scale.set(23.4, 16.4, 1);
    shore.position.set(24, 0.015, -6);
    shore.receiveShadow = true;
    S.add(shore);
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
    // smooth shore rocks, partially sunk, varied
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2 + Math.random() * 0.1;
      const s = 0.55 + Math.random() * 1.05;
      const r = new THREE.Mesh(
        new THREE.SphereGeometry(s, 12, 9),
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
        new THREE.SphereGeometry(s, 16, 12),
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
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 24, 18),
      this.moonMat,
    );
    moon.position.set(-55, 48, -85);
    S.add(moon);
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
    this.scene.add(new THREE.Points(starGeo, this.starMat));

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
          new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 10, 8),
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
      const sh = new THREE.Mesh(new THREE.SphereGeometry(s, 14, 10), m);
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
      color: 0xdcaac6,
      size: 0.32,
      transparent: true,
      opacity: 0.85,
    });
    this.petals = new THREE.Points(geo, this.petalMat);
    this.scene.add(this.petals);
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
    // boulders
    if (Math.hypot(x + 4, z + 3) < 2.0 || Math.hypot(x - 5, z - 2) < 1.5)
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
    if (this.waterMat)
      this.waterMat.opacity = 0.9 + Math.sin(time * 1.2) * 0.045;
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
    // Physics/state above stays warm; skip only the GPU draw while an opaque
    // interior fully covers the world (see setHidden).
    if (this.hidden) return;
    this.renderer.render(this.scene, this.camera);
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
        const c = new THREE.Mesh(new THREE.SphereGeometry(s, 14, 10), m);
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
    this.scene.background = new THREE.Color(M.sky);
    this.scene.fog = new THREE.FogExp2(M.sky, M.fogD);
    this.ambient.color.setHex(M.ambient);
    this.ambient.intensity = M.ambientI;
    this.dir.color.setHex(M.dirColor);
    this.dir.intensity = M.dirI;
    this.groundMat.color.setHex(M.groundTint);
    this.gravelMat.color.setHex(M.gravelTint);
    this.waterMat.color.setHex(M.water);
    this.starMat.opacity = M.stars ? 0.8 : 0;
    this.moonMat.color.setHex(M.moon);
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
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode)
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    this.renderer = null;
  }
}
