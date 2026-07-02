import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { countryCoordinates } from "@/lib/countryCoordinates";
import { createGlowTexture } from "@/lib/glowTexture";
import { prefersReducedMotion, supportsWebGL } from "@/lib/webgl";

const MOBILE_BREAKPOINT = 768;
const WARM = 0xfff3d6;
const GLOBE_RADIUS = 1.6;

// Textura oficial dos exemplos do Three.js (threejs.org/examples/webgl_earth) —
// "Earth at night", derivada de imagem NASA Black Marble. ~718KB, por isso só
// é pedida quando a secção está mesmo perto do ecrã (ver lazyObserver abaixo).
const EARTH_NIGHT_TEXTURE_URL = "https://threejs.org/examples/textures/planets/earth_lights_2048.png";

// Só usado em dev (npm run dev) quando não há países reais — nunca existe num build
// de produção, para nunca se confundir com dados a sério se o Supabase falhar.
const DEV_EXAMPLE_COUNTRIES = ["Portugal", "United States", "Brazil", "Japan", "Nigeria", "India", "Germany", "Australia"];

function latLonToVector3(lon: number, lat: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function Globe3D({ countries }: { countries: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || !supportsWebGL()) {
      setUseFallback(true);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const effectiveCountries = countries.length > 0
      ? countries
      : (import.meta.env.DEV ? DEV_EXAMPLE_COUNTRIES : []);

    setIsEmpty(effectiveCountries.length === 0);

    let cleanup = () => {};
    let started = false;

    // Só arranca o setup (e o download da textura de ~718KB) quando a secção
    // está mesmo perto do ecrã — quem nunca faz scroll até aqui nunca a pede.
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        if (started || !entries[0].isIntersecting) return;
        started = true;
        lazyObserver.disconnect();
        try {
          cleanup = setupGlobe(container, canvas, effectiveCountries, setUseFallback);
        } catch {
          setUseFallback(true);
        }
      },
      { rootMargin: "200px" }
    );
    lazyObserver.observe(container);

    return () => {
      lazyObserver.disconnect();
      cleanup();
    };
  }, [countries]);

  return (
    <div className="w-full bg-dark-card/60 rounded-xl p-4 border border-neon-primary/20">
      <h2 className="text-center text-neon-primary font-orbitron font-bold text-xl mb-4">
        Dreams Around The World
      </h2>

      {useFallback ? (
        <div
          aria-hidden="true"
          className="w-full aspect-square max-w-md mx-auto rounded-full"
          style={{ background: "radial-gradient(circle at 35% 35%, rgba(212,175,55,0.25), #0a0a0a 70%)" }}
        />
      ) : (
        <div ref={containerRef} className="w-full aspect-square max-w-md mx-auto">
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
      )}

      {isEmpty && (
        <p className="text-center text-neon-secondary/50 text-sm mt-4">
          Dreams will appear on the globe as they are submitted
        </p>
      )}
    </div>
  );
}

function setupGlobe(
  container: HTMLDivElement,
  canvas: HTMLCanvasElement,
  countries: string[],
  setUseFallback: (v: boolean) => void
): () => void {
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  const SEGMENTS = isMobile ? 32 : 64;
  const PIXEL_RATIO_CAP = isMobile ? 1.5 : 2;

  const contextAttributes = { alpha: true, antialias: true };
  const gl = canvas.getContext("webgl2", contextAttributes) || canvas.getContext("webgl", contextAttributes);
  if (!gl) {
    throw new Error("Globe3D: WebGL context unavailable on this canvas");
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  function applyRes() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  applyRes();

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 2, 4);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0x202020, 1));

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Terra realista à noite: uma única textura usada como map (cor base escura,
  // continentes/oceanos ficam quase pretos) e como emissiveMap (as luzes das
  // cidades brilham por si, independentes da direção da luz da cena).
  const earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    emissive: 0xffd699,
    emissiveIntensity: 1.4,
    roughness: 1,
    metalness: 0,
  });

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    EARTH_NIGHT_TEXTURE_URL,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      earthMaterial.map = texture;
      earthMaterial.emissiveMap = texture;
      earthMaterial.needsUpdate = true;
    },
    undefined,
    () => setUseFallback(true)
  );

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, SEGMENTS, SEGMENTS), earthMaterial);
  globeGroup.add(sphere);

  const glowTexture = createGlowTexture();

  type GlowPoint = { sprite: THREE.Sprite; phase: number };
  const points: GlowPoint[] = [];

  const uniqueCountries = [...new Set(countries)];
  for (const name of uniqueCountries) {
    const coords = countryCoordinates[name];
    if (!coords) continue;
    const [lon, lat] = coords;
    const position = latLonToVector3(lon, lat, GLOBE_RADIUS * 1.02);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture, color: WARM, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sprite.position.copy(position);
    sprite.scale.setScalar(0.16);
    globeGroup.add(sprite);
    points.push({ sprite, phase: Math.random() * Math.PI * 2 });
  }

  const timer = new THREE.Timer();
  let frameId: number | null = null;

  const renderFrame = (now?: number) => {
    timer.update(now);
    const t = timer.getElapsed();

    globeGroup.rotation.y = t * 0.05;

    for (const p of points) {
      const pulse = 0.7 + Math.sin(t * 1.4 + p.phase) * 0.3;
      (p.sprite.material as THREE.SpriteMaterial).opacity = 0.5 + pulse * 0.4;
      p.sprite.scale.setScalar(0.12 + pulse * 0.08);
    }

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
    if (frameId !== null) return;
    tick();
  };

  // só corre quando a tab está visível E a secção do globo está mesmo no ecrã
  let tabVisible = !document.hidden;
  let inViewport = false;
  const syncRunState = () => {
    if (tabVisible && inViewport) start();
    else stop();
  };

  const handleVisibilityChange = () => {
    tabVisible = !document.hidden;
    syncRunState();
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      inViewport = entries[0].isIntersecting;
      syncRunState();
    },
    { threshold: 0.15 }
  );
  intersectionObserver.observe(container);

  const handleResize = () => applyRes();
  window.addEventListener("resize", handleResize);

  const handleContextLost = (e: Event) => {
    e.preventDefault();
    stop();
    setUseFallback(true);
  };
  canvas.addEventListener("webglcontextlost", handleContextLost, false);

  return () => {
    stop();
    intersectionObserver.disconnect();
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    canvas.removeEventListener("webglcontextlost", handleContextLost);

    scene.traverse((obj) => {
      const anyObj = obj as THREE.Mesh | THREE.Sprite;
      anyObj.geometry?.dispose?.();
      const material = (anyObj as THREE.Mesh).material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose?.();
    });
    earthMaterial.map?.dispose();
    glowTexture.dispose();
    renderer.dispose();
  };
}
