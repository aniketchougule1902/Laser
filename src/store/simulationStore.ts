import { create } from 'zustand'
import { DEFAULT_SIMULATION_VALUES } from '../constants/defaults'

type SimulationState = {
  wavelengthNm: number
  order: number
  focalLengthM: number
  maximaPositionM: number
  slitSpacingM: number
  setWavelengthNm: (value: number) => void
  setOrder: (value: number) => void
  setFocalLengthM: (value: number) => void
  setMaximaPositionM: (value: number) => void
  setSlitSpacingM: (value: number) => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  ...DEFAULT_SIMULATION_VALUES,
  setWavelengthNm: (wavelengthNm) => set({ wavelengthNm }),
  setOrder: (order) => set({ order }),
  setFocalLengthM: (focalLengthM) => set({ focalLengthM }),
  setMaximaPositionM: (maximaPositionM) => set({ maximaPositionM }),
  setSlitSpacingM: (slitSpacingM) => set({ slitSpacingM }),
}))
