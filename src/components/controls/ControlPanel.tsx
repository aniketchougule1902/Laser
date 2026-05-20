import { useSimulationStore } from '../../store/simulationStore'

type SliderInputProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (nextValue: number) => void
}

const SliderInput = ({ label, value, min, max, step, unit, onChange }: SliderInputProps) => {
  return (
    <label className="control-field">
      <span>
        {label}: <strong>{value}</strong>
        {unit ? ` ${unit}` : ''}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  )
}

export const ControlPanel = () => {
  const {
    wavelengthNm,
    order,
    focalLengthM,
    maximaPositionM,
    slitSpacingM,
    setWavelengthNm,
    setOrder,
    setFocalLengthM,
    setMaximaPositionM,
    setSlitSpacingM,
  } = useSimulationStore()

  return (
    <aside className="control-panel" aria-label="Experiment controls">
      <h2>Controls</h2>
      <SliderInput
        label="Wavelength"
        value={wavelengthNm}
        min={380}
        max={700}
        step={0.1}
        unit="nm"
        onChange={setWavelengthNm}
      />
      <SliderInput label="Order" value={order} min={1} max={5} step={1} onChange={setOrder} />
      <SliderInput
        label="Focal Length"
        value={focalLengthM}
        min={0.1}
        max={2}
        step={0.01}
        unit="m"
        onChange={setFocalLengthM}
      />
      <SliderInput
        label="Maxima Position"
        value={maximaPositionM}
        min={0.001}
        max={0.05}
        step={0.001}
        unit="m"
        onChange={setMaximaPositionM}
      />
      <SliderInput
        label="Slit Spacing"
        value={slitSpacingM}
        min={5e-7}
        max={5e-6}
        step={1e-7}
        unit="m"
        onChange={setSlitSpacingM}
      />
    </aside>
  )
}
