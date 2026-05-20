import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SimulationParams } from '../../physics/diffraction';
import { calculateGratingSpacing, wavelengthToRGB } from '../../physics/diffraction';

interface LabViewportProps {
  params: SimulationParams;
  laserOn: boolean;
}

export const LabViewport = ({ params, laserOn }: LabViewportProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const screenGroupRef = useRef<THREE.Group | null>(null);
  const laserBeamGroupRef = useRef<THREE.Group | null>(null);
  const spotsGroupRef = useRef<THREE.Group | null>(null);

  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1e2e'); // Visible dark-blue-grey, NOT pure black
    scene.fog = new THREE.Fog('#1a1e2e', 8, 18); // Soft atmospheric depth
    sceneRef.current = scene;

    // --- CAMERA ---
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(1.6, 1.4, 2.4);
    cameraRef.current = camera;

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // No tone mapping — we want full brightness control
    renderer.toneMapping = THREE.NoToneMapping;
    
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 0.6;
    controls.maxDistance = 8.0;
    controls.target.set(0, 0.22, 0.3);
    controlsRef.current = controls;

    // --- LIGHTING (BRIGHT enough to see all apparatus clearly) ---
    // Strong ambient so nothing is pitch black
    const ambientLight = new THREE.AmbientLight('#b0c4de', 0.7);
    scene.add(ambientLight);

    // Key light from above-right (warm white)
    const keyLight = new THREE.DirectionalLight('#ffffff', 1.8);
    keyLight.position.set(2, 4, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Fill light from front-left (cool blue)
    const fillLight = new THREE.DirectionalLight('#a5b4fc', 0.8);
    fillLight.position.set(-2, 2, 3);
    scene.add(fillLight);

    // Rim light from behind (makes apparatus edges pop)
    const rimLight = new THREE.DirectionalLight('#93c5fd', 0.6);
    rimLight.position.set(0, 1, -3);
    scene.add(rimLight);

    // Point light on the bench for nice specular highlights
    const benchSpot = new THREE.PointLight('#e2e8f0', 2.0, 6);
    benchSpot.position.set(0, 1.5, 0);
    scene.add(benchSpot);

    // --- FLOOR / GROUND ---
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: '#2d3250', roughness: 0.9, metalness: 0.0 
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.65;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // === APPARATUS MATERIALS (Bright, clearly visible) ===
    const benchMat = new THREE.MeshStandardMaterial({
      color: '#4a5568', roughness: 0.35, metalness: 0.7
    });
    const supportMat = new THREE.MeshStandardMaterial({
      color: '#64748b', roughness: 0.4, metalness: 0.6
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8', roughness: 0.3, metalness: 0.8
    });
    const mountAccentMat = new THREE.MeshStandardMaterial({
      color: '#7c8db5', roughness: 0.3, metalness: 0.7
    });

    // === OPTICAL BENCH TABLE ===
    const benchGeo = new THREE.BoxGeometry(4.5, 0.08, 0.5);
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.y = -0.04;
    benchMesh.receiveShadow = true;
    benchMesh.castShadow = true;
    scene.add(benchMesh);

    // Bench rail grooves (two thin bright lines on top)
    const railMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.2 });
    for (const zOff of [-0.12, 0.12]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.015, 0.025), railMat);
      rail.position.set(0, 0.005, zOff);
      scene.add(rail);
    }

    // Grid markings on the bench
    const gridHelper = new THREE.GridHelper(4.0, 40, '#8b9dc3', '#5a6a8a');
    gridHelper.position.y = 0.005;
    gridHelper.scale.z = 0.12;
    scene.add(gridHelper);

    // Bench legs
    for (const xPos of [-2.0, 2.0]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.5), supportMat);
      leg.position.set(xPos, -0.34, 0);
      leg.castShadow = true;
      scene.add(leg);
    }

    // === LASER SOURCE (z = -1.2) ===
    const laserGroup = new THREE.Group();
    laserGroup.position.set(0, 0, -1.2);
    
    // Mount base
    const lMountBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.22), mountAccentMat);
    lMountBase.position.y = 0.03;
    lMountBase.castShadow = true;
    laserGroup.add(lMountBase);

    // Vertical support rod
    const lRod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 12), frameMat);
    lRod.position.y = 0.14;
    lRod.castShadow = true;
    laserGroup.add(lRod);

    // Laser tube body — bright metallic silver-grey
    const laserBodyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.32, 20);
    laserBodyGeo.rotateX(Math.PI / 2);
    const laserBodyMat = new THREE.MeshStandardMaterial({
      color: '#9ca3af', roughness: 0.15, metalness: 0.95
    });
    const laserBody = new THREE.Mesh(laserBodyGeo, laserBodyMat);
    laserBody.position.y = 0.24;
    laserBody.castShadow = true;
    laserGroup.add(laserBody);

    // Laser housing cap / heat-sink rings
    for (const zOff of [-0.08, 0, 0.08]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.005, 8, 20),
        new THREE.MeshStandardMaterial({ color: '#6b7280', metalness: 0.9 })
      );
      ring.position.set(0, 0.24, zOff);
      ring.rotation.x = Math.PI / 2;
      laserGroup.add(ring);
    }

    // Emitter nozzle at front (+z direction)
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: '#374151', metalness: 0.95, roughness: 0.1 })
    );
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(0, 0.24, 0.18);
    laserGroup.add(nozzle);

    // "LASER" label (bright accent indicator on body)
    const labelGeo = new THREE.BoxGeometry(0.08, 0.008, 0.005);
    const labelMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0, 0.29, -0.06);
    laserGroup.add(label);

    scene.add(laserGroup);

    // === DIFFRACTION GRATING (z = 0.0) ===
    const gratingGroup = new THREE.Group();
    gratingGroup.position.set(0, 0, 0);

    const gBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.14), mountAccentMat);
    gBase.position.y = 0.03;
    gBase.castShadow = true;
    gratingGroup.add(gBase);

    const gRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12), frameMat);
    gRod.position.y = 0.14;
    gRod.castShadow = true;
    gratingGroup.add(gRod);

    // Grating holder frame — clearly bright
    const gratingFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.20, 0.018), frameMat);
    gratingFrame.position.y = 0.26;
    gratingFrame.castShadow = true;
    gratingGroup.add(gratingFrame);

    // Inner cutout — glass grating surface (translucent blue-tinted)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#e0e7ff',
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const gratingGlass = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.008), glassMat);
    gratingGlass.position.y = 0.26;
    gratingGroup.add(gratingGlass);

    // Grating lines etched texture (visible fine bright lines on the glass)
    for (let i = -5; i <= 5; i++) {
      const lineGeo = new THREE.BoxGeometry(0.001, 0.12, 0.009);
      const lineMat = new THREE.MeshBasicMaterial({ color: '#c7d2fe', transparent: true, opacity: 0.5 });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(i * 0.008, 0.26, 0);
      gratingGroup.add(lineMesh);
    }

    scene.add(gratingGroup);

    // === OBSERVATION SCREEN (dynamic z) ===
    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, 0, params.screenDistance);
    screenGroupRef.current = screenGroup;

    const sBase = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.18), mountAccentMat);
    sBase.position.y = 0.03;
    sBase.castShadow = true;
    screenGroup.add(sBase);

    const sRod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 12), frameMat);
    sRod.position.y = 0.14;
    sRod.castShadow = true;
    screenGroup.add(sRod);

    // Screen frame
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.38, 0.015), frameMat);
    screenFrame.position.y = 0.26;
    screenFrame.castShadow = true;
    screenGroup.add(screenFrame);

    // Screen projection canvas — bright white so spots POP against it
    const canvasMat = new THREE.MeshBasicMaterial({
      color: '#f1f5f9',
      side: THREE.DoubleSide
    });
    const canvasMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.34, 0.008), canvasMat);
    canvasMesh.position.set(0, 0.26, -0.005);
    screenGroup.add(canvasMesh);

    // Ruler marks along screen bottom
    for (let i = -5; i <= 5; i++) {
      const tickH = i === 0 ? 0.025 : 0.012;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.002, tickH, 0.009),
        new THREE.MeshBasicMaterial({ color: '#374151' })
      );
      tick.position.set(i * 0.04, 0.26 - 0.17 + tickH / 2, -0.005);
      screenGroup.add(tick);
    }

    // Spots container
    const spotsGroup = new THREE.Group();
    spotsGroup.position.set(0, 0.26, -0.01);
    spotsGroupRef.current = spotsGroup;
    screenGroup.add(spotsGroup);

    scene.add(screenGroup);

    // === LASER BEAMS GROUP (dynamic) ===
    const laserBeamGroup = new THREE.Group();
    laserBeamGroupRef.current = laserBeamGroup;
    scene.add(laserBeamGroup);

    // --- ANIMATION LOOP ---
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // --- RESIZE ---
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  // === DYNAMIC UPDATE: beams + spots when params change ===
  useEffect(() => {
    const screenGroup = screenGroupRef.current;
    const laserBeamGroup = laserBeamGroupRef.current;
    const spotsGroup = spotsGroupRef.current;
    
    if (!screenGroup || !laserBeamGroup || !spotsGroup) return;

    // Move screen to match distance
    screenGroup.position.z = params.screenDistance;

    // Clear old dynamic objects
    while (laserBeamGroup.children.length > 0) laserBeamGroup.remove(laserBeamGroup.children[0]);
    while (spotsGroup.children.length > 0) spotsGroup.remove(spotsGroup.children[0]);

    if (!laserOn) return;

    const colorInfo = wavelengthToRGB(params.wavelength);
    const laserGlowColor = new THREE.Color(colorInfo.hex);

    // --- MAIN BEAM: Laser → Grating (thick, vivid, clearly visible) ---
    // Outer glow beam (thick, transparent, colored)
    const outerBeamGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.2, 12);
    outerBeamGeo.rotateX(Math.PI / 2);
    const outerBeamMat = new THREE.MeshBasicMaterial({
      color: laserGlowColor,
      transparent: true,
      opacity: 0.55
    });
    const outerBeam = new THREE.Mesh(outerBeamGeo, outerBeamMat);
    outerBeam.position.set(0, 0.24, -0.6);
    laserBeamGroup.add(outerBeam);

    // Inner core beam (bright white center)
    const innerBeamGeo = new THREE.CylinderGeometry(0.006, 0.006, 1.2, 12);
    innerBeamGeo.rotateX(Math.PI / 2);
    const innerBeamMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const innerBeam = new THREE.Mesh(innerBeamGeo, innerBeamMat);
    innerBeam.position.set(0, 0.24, -0.6);
    laserBeamGroup.add(innerBeam);

    // Extra wide halo glow (very faint, wide, gives volumetric feel)
    const haloGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
    haloGeo.rotateX(Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: laserGlowColor,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    const haloBeam = new THREE.Mesh(haloGeo, haloMat);
    haloBeam.position.set(0, 0.24, -0.6);
    laserBeamGroup.add(haloBeam);

    // --- DIFFRACTED BEAMS: Grating → Screen ---
    const lambda = params.wavelength * 1e-9;
    const d = calculateGratingSpacing(params.linesPerInch);
    const maxOrder = Math.floor(d / lambda);
    const slitWidth = d * params.slitWidthRatio;

    for (let n = -maxOrder; n <= maxOrder; n++) {
      const sinTheta = (n * lambda) / d;
      if (Math.abs(sinTheta) > 1.0) continue;

      const angleRad = Math.asin(sinTheta);
      const targetX = params.screenDistance * Math.tan(angleRad);
      const targetZ = params.screenDistance;

      // Skip if off screen (allow wider range for visibility)
      if (Math.abs(targetX) > 0.28) continue;

      // Single-slit envelope intensity
      let envelope = 1.0;
      if (n !== 0) {
        const beta = (Math.PI * slitWidth * sinTheta) / lambda;
        envelope = Math.pow(Math.sin(beta) / beta, 2);
      }
      const beamIntensity = params.laserIntensity * envelope;
      if (beamIntensity < 0.01) continue;

      const beamLength = Math.sqrt(targetX * targetX + targetZ * targetZ);

      // Colored diffracted ray
      const rayGeo = new THREE.CylinderGeometry(0.006, 0.006, beamLength, 8);
      rayGeo.rotateX(Math.PI / 2);
      const rayMat = new THREE.MeshBasicMaterial({
        color: laserGlowColor,
        transparent: true,
        opacity: Math.max(0.15, Math.min(0.85, beamIntensity * 0.8))
      });
      const rayMesh = new THREE.Mesh(rayGeo, rayMat);
      rayMesh.position.set(targetX / 2, 0.24, targetZ / 2);
      rayMesh.lookAt(new THREE.Vector3(targetX, 0.24, targetZ));
      laserBeamGroup.add(rayMesh);

      // White core inside the diffracted ray
      if (beamIntensity > 0.2) {
        const coreGeo = new THREE.CylinderGeometry(0.002, 0.002, beamLength, 6);
        coreGeo.rotateX(Math.PI / 2);
        const coreMat = new THREE.MeshBasicMaterial({
          color: '#ffffff',
          transparent: true,
          opacity: Math.min(0.9, beamIntensity * 0.7)
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(targetX / 2, 0.24, targetZ / 2);
        coreMesh.lookAt(new THREE.Vector3(targetX, 0.24, targetZ));
        laserBeamGroup.add(coreMesh);
      }

      // --- SCREEN SPOTS (large, vivid, multi-layer glow) ---
      const spotBaseRadius = 0.012 + params.laserIntensity * 0.01;
      const spotR = Math.max(0.008, spotBaseRadius - Math.abs(n) * 0.002);

      // Layer 1: White-hot core
      const coreSpot = new THREE.Mesh(
        new THREE.CircleGeometry(spotR * 0.35, 20),
        new THREE.MeshBasicMaterial({ color: '#ffffff' })
      );
      coreSpot.position.set(targetX, 0, 0);
      spotsGroup.add(coreSpot);

      // Layer 2: Bright wavelength-colored disc
      const colorSpot = new THREE.Mesh(
        new THREE.CircleGeometry(spotR, 20),
        new THREE.MeshBasicMaterial({
          color: laserGlowColor,
          transparent: true,
          opacity: Math.max(0.3, Math.min(1.0, beamIntensity))
        })
      );
      colorSpot.position.set(targetX, 0, 0);
      spotsGroup.add(colorSpot);

      // Layer 3: Wide outer glow halo
      const glowSpot = new THREE.Mesh(
        new THREE.CircleGeometry(spotR * 3.0, 20),
        new THREE.MeshBasicMaterial({
          color: laserGlowColor,
          transparent: true,
          opacity: Math.max(0.08, Math.min(0.4, beamIntensity * 0.4)),
          blending: THREE.AdditiveBlending
        })
      );
      glowSpot.position.set(targetX, 0, 0);
      spotsGroup.add(glowSpot);
    }

  }, [params, laserOn]);

  return (
    <div className="glass-card" style={{
      flex: 1,
      height: '380px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* HUD: Controls guide */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(26, 30, 46, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '5px 10px',
        borderRadius: '6px',
        pointerEvents: 'none'
      }}>
        <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.5px' }}>
          3D VIEWPORT
        </span>
        <br />
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
          Drag to Rotate • Right-Click to Pan • Scroll to Zoom
        </span>
      </div>

      {/* HUD: Laser warning */}
      {laserOn && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.6)',
          color: '#fca5a5',
          padding: '5px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          animation: 'pulse 1.5s infinite ease-in-out',
          pointerEvents: 'none'
        }}>
          ⚠️ LASER ACTIVE
        </div>
      )}
    </div>
  );
};
