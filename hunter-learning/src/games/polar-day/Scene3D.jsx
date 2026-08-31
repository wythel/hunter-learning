import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { TILT, declinationForSeason, seasonForOrbit } from './geometry';
import earthDayUrl from './assets/earth_atmos_2048.jpg';
import earthLightsUrl from './assets/earth_lights_2048.png';
import earthCloudsUrl from './assets/earth_clouds_1024.png';

// ── 一個 3D 宇宙、兩種鏡頭 ──
// 太陽（點光源）在原點，地球帶固定傾斜的地軸繞軌道公轉。
// 晝夜分界線不是畫出來的：它就是真實光照的結果，物理天生正確。
//
// 相位約定（與 SkyView 一致）：spin=0 = 當地午夜。
// 小人與地表貼圖同組旋轉（黏在地面上），組的 rotation.y 以
// 「正午方向」為基準——正午方向 = 地球→太陽在赤道面上的投影。

const rad = d => (d * Math.PI) / 180;
const TILT_RAD = rad(TILT);
const ORBIT_R = 13;      // 軌道半徑
const EARTH_R = 1.5;     // 地球半徑
const SUN_R = 2.4;       // 太陽半徑

const SEASONS = [
  { key: 'spring', th: 0,   name: '春', icon: '🌱' },
  { key: 'summer', th: 90,  name: '夏', icon: '☀️' },
  { key: 'autumn', th: 180, name: '秋', icon: '🍂' },
  { key: 'winter', th: 270, name: '冬', icon: '❄️' },
];

// 公轉角 → 世界座標（夏至時地球在 -X，地軸朝 +X 傾 → 北極朝太陽）
function orbitPos(orbitDeg) {
  const tw = rad(orbitDeg + 90);
  return [ORBIT_R * Math.cos(tw), 0, ORBIT_R * Math.sin(tw)];
}

// ── 太陽：發光球 + 加法混合的光暈 sprite（貼圖用 canvas 現做，零資產） ──
function Sun() {
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,240,190,1)');
    g.addColorStop(0.25, 'rgba(255,210,90,0.55)');
    g.addColorStop(0.6, 'rgba(255,160,50,0.16)');
    g.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[SUN_R, 48, 48]} />
        <meshBasicMaterial color="#ffdf6b" />
      </mesh>
      <sprite scale={[13, 13, 1]}>
        <spriteMaterial map={glowTex} transparent depthWrite={false}
          blending={THREE.AdditiveBlending} />
      </sprite>
      {/* 陽光：decay=0 平行感點光源，晝夜分界全靠它。
          強度偏高：側面看時 Lambert 衰減會把亮半球壓暗，
          拉高強度讓「一半亮」讀得出來（限亮處由 tone mapping 收斂）。 */}
      <pointLight intensity={4.2} decay={0} color="#fff2d0" />
    </group>
  );
}

// ── 大氣光暈：背面 fresnel shader ──
const ATMOS_VERT = `
varying vec3 vNormal; varying vec3 vView;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const ATMOS_FRAG = `
varying vec3 vNormal; varying vec3 vView;
void main(){
  float intensity = pow(0.52 - dot(vNormal, vView), 2.4);
  gl_FragColor = vec4(0.30, 0.56, 1.0, 1.0) * intensity * 0.85;
}`;

// ── 「一半亮」示意圖層：受光半球疊一層暖色罩 ──
// 真實 Lambert 光照在側面看會把亮半球壓成漸暗月牙（物理正確、教學難讀），
// 這層用世界座標法線 vs 太陽方向直接標出「亮的一半」，跟老版 SVG 圖解一樣直白。
const WASH_VERT = `
varying vec3 vWorldNormal;
void main(){
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const WASH_FRAG = `
uniform vec3 uSunDir;
varying vec3 vWorldNormal;
void main(){
  float d = dot(normalize(vWorldNormal), uSunDir);
  float m = smoothstep(-0.02, 0.18, d);
  gl_FragColor = vec4(1.0, 0.88, 0.55, m * 0.30);
}`;

function Earth({ orbitAngle, spin, latitude, mode }) {
  const [dayMap, lightsMap, cloudsMap] = useLoader(THREE.TextureLoader,
    [earthDayUrl, earthLightsUrl, earthCloudsUrl]);

  const pos = orbitPos(orbitAngle);

  // 地球→太陽方向（世界座標）＋晝夜分界大圓的擺向（每 render 直接算，很便宜）
  const sunDir = new THREE.Vector3(-pos[0], 0, -pos[2]).normalize();
  const termQuat = new THREE.Quaternion()
    .setFromUnitVectors(new THREE.Vector3(0, 0, 1), sunDir);

  // 亮半球罩的 uniform：物件身分固定，值在 frame loop 跟著公轉更新
  const [washUniforms] = useState(() => ({ uSunDir: { value: new THREE.Vector3(1, 0, 0) } }));
  useFrame(() => {
    washUniforms.uSunDir.value.copy(sunDir);
  });

  // 正午方向（傾斜座標系內）：地球→太陽的單位向量轉進 local frame
  //   sLocal = Rz(+TILT)·(-P̂)；rotation.y=ψ 時 local +X 對到 (cosψ,0,-sinψ)
  const tw = rad(orbitAngle + 90);
  const noon = Math.atan2(Math.sin(tw), -Math.cos(tw) * Math.cos(TILT_RAD));
  const ground = noon + Math.PI + rad(spin);   // +π：spin=0 = 午夜

  // 小人亮不亮：跟 SkyView 同一條太陽高度公式（保證兩視角一致）
  const phi = rad(latitude);
  const dec = rad(declinationForSeason(seasonForOrbit(orbitAngle)));
  const sinAlt = Math.sin(phi) * Math.sin(dec)
    + Math.cos(phi) * Math.cos(dec) * Math.cos(rad(spin + 180));
  const lit = sinAlt > 0;

  const ringR = EARTH_R * Math.cos(phi);
  const ringY = EARTH_R * Math.sin(phi);

  return (
    <group position={pos}>
      {/* 傾斜座標系：地軸永遠朝 +X 傾 23.4°（公轉一整年都不變） */}
      <group rotation={[0, 0, -TILT_RAD]}>
        {/* 地球本體：白天貼圖 + 夜面城市燈光 */}
        <mesh rotation={[0, ground, 0]}>
          <sphereGeometry args={[EARTH_R, 64, 64]} />
          <meshStandardMaterial map={dayMap} roughness={0.55} metalness={0}
            map-colorSpace={THREE.SRGBColorSpace} map-anisotropy={4}
            emissive="#ffc46b" emissiveIntensity={0.5} emissiveMap={lightsMap}
            emissiveMap-colorSpace={THREE.SRGBColorSpace} />
        </mesh>

        {/* 雲層（比地面稍快，活起來） */}
        <mesh rotation={[0, ground * 1.08, 0]} scale={1.012}>
          <sphereGeometry args={[EARTH_R, 48, 48]} />
          <meshStandardMaterial map={cloudsMap} transparent opacity={0.5}
            depthWrite={false} roughness={1} />
        </mesh>

        {/* 地軸 */}
        <mesh>
          <cylinderGeometry args={[0.018, 0.018, EARTH_R * 2.9, 8]} />
          <meshBasicMaterial color="#dbe4f2" transparent opacity={0.6} />
        </mesh>
        <Html position={[0, EARTH_R * 1.62, 0]} center distanceFactor={9} occlude
          style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#e9edf7',
            textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>北</div>
        </Html>

        {/* 你住的緯度圈 */}
        <mesh position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.max(ringR, 0.02), 0.016, 8, 96]} />
          <meshBasicMaterial color="#ffd43b" transparent opacity={0.9} />
        </mesh>

        {/* 小人：跟地表同組旋轉（黏在地面上） */}
        <group rotation={[0, ground, 0]}>
          <group position={[ringR * 1.02, ringY * 1.02, 0]}>
            <mesh>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color={lit ? '#ffd43b' : '#5c749e'} />
            </mesh>
            {lit && (
              <mesh>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshBasicMaterial color="#ffd43b" transparent opacity={0.28} />
              </mesh>
            )}
            <Html position={[0, 0.22, 0]} center distanceFactor={9} occlude
              style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
              <div style={{ fontSize: 17, filter: lit ? 'none' : 'grayscale(0.7) brightness(0.75)' }}>🧍</div>
            </Html>
          </group>
        </group>
      </group>

      {/* 亮半球示意罩：直接標出「亮的一半」 */}
      <mesh scale={1.004}>
        <sphereGeometry args={[EARTH_R, 48, 48]} />
        <shaderMaterial vertexShader={WASH_VERT} fragmentShader={WASH_FRAG}
          uniforms={washUniforms} transparent depthWrite={false} />
      </mesh>

      {/* 晝夜分界大圓 */}
      <mesh quaternion={termQuat}>
        <torusGeometry args={[EARTH_R * 1.012, 0.014, 8, 96]} />
        <meshBasicMaterial color="#ffe9a8" transparent opacity={0.55} />
      </mesh>

      {/* 一半一半模式：☀️／🌙 標籤 */}
      {mode === 'half' && (
        <>
          <Html position={sunDir.clone().multiplyScalar(EARTH_R * 1.55).toArray()}
            center distanceFactor={11} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
            <div style={{ fontSize: 22, textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>☀️</div>
          </Html>
          <Html position={sunDir.clone().multiplyScalar(-EARTH_R * 1.55).toArray()}
            center distanceFactor={11} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
            <div style={{ fontSize: 22, textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>🌙</div>
          </Html>
        </>
      )}

      {/* 大氣光暈 */}
      <mesh scale={1.1}>
        <sphereGeometry args={[EARTH_R, 48, 48]} />
        <shaderMaterial vertexShader={ATMOS_VERT} fragmentShader={ATMOS_FRAG}
          blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── 軌道環 + 四季標記（總覽鏡頭才看得清，一直都在） ──
function OrbitRing({ orbitAngle, mode }) {
  const activeKey = useMemo(() => {
    const t = ((orbitAngle % 360) + 360) % 360;
    let best = SEASONS[0], bestD = 999;
    for (const s of SEASONS) {
      const d = Math.min(Math.abs(t - s.th), 360 - Math.abs(t - s.th));
      if (d < bestD) { bestD = d; best = s; }
    }
    return best.key;
  }, [orbitAngle]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ORBIT_R - 0.03, ORBIT_R + 0.03, 128]} />
        <meshBasicMaterial color="#8fb3d8" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      {mode === 'wide' && SEASONS.map(s => {
        const p = orbitPos(s.th);
        const active = s.key === activeKey;
        return (
          <group key={s.key} position={p}>
            <mesh>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshBasicMaterial color={active ? '#ffd43b' : '#8fb3d8'} />
            </mesh>
            <Html position={[0, 1.15, 0]} center distanceFactor={26}
              style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
              <div style={{
                textAlign: 'center', whiteSpace: 'nowrap',
                opacity: active ? 1 : 0.75, transform: active ? 'scale(1.15)' : 'none',
                transition: 'all .3s',
              }}>
                <div style={{ fontSize: 15 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 900,
                  color: active ? '#ffd43b' : '#b9c9de',
                  textShadow: '0 0 8px rgba(0,0,0,0.95)' }}>{s.name}</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ── 鏡頭：兩個運鏡位平滑飛行 ──
function CameraRig({ orbitAngle, mode }) {
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const tmp = useRef({ pos: new THREE.Vector3(), aim: new THREE.Vector3() }).current;

  useFrame(({ camera }, dt) => {
    const p = orbitPos(orbitAngle);
    const P = tmp.aim.set(p[0], p[1], p[2]);

    if (mode === 'wide') {
      tmp.pos.set(0, 20, 26);
      P.set(0, 0, 0);
    } else {
      const s0 = P.clone().normalize().negate();               // 地球→太陽
      const side = new THREE.Vector3(0, 1, 0).cross(s0).normalize();
      if (mode === 'half') {
        // 一半一半：正側面看太陽—地球連線，晝夜分界剛好平分地球
        tmp.pos.copy(P)
          .addScaledVector(side, 5.4)
          .add(new THREE.Vector3(0, 1.1, 0));
      } else {
        // 靠近地球：離「正午方向」45°，亮面為主、晝夜分界清楚入鏡
        tmp.pos.copy(P)
          .addScaledVector(side, 3.3)
          .addScaledVector(s0, 3.3)
          .add(new THREE.Vector3(0, 1.6, 0));
      }
    }

    const k = 1 - Math.exp(-3.2 * Math.min(dt, 0.05));
    camera.position.lerp(tmp.pos, k);
    look.current.lerp(P, k);
    camera.lookAt(look.current);
  });
  return null;
}

export default function Scene3D({ orbitAngle, spin, latitude, mode }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 15, 21], fov: 42 }}
      gl={{ antialias: true }} style={{ background: 'transparent' }}>
      <color attach="background" args={['#050a18']} />
      <ambientLight intensity={0.16} />
      <Stars radius={70} depth={35} count={2200} factor={3.2} saturation={0} fade speed={0.5} />
      <Sun />
      <OrbitRing orbitAngle={orbitAngle} mode={mode} />
      <Suspense fallback={null}>
        <Earth orbitAngle={orbitAngle} spin={spin} latitude={latitude} mode={mode} />
      </Suspense>
      <CameraRig orbitAngle={orbitAngle} mode={mode} />
    </Canvas>
  );
}
