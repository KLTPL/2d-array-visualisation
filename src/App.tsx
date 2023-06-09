import { useRef, useState } from "react";
import SelectOptionInput from "./components/SelectOptionInput";
import Table from "./components/Table";
import { ContextProvider } from "./context/VisualisationContext";

export default function App() {


  return (
    <ContextProvider>
      <div className="container">
        <SelectOptionInput />
        <Table />
      </div>
    </ContextProvider>
  );
}