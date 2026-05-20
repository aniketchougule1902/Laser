import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const Apparatus = () => {
  return (
    <>
      <mesh position={[-1.2, 0.2, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.7, 24]} />
        <meshStandardMaterial color="#b91c1c" />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 1.5, 1.2]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      <mesh position={[1.4, 0, 0]}>
        <planeGeometry args={[0.08, 1.8]} />
        <meshStandardMaterial color="#f8fafc" side={2} />
      </mesh>

      <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 1.15, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </>
  )
}

export const SimulationViewport = () => {
  return (
    <div className="simulation-viewport" aria-label="3D simulation viewport">
      <Canvas camera={{ position: [2.7, 1.4, 2.7], fov: 50 }}>
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 5, 2]} intensity={1.4} />
        <gridHelper args={[6, 20, '#334155', '#1e293b']} />
        <Apparatus />
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  )
}
