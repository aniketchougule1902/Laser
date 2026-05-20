import { ControlPanel } from '../components/controls/ControlPanel'
import { SimulationViewport } from '../components/simulation/SimulationViewport'
import { IntensityPlaceholder } from '../components/charts/IntensityPlaceholder'
import {
  calculateGratingElement,
  calculateLinesPerCm,
  calculateTheta,
} from '../physics/calculations/diffraction'
import { useSimulationStore } from '../store/simulationStore'

export const SimulationPage = () => {
  const { wavelengthNm, order, focalLengthM, maximaPositionM } = useSimulationStore()

  const theta = calculateTheta(maximaPositionM, focalLengthM)
  const gratingElement = calculateGratingElement(
    focalLengthM,
    order,
    wavelengthNm,
    maximaPositionM,
  )
  const linesPerCm = calculateLinesPerCm(gratingElement)

  return (
    <main className="app-shell">
      <header className="top-bar">
        <h1>Laser Diffraction Grating Physics Simulator</h1>
      </header>

      <section className="main-grid">
        <div className="left-panel">
          <h2>Live Values</h2>
          <ul>
            <li>θ = {theta.toFixed(6)} rad</li>
            <li>(a+b) = {gratingElement.toExponential(3)} m</li>
            <li>N = {linesPerCm.toFixed(2)} lines/cm</li>
          </ul>
        </div>
        <SimulationViewport />
        <ControlPanel />
      </section>

      <IntensityPlaceholder />
    </main>
  )
}
