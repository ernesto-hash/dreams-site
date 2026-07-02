import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const MOBILE_BREAKPOINT = 768;
const GOLD = 0xd4af37;
const WARM = 0xfff3d6;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type ShardInstance = {
  mesh: THREE.InstancedMesh;
  index: number;
  base: THREE.Vector3;
  axis: THREE.Vector3;
  spin: number;
  phase: number;
  drift: number;
  scale: number;
};

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || !supportsWebGL()) {
      setUseFallback(true);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cleanup = () => {};

    try {
      cleanup = setupScene(container, canvas, setUseFallback);
    } catch {
      setUseFallback(true);
    }

    return () => cleanup();
  }, []);

  if (useFallback) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(circle at 30% 70%, rgba(212,175,55,0.18), transparent 60%), #0a0a0a" }}
      />
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

function setupScene(
  container: HTMLDivElement,
  canvas: HTMLCanvasElement,
  setUseFallback: (v: boolean) => void
): () => void {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const GOLD_COUNT = isMobile ? 40 : 180;
    const CRYSTAL_COUNT = isMobile ? 8 : 45;
    const BOKEH_COUNT = isMobile ? 10 : 20;
    const PIXEL_RATIO_CAP = isMobile ? 1.5 : 2;

    // Verifica o contexto no canvas real antes de o entregar ao WebGLRenderer —
    // em StrictMode este canvas pode já ter passado por um ciclo mount/cleanup,
    // e um contexto nulo aqui não pode chegar ao construtor do renderer.
    const contextAttributes = { alpha: true, antialias: true };
    const gl = canvas.getContext("webgl2", contextAttributes) || canvas.getContext("webgl", contextAttributes);
    if (!gl) {
      throw new Error("Hero3D: WebGL context unavailable on this canvas");
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.045);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    function applyRes() {
      const width = container!.clientWidth || 1;
      const height = container!.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    applyRes();

    // ---- environment (gold reflection map) ----
    function makeEnv() {
      const W = 1024, H = 512;
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const x = c.getContext("2d")!;
      x.fillStyle = "#070707"; x.fillRect(0, 0, W, H);
      let g = x.createRadialGradient(W * 0.7, H * 0.28, 10, W * 0.7, H * 0.28, H);
      g.addColorStop(0, "#ffffff"); g.addColorStop(0.3, "#565656"); g.addColorStop(1, "#070707");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      g = x.createRadialGradient(W * 0.2, H * 0.75, 10, W * 0.2, H * 0.75, H * 0.8);
      g.addColorStop(0, "#3a2f1e"); g.addColorStop(1, "rgba(7,7,7,0)");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      const t = new THREE.CanvasTexture(c);
      t.mapping = THREE.EquirectangularReflectionMapping;
      // PMREMGenerator faz uploads via texImage3D no seu mip chain, e o WebGL2 não
      // permite combinar isso com UNPACK_FLIP_Y_WEBGL — desligar flipY na fonte evita o aviso.
      t.flipY = false;
      const pm = new THREE.PMREMGenerator(renderer);
      pm.compileEquirectangularShader();
      const env = pm.fromEquirectangular(t).texture;
      t.dispose();
      pm.dispose();
      return env;
    }
    scene.environment = makeEnv();

    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(4, 5, 3);
    scene.add(key);
    const goldLight = new THREE.PointLight(GOLD, 2.2, 40);
    goldLight.position.set(-5, -2, 2);
    scene.add(goldLight);
    const fillLight = new THREE.PointLight(0xffffff, 0.8, 40);
    fillLight.position.set(0, 0, 7);
    scene.add(fillLight);
    scene.add(new THREE.AmbientLight(0x101010, 1));

    function glowTex() {
      const s = 128;
      const c = document.createElement("canvas");
      c.width = c.height = s;
      const x = c.getContext("2d")!;
      const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(255,255,255,.6)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g; x.fillRect(0, 0, s, s);
      return new THREE.CanvasTexture(c);
    }
    const glowTexture = glowTex();

    // ---- suspended shards (gold metal + crystal) ----
    const cluster = new THREE.Group();
    scene.add(cluster);
    const dummy = new THREE.Object3D();
    const instances: ShardInstance[] = [];

    function makeShards(count: number, geo: THREE.BufferGeometry, mat: THREE.Material, rad: number) {
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      for (let i = 0; i < count; i++) {
        const r = rad * (0.25 + Math.pow(Math.random(), 0.6) * 0.95);
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const base = new THREE.Vector3(
          r * Math.sin(ph) * Math.cos(th),
          r * Math.cos(ph) * 0.8,
          r * Math.sin(ph) * Math.sin(th)
        );
        instances.push({
          mesh, index: i, base,
          axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          spin: (Math.random() - 0.5) * 0.5,
          phase: Math.random() * 6.28,
          drift: 0.05 + Math.random() * 0.12,
          scale: 0.5 + Math.random() * 1.3,
        });
      }
      cluster.add(mesh);
      return mesh;
    }

    const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.14, envMapIntensity: 1.5 });
    const crystalMat = isMobile
      ? new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.1, envMapIntensity: 1.6, transparent: true, opacity: 0.6 })
      : new THREE.MeshPhysicalMaterial({
          color: 0xffffff, metalness: 0, roughness: 0.04, envMapIntensity: 1.8,
          clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.55, reflectivity: 1,
        });

    const goldMesh = makeShards(GOLD_COUNT, new THREE.OctahedronGeometry(0.17, 0), goldMat, 2.7);
    const crystalMesh = makeShards(CRYSTAL_COUNT, new THREE.IcosahedronGeometry(0.16, 0), crystalMat, 2.6);

    // ---- glow halos on shards ----
    function haloPoints() {
      const n = instances.length;
      const g = new THREE.BufferGeometry();
      const p = new Float32Array(n * 3);
      for (let k = 0; k < n; k++) {
        p[k * 3] = instances[k].base.x;
        p[k * 3 + 1] = instances[k].base.y;
        p[k * 3 + 2] = instances[k].base.z;
      }
      g.setAttribute("position", new THREE.BufferAttribute(p, 3));
      const m = new THREE.PointsMaterial({
        map: glowTexture, color: WARM, size: 0.5, transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      const pts = new THREE.Points(g, m);
      cluster.add(pts);
      return pts;
    }
    haloPoints();

    // ---- central core glow ----
    const core = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture, color: WARM, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    core.scale.setScalar(5.5);
    scene.add(core);

    // ---- cinematic bokeh ----
    const bokeh: THREE.Sprite[] = [];
    function makeBokeh() {
      const cols = [GOLD, WARM, 0xffffff];
      const maxFrontScale = isMobile ? 1.6 : 2.9;
      const minFrontScale = isMobile ? 0.8 : 1.1;
      for (let i = 0; i < BOKEH_COUNT; i++) {
        const front = Math.random() < 0.5;
        const s = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTexture, color: cols[i % 3], transparent: true,
          opacity: front ? 0.16 : 0.1, blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        const z = front ? 3.2 + Math.random() * 2.2 : -4 - Math.random() * 3;
        s.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 7, z);
        s.scale.setScalar(front ? minFrontScale + Math.random() * (maxFrontScale - minFrontScale) : 0.5 + Math.random() * 1.0);
        (s.userData as { sp: number; ph: number; ax: number }) = {
          sp: 0.04 + Math.random() * 0.1, ph: Math.random() * 6.28, ax: (Math.random() - 0.5) * 0.6,
        };
        scene.add(s);
        bokeh.push(s);
      }
    }
    makeBokeh();

    // ---- light shaft ----
    let beamTexture: THREE.CanvasTexture | null = null;
    (function beam() {
      const c = document.createElement("canvas");
      c.width = 256; c.height = 1024;
      const x = c.getContext("2d")!;
      const g = x.createLinearGradient(0, 0, 0, 1024);
      g.addColorStop(0, "rgba(255,255,255,.42)");
      g.addColorStop(0.5, "rgba(230,230,230,.07)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g; x.fillRect(0, 0, 256, 1024);
      const t = new THREE.CanvasTexture(c);
      t.anisotropy = Math.min(maxAniso, 8);
      beamTexture = t;
      const m = new THREE.MeshBasicMaterial({
        map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, opacity: 0.4,
      });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 9), m);
      p.position.set(2.8, 1.8, -1.2);
      p.rotation.z = -0.5;
      p.rotation.y = 0.2;
      scene.add(p);
    })();

    // ---- mouse parallax ----
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const handlePointerMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", handlePointerMove);

    // ---- render loop ----
    const timer = new THREE.Timer();
    let frameId: number | null = null;
    const uniqueMeshes = [goldMesh, crystalMesh];

    const renderFrame = (now?: number) => {
      timer.update(now);
      const t = timer.getElapsed();
      for (let k = 0; k < instances.length; k++) {
        const o = instances[k];
        const dx = Math.sin(t * o.drift + o.phase) * 0.12;
        const dy = Math.cos(t * o.drift * 0.9 + o.phase) * 0.12;
        dummy.position.set(o.base.x + dx, o.base.y + dy, o.base.z + dx * 0.5);
        dummy.quaternion.setFromAxisAngle(o.axis, t * o.spin + o.phase);
        dummy.scale.setScalar(o.scale);
        dummy.updateMatrix();
        o.mesh.setMatrixAt(o.index, dummy.matrix);
      }
      uniqueMeshes.forEach((m) => { m.instanceMatrix.needsUpdate = true; });

      cluster.rotation.y = t * 0.08;
      cluster.rotation.x = Math.sin(t * 0.2) * 0.06;
      (core.material as THREE.SpriteMaterial).opacity = 0.34 + Math.sin(t * 0.8) * 0.08;

      for (const s of bokeh) {
        const data = s.userData as { sp: number; ph: number; ax: number };
        s.position.y += Math.sin(t * data.sp + data.ph) * 0.002;
        s.position.x += data.ax * 0.001;
      }

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.position.x = mouse.x * 1.4;
      camera.position.y = -mouse.y * 1.0;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const stop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };
    const tick = (now?: number) => {
      renderFrame(now);
      frameId = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frameId !== null || document.hidden) return;
      tick();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stop(); else start();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => applyRes();
    window.addEventListener("resize", handleResize);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      stop();
      setUseFallback(true);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);

      scene.traverse((obj) => {
        const anyObj = obj as THREE.Mesh | THREE.Points | THREE.Sprite;
        anyObj.geometry?.dispose?.();
        const material = (anyObj as THREE.Mesh).material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose?.();
      });
      glowTexture.dispose();
      beamTexture?.dispose();
      (scene.environment as THREE.Texture | null)?.dispose?.();
      renderer.dispose();
    };
}
