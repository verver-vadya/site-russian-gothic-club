// 3D-примерка: гипсовый слепок Антиноя Капитолийского (3D-скан SMK, общественное достояние) с листом клевера спереди.
// Эскиз ложится на кожу наклейкой (decal), которая повторяет изгибы тела. Модель облегчена до 150 тыс. треугольников,
// единица сцены = 1 м, фигура от подошвы до макушки 1,8 м (так размер эскиза в сантиметрах совпадает с примеркой на гравюре).
// Лист — отдельная деталь со своим цветом: рисунок на него не ложится.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { computeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

// Места: точка на теле (примерно, точную находит луч), с какой стороны бросать луч (yaw, рад),
// наклон эскиза от вертикали в градусах (плюс — верх вправо) и откуда на это место смотреть.
const PLACES = {
  forearm: { at: [-0.29, 0.95, 0.12], ray: -0.45, angle: 3, view: -0.5 },
  shoulder: { at: [-0.225, 1.35, 0.06], ray: -0.85, angle: 0, view: -0.8 },
  chest: { at: [-0.1, 1.3, 0.14], ray: 0, angle: 0, view: -0.1 },
  side: { at: [-0.15, 1.12, 0.1], ray: -0.5, angle: 0, view: -0.55 },
  thigh: { at: [-0.106, 0.6, 0.1], ray: -0.1, angle: -3, view: -0.2 },
  shin: { at: [-0.116, 0.22, 0.0], ray: -0.1, angle: 0, view: -0.2 },
  back: { at: [-0.15, 1.3, -0.12], ray: Math.PI + 0.35, angle: 0, view: Math.PI + 0.35 },
};
// Не кожа: постамент, пень за правой ногой, кисти рук и голова. Сюда чернила не ложатся
const notSkin = (x, y, z) =>
  y < 0.01 ||
  (x < -0.04 && z < -0.12 && y < 0.97) ||
  (x < -0.24 && y < 0.86) ||
  (x > 0.235 && y < 0.95) ||
  y > 1.57;
export const VIEWS = { front: 0.12, side: -Math.PI / 2, back: Math.PI };

const FOV = 30;
const CENTER = new THREE.Vector3(0, 0.84, 0);
const D_MIN = 0.9;
const PAD = 1.06; // у картинок эскизов поля около 6 %

const damp = (k, dt) => 1 - Math.exp(-k * dt);
const smooth = (t) => t * t * (3 - 2 * t);

// Эскиз на белой бумаге → чернила с прозрачностью: бумага уходит, цвет туши остаётся (как multiply на гравюре)
function inkTexture(img) {
  const s = Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const m = Math.min(p[i], p[i + 1], p[i + 2]) / 255;
    let a = Math.min(1, (1 - m) * 1.12);
    if (a < 0.05) a = 0;
    const base = 255 * m;
    p[i] = a ? Math.min(255, (p[i] - base) / a) : 0;
    p[i + 1] = a ? Math.min(255, (p[i + 1] - base) / a) : 0;
    p[i + 2] = a ? Math.min(255, (p[i + 2] - base) / a) : 0;
    p[i + 3] = a * 255;
  }
  ctx.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { texture: t, ratio: w / h };
}

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.decoding = "async";
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

export async function mount(host, { model, onProgress } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "tryon__canvas";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 30);
  scene.add(camera);

  // Свет: тёплый фонарь у зрителя (следует за курсором), слабый холодный отсвет и контровой свет сзади, чтобы гипс отделялся от черноты
  scene.add(new THREE.HemisphereLight(0xb4ada4, 0x17120e, 0.7));
  const lantern = new THREE.PointLight(0xffdcb4, 26, 0, 2);
  lantern.position.set(-1.1, 0.9, 0.4);
  camera.add(lantern);
  const fill = new THREE.DirectionalLight(0xaab4c4, 0.45);
  fill.position.set(1.5, -0.4, 0.5);
  fill.target.position.set(0, 0, -4);
  camera.add(fill, fill.target);
  const rim = new THREE.DirectionalLight(0xffe6c8, 1.4);
  rim.position.set(1.2, 1.6, -6);
  rim.target.position.set(0, 0, 0);
  camera.add(rim, rim.target);

  // Модель
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(model, (e) => onProgress?.(e.total ? e.loaded / e.total : 0));
  const src = gltf.scene.getObjectByName("statue") || gltf.scene.getObjectByProperty("isMesh", true);
  gltf.scene.updateMatrixWorld(true);
  // Квантованные координаты переводим в обычные метры, чтобы считать наклейки без поправок на масштаб узла
  const sp = src.geometry.attributes.position;
  const pos = new Float32Array(sp.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < sp.count; i++) {
    v.fromBufferAttribute(sp, i).applyMatrix4(src.matrixWorld);
    pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
  }
  const index = Uint32Array.from(src.geometry.index.array);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundsTree();
  src.geometry.dispose();
  const normal = geometry.attributes.normal.array;
  const plaster = new THREE.MeshStandardMaterial({ color: 0xe4ded4, roughness: 0.9, metalness: 0 });
  const statue = new THREE.Mesh(geometry, plaster);
  scene.add(statue);
  // Лист клевера: отдельная деталь, луч и наклейки его не видят
  const leafSrc = gltf.scene.getObjectByName("leaf");
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x6f8452, roughness: 0.7, metalness: 0 });
  if (leafSrc) {
    leafSrc.geometry.computeVertexNormals();
    const leaf = new THREE.Mesh(leafSrc.geometry, leafMaterial);
    leaf.applyMatrix4(leafSrc.matrixWorld);
    scene.add(leaf);
  }

  // Центры и нормали треугольников: по ним быстро выбираем кусок тела под наклейкой
  const triCount = index.length / 3;
  const cen = new Float32Array(triCount * 3);
  const fno = new Float32Array(triCount * 3);
  const skin = new Uint8Array(triCount);
  {
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    for (let t = 0; t < triCount; t++) {
      a.fromArray(pos, index[t * 3] * 3); b.fromArray(pos, index[t * 3 + 1] * 3); c.fromArray(pos, index[t * 3 + 2] * 3);
      cen[t * 3] = (a.x + b.x + c.x) / 3; cen[t * 3 + 1] = (a.y + b.y + c.y) / 3; cen[t * 3 + 2] = (a.z + b.z + c.z) / 3;
      n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
      fno[t * 3] = n.x; fno[t * 3 + 1] = n.y; fno[t * 3 + 2] = n.z;
      skin[t] = notSkin(cen[t * 3], cen[t * 3 + 1], cen[t * 3 + 2]) ? 0 : 1;
    }
  }
  // Какие треугольники сходятся в каждой вершине: наклейка растёт от точки по связной коже
  // и не перескакивает с руки на бедро, которое оказалось рядом
  const vertCount = pos.length / 3;
  const vtStart = new Uint32Array(vertCount + 1);
  for (let i = 0; i < index.length; i++) vtStart[index[i] + 1]++;
  for (let i = 0; i < vertCount; i++) vtStart[i + 1] += vtStart[i];
  const vtList = new Uint32Array(index.length);
  {
    const fill = vtStart.slice(0, vertCount);
    for (let i = 0; i < index.length; i++) vtList[fill[index[i]]++] = (i / 3) | 0;
  }
  const mark = new Uint32Array(triCount);
  let stamp = 0;

  // Камера: облёт вокруг цели. Чем ближе, тем сильнее цель смещается от центра фигуры к эскизу
  const cur = { yaw: VIEWS.front, pitch: 0.06, dist: 5 };
  const goal = { ...cur };
  const focus = { cur: CENTER.clone(), goal: CENTER.clone() };
  let dMax = 5;
  let width = 1, height = 1;
  const lightGoal = new THREE.Vector2(-1.1, 0.9);

  const resize = () => {
    const r = host.getBoundingClientRect();
    width = Math.max(1, r.width); height = Math.max(1, r.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    // Вся фигура с постаментом: 2 м в высоту, около 0,9 м в ширину с запасом на поворот
    dMax = Math.max(1.0 / t, 0.46 / (t * camera.aspect)) * 1.04;
    if (goal.dist > dMax || !started) goal.dist = dMax;
    if (!started) cur.dist = dMax;
    invalidate();
  };

  const zoomT = () => THREE.MathUtils.clamp((dMax - cur.dist) / (dMax - D_MIN), 0, 1);
  const target = new THREE.Vector3();
  const placeCamera = () => {
    target.lerpVectors(CENTER, focus.cur, smooth(zoomT()));
    const cp = Math.cos(cur.pitch);
    camera.position.set(
      target.x + Math.sin(cur.yaw) * cp * cur.dist,
      target.y + Math.sin(cur.pitch) * cur.dist,
      target.z + Math.cos(cur.yaw) * cp * cur.dist,
    );
    camera.lookAt(target);
  };

  // Наклейка
  const decal = {
    mesh: null, texture: null, ratio: 1, cm: 20, angle: 0,
    point: new THREE.Vector3(), normal: new THREE.Vector3(0, 0, 1), up: new THREE.Vector3(0, 1, 0),
  };
  const decalMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9c0b6, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, roughness: 0.85, metalness: 0, opacity: 0,
  });
  const decalSize = new THREE.Vector3();
  const sizeOf = () => {
    const long = (decal.cm * PAD) / 100;
    return decal.ratio >= 1 ? [long, long / decal.ratio] : [long * decal.ratio, long];
  };
  const basis = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const ax = new THREE.Vector3(), ay = new THREE.Vector3(), az = new THREE.Vector3();
  const patch = new THREE.BufferGeometry();
  const patchMesh = new THREE.Mesh(patch);
  patchMesh.updateMatrixWorld();

  function rebuild() {
    if (!decal.texture) return;
    const [w, h] = sizeOf();
    const depth = Math.min(0.2, Math.max(w, h) * 0.7);
    decalSize.set(w, h, depth);
    az.copy(decal.normal).normalize();
    ay.copy(decal.up).addScaledVector(az, -decal.up.dot(az)).normalize();
    ax.crossVectors(ay, az).normalize();
    basis.makeBasis(ax, ay, az);
    euler.setFromRotationMatrix(basis);
    // Кусок тела: треугольники рядом с точкой, повёрнутые к наклейке (чтобы рисунок не прошёл насквозь руку или ногу)
    const r2 = (Math.hypot(w, h) / 2 + 0.02) ** 2;
    const px = decal.point.x, py = decal.point.y, pz = decal.point.z;
    stamp++;
    let seed = -1, best = Infinity;
    for (let t = 0; t < triCount; t++) {
      const dx = cen[t * 3] - px, dy = cen[t * 3 + 1] - py, dz = cen[t * 3 + 2] - pz;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (!skin[t] || d2 > r2) continue;
      if (fno[t * 3] * az.x + fno[t * 3 + 1] * az.y + fno[t * 3 + 2] * az.z < 0.12) continue;
      mark[t] = stamp;
      if (d2 < best) { best = d2; seed = t; }
    }
    // от ближайшего к точке треугольника по соседям
    const list = [];
    if (seed >= 0) {
      mark[seed] = 0;
      list.push(seed);
      for (let q = 0; q < list.length; q++) {
        const t = list[q];
        for (let j = 0; j < 3; j++) {
          const vi = index[t * 3 + j];
          for (let k = vtStart[vi]; k < vtStart[vi + 1]; k++) {
            const u = vtList[k];
            if (mark[u] === stamp) { mark[u] = 0; list.push(u); }
          }
        }
      }
    }
    const sub = new Float32Array(list.length * 9);
    const subN = new Float32Array(list.length * 9);
    list.forEach((t, k) => {
      for (let j = 0; j < 3; j++) {
        const vi = index[t * 3 + j] * 3;
        sub[k * 9 + j * 3] = pos[vi]; sub[k * 9 + j * 3 + 1] = pos[vi + 1]; sub[k * 9 + j * 3 + 2] = pos[vi + 2];
        subN[k * 9 + j * 3] = normal[vi]; subN[k * 9 + j * 3 + 1] = normal[vi + 1]; subN[k * 9 + j * 3 + 2] = normal[vi + 2];
      }
    });
    patch.setAttribute("position", new THREE.BufferAttribute(sub, 3));
    patch.setAttribute("normal", new THREE.BufferAttribute(subN, 3));
    const g = new DecalGeometry(patchMesh, decal.point, euler, decalSize);
    if (decal.mesh) { decal.mesh.geometry.dispose(); decal.mesh.geometry = g; }
    else { decal.mesh = new THREE.Mesh(g, decalMaterial); decal.mesh.renderOrder = 1; scene.add(decal.mesh); }
    invalidate();
  }
  let rebuildQueued = false;
  const queueRebuild = () => { if (!rebuildQueued) { rebuildQueued = true; requestAnimationFrame(() => { rebuildQueued = false; rebuild(); }); } };

  // Луч по телу: точка и сглаженная нормаль (из нормалей вершин треугольника)
  const raycaster = new THREE.Raycaster();
  raycaster.firstHitOnly = true;
  const hitInfo = (hit) => {
    const f = hit.face;
    const n = new THREE.Vector3();
    const b = hit.barycoord || new THREE.Vector3(1 / 3, 1 / 3, 1 / 3);
    n.x = normal[f.a * 3] * b.x + normal[f.b * 3] * b.y + normal[f.c * 3] * b.z;
    n.y = normal[f.a * 3 + 1] * b.x + normal[f.b * 3 + 1] * b.y + normal[f.c * 3 + 1] * b.z;
    n.z = normal[f.a * 3 + 2] * b.x + normal[f.b * 3 + 2] * b.y + normal[f.c * 3 + 2] * b.z;
    return { point: hit.point.clone(), normal: n.normalize() };
  };
  const castFrom = (origin, dir) => {
    raycaster.set(origin, dir);
    const hit = raycaster.intersectObject(statue, false)[0];
    return hit ? hitInfo(hit) : null;
  };
  const ndc = new THREE.Vector2();
  const castScreen = (x, y) => {
    ndc.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObject(statue, false)[0];
    return hit ? { ...hitInfo(hit), dir: raycaster.ray.direction.clone() } : null;
  };
  // Направление проекции: нормаль тела, чуть подтянутая к взгляду, чтобы на изгибах рисунок не съезжал вбок
  const projNormal = (n, viewDir) => n.clone().multiplyScalar(0.65).addScaledVector(viewDir, -0.35).normalize();

  const upFromAngle = (yaw, deg) => {
    const a = THREE.MathUtils.degToRad(deg);
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    return new THREE.Vector3(0, 1, 0).multiplyScalar(Math.cos(a)).addScaledVector(right, Math.sin(a));
  };

  const frameDecal = (yaw) => {
    const [w, h] = sizeOf();
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const need = Math.max(h * 3.4, (w * 3.4) / camera.aspect, 0.9);
    goal.dist = THREE.MathUtils.clamp(need / (2 * t), D_MIN + 0.4, dMax * 0.7);
    focus.goal.copy(decal.point);
    if (yaw !== undefined) {
      // кратчайший поворот
      let d = yaw - goal.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      goal.yaw += d;
    }
    goal.pitch = 0.04;
    invalidate();
  };

  let place = "thigh";
  function setPlace(id, { frame = true } = {}) {
    const p = PLACES[id];
    if (!p) return;
    place = id;
    const at = new THREE.Vector3(...p.at);
    const dir = new THREE.Vector3(-Math.sin(p.ray), 0, -Math.cos(p.ray));
    const hit = castFrom(at.clone().addScaledVector(dir, -3), dir);
    if (!hit) return;
    decal.point.copy(hit.point);
    decal.normal.copy(projNormal(hit.normal, dir));
    decal.up.copy(upFromAngle(p.ray, p.angle));
    rebuild();
    if (frame) frameDecal(p.view);
  }

  let swapToken = 0;
  async function setSketch(srcUrl, cm) {
    const token = ++swapToken;
    const img = await loadImage(srcUrl);
    if (token !== swapToken) return;
    const { texture, ratio } = inkTexture(img);
    const old = decal.texture;
    // плавная смена: старый рисунок гаснет, новый проявляется
    await fadeTo(0, 220);
    if (token !== swapToken) { texture.dispose(); return; }
    decal.texture = texture; decal.ratio = ratio; decal.cm = cm;
    decalMaterial.map = texture; decalMaterial.needsUpdate = true;
    old?.dispose();
    rebuild();
    fadeTo(1, 420);
  }
  function setSize(cm) { decal.cm = cm; queueRebuild(); }
  function setView(name) {
    const yaw = VIEWS[name];
    if (yaw === undefined) return;
    let d = yaw - goal.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    goal.yaw += d; goal.pitch = 0.06; goal.dist = dMax; focus.goal.copy(CENTER);
    invalidate();
  }

  let fade = null;
  const fadeTo = (to, ms) => new Promise((resolve) => {
    fade = { from: decalMaterial.opacity, to, start: performance.now(), ms, resolve };
    invalidate();
  });

  // Управление: перетаскивание по телу вращает фигуру, по рисунку — двигает его; щипок и колесо — приближение; касание тела — переносит рисунок
  const pointers = new Map();
  // Приближаем к точке тела под курсором или между пальцами
  const aimAt = (cx, cy) => {
    const r = canvas.getBoundingClientRect();
    const hit = castScreen(cx - r.left, cy - r.top);
    if (hit) focus.goal.copy(hit.point);
  };
  let mode = null, startX = 0, startY = 0, moved = 0, pinch0 = 0, dist0 = 0;
  const onSketch = (hit) => {
    if (!hit || !decal.mesh) return false;
    const [w, h] = sizeOf();
    return hit.point.distanceTo(decal.point) < Math.max(w, h) * 0.45;
  };
  canvas.addEventListener("pointerdown", (e) => {
    host.closest("[data-tryon-stage]")?.classList.add("is-touched");
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = canvas.getBoundingClientRect();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y); dist0 = goal.dist; mode = "pinch";
      aimAt((a.x + b.x) / 2, (a.y + b.y) / 2);
      return;
    }
    startX = e.clientX; startY = e.clientY; moved = 0;
    const hit = castScreen(e.clientX - r.left, e.clientY - r.top);
    mode = onSketch(hit) ? "drag" : "turn";
    if (mode === "drag") host.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.pointerType === "mouse" && !pointers.size) {
      // фонарь тянется к курсору
      lightGoal.set(-1.1 + ((e.clientX - r.left) / width - 0.5) * 1.6, 0.9 - ((e.clientY - r.top) / height - 0.5) * 1.2);
      host.classList.toggle("is-over-sketch", onSketch(castScreen(e.clientX - r.left, e.clientY - r.top)));
      invalidate();
      return;
    }
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    moved = Math.max(moved, Math.hypot(e.clientX - startX, e.clientY - startY));
    if (mode === "pinch" && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      goal.dist = THREE.MathUtils.clamp(dist0 * (pinch0 / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y))), D_MIN, dMax);
    } else if (mode === "turn") {
      goal.yaw -= dx * 0.0065;
      goal.pitch = THREE.MathUtils.clamp(goal.pitch + dy * 0.004, -0.25, 0.45);
    } else if (mode === "drag") {
      const hit = castScreen(e.clientX - r.left, e.clientY - r.top);
      if (hit) {
        // держим «верх» рисунка, подстраивая его под новый наклон кожи
        decal.point.copy(hit.point);
        decal.normal.copy(projNormal(hit.normal, hit.dir));
        queueRebuild();
      }
    }
    invalidate();
  });
  const release = (e) => {
    const was = mode;
    pointers.delete(e.pointerId);
    if (pointers.size) { mode = "turn"; const p = [...pointers.values()][0]; startX = p.x; startY = p.y; moved = 99; return; }
    host.classList.remove("is-dragging");
    mode = null;
    if (was === "turn" && moved < 6 && e.type === "pointerup") {
      const r = canvas.getBoundingClientRect();
      const hit = castScreen(e.clientX - r.left, e.clientY - r.top);
      if (hit) {
        decal.point.copy(hit.point);
        decal.normal.copy(projNormal(hit.normal, hit.dir));
        decal.up.copy(upFromAngle(cur.yaw, 0));
        rebuild();
        focus.goal.copy(hit.point);
        api.onMove?.();
      }
    }
    if (was === "drag") api.onMove?.();
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !pointers.size) host.classList.remove("is-over-sketch"); });
  canvas.addEventListener("wheel", (e) => {
    // у края приближения колесо снова листает страницу
    if ((e.deltaY > 0 && goal.dist >= dMax - 0.001) || (e.deltaY < 0 && goal.dist <= D_MIN + 0.001)) return;
    e.preventDefault();
    if (e.deltaY < 0) aimAt(e.clientX, e.clientY);
    goal.dist = THREE.MathUtils.clamp(goal.dist * Math.exp(e.deltaY * 0.0007), D_MIN, dMax);
    invalidate();
  }, { passive: false });

  // Отрисовка только пока что-то движется и холст виден
  let raf = 0, last = 0, visible = true, started = false;
  const settled = () =>
    Math.abs(goal.yaw - cur.yaw) < 1e-4 && Math.abs(goal.pitch - cur.pitch) < 1e-4 && Math.abs(goal.dist - cur.dist) < 1e-4 &&
    focus.cur.distanceToSquared(focus.goal) < 1e-8 && lantern.position.x === lightGoal.x && lantern.position.y === lightGoal.y && !fade;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    const k = damp(7, dt);
    cur.yaw += (goal.yaw - cur.yaw) * k;
    cur.pitch += (goal.pitch - cur.pitch) * k;
    cur.dist += (goal.dist - cur.dist) * damp(6, dt);
    focus.cur.lerp(focus.goal, damp(5, dt));
    const lk = damp(4, dt);
    lantern.position.x += (lightGoal.x - lantern.position.x) * lk;
    lantern.position.y += (lightGoal.y - lantern.position.y) * lk;
    if (Math.abs(lightGoal.x - lantern.position.x) < 1e-4) lantern.position.x = lightGoal.x;
    if (Math.abs(lightGoal.y - lantern.position.y) < 1e-4) lantern.position.y = lightGoal.y;
    if (fade) {
      const t = Math.min(1, (now - fade.start) / fade.ms);
      decalMaterial.opacity = fade.from + (fade.to - fade.from) * smooth(t);
      if (t >= 1) { const f = fade; fade = null; f.resolve(); }
    }
    placeCamera();
    renderer.render(scene, camera);
    if (!settled() && visible) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  function invalidate() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) invalidate(); });
  io.observe(host);
  host.appendChild(canvas);
  resize();
  started = true;
  placeCamera();

  const api = {
    setSketch, setSize, setPlace, setView,
    get place() { return place; },
    onMove: null,
    resize,
    // для проверки: точка на экране → место на теле
    debug: {
      cur, goal, castScreen,
      screenOf: () => { const v = decal.point.clone().project(camera); return { x: (v.x + 1) / 2 * width, y: (1 - v.y) / 2 * height }; },
    },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      geometry.disposeBoundsTree?.(); geometry.dispose(); plaster.dispose(); decalMaterial.dispose(); leafMaterial.dispose(); leafSrc?.geometry.dispose();
      decal.texture?.dispose(); decal.mesh?.geometry.dispose(); renderer.dispose(); canvas.remove();
    },
  };
  return api;
}
