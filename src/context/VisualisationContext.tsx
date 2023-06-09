import { useRef, useState, createContext, useContext, ReactNode } from "react";
import Table, { LENGTH_START } from "../components/Table";

export type VisualisationContextType = {
  length: number, 
  setLength: React.Dispatch<React.SetStateAction<number>>,
  loopOne: number, 
  setLoopOne: React.Dispatch<React.SetStateAction<number>>
  loopTwo: number, 
  setLoopTwo: React.Dispatch<React.SetStateAction<number>>,
  isVisualisationRunning: boolean, 
  setIsVisualisationRunning: React.Dispatch<React.SetStateAction<boolean>>,
  speedDivider: React.MutableRefObject<number>,
};

type ContextProviderProps = {
  children: ReactNode
};

const VisualisationContext = createContext<VisualisationContextType | null>(null);

export function useVisualisationContext() {
  return useContext(VisualisationContext);
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [length, setLength] = useState<number>(LENGTH_START);
  const [loopOne, setLoopOne] = useState<number>(1);
  const [loopTwo, setLoopTwo] = useState<number>(1);
  const [isVisualisationRunning, setIsVisualisationRunning] = useState<boolean>(false);
  const speedDivider = useRef<number>(1);

  return (
    <VisualisationContext.Provider value={{ 
      length, 
      setLength,
      loopOne,
      setLoopOne, 
      loopTwo, 
      setLoopTwo, 
      isVisualisationRunning, 
      setIsVisualisationRunning, 
      speedDivider
    }}>
      {children}
    </VisualisationContext.Provider>
  );
}