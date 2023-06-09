import { useEffect, useRef, useState } from "react";
import { useVisualisationContext, VisualisationContextType } from "../context/VisualisationContext";

type SetSumFun = React.Dispatch<React.SetStateAction<number | null>>;

type LoopOneFunction = (table: HTMLDivElement, length: number, secondLoop: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number) => void;
type LoopTwoFunction = (table: HTMLDivElement, length: number, row: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number) => void;

const ONE_FIELD_TIME_MS = 500;
export const LENGTH_START = 5;

const LOOP_ONE_FUNCTIONS: LoopOneFunction[] = [
  async function(table: HTMLDivElement, length: number, secondLoop: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number): Promise<void> {
    setSum(null);
    for (let r=0 ; r<length ; r++) {
      await LOOP_TWO_FUNCTIONS[secondLoop](table, length, r, TABLE, setSum, speedDivider);
    }
  },
  async function(table: HTMLDivElement, length: number, secondLoop: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number): Promise<void> {
    setSum(null);
    for (let r=length-1 ; r>=0 ; r--) {
      await LOOP_TWO_FUNCTIONS[secondLoop](table, length, r, TABLE, setSum, speedDivider);
    }
  },
  async function(table: HTMLDivElement, length: number, secondLoop: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number): Promise<void> {
    setSum(null);
    for (let i=0 ; i<length ; i++) {
      await goToNextField(table, i, i, TABLE, setSum, speedDivider);  
    }
  },
  async function(table: HTMLDivElement, length: number, secondLoop: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number): Promise<void> {
    setSum(null);
    for (let i=length-1 ; i>=0 ; i--) {
      await goToNextField(table, length-1-i, i, TABLE, setSum, speedDivider);  
    }
  },
];

const LOOP_TWO_FUNCTIONS: LoopTwoFunction[] = [
  async function(table: HTMLDivElement, length: number, row: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number) {
    for (let c=0 ; c<length ; c++) {
      await goToNextField(table, row, c, TABLE, setSum, speedDivider);
    }
  },
  async function(table: HTMLDivElement, length: number, row: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number) {
    for (let c=length-1 ; c>=0 ; c--) {
      await goToNextField(table, row, c, TABLE, setSum, speedDivider);
    }
  },
  async function(table: HTMLDivElement, length: number, row: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number) {
    for (let c=0 ; c<length-row ; c++) {
      await goToNextField(table, row, c, TABLE, setSum, speedDivider);
    }
  },
  async function(table: HTMLDivElement, length: number, row: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number) {
    for (let c=length-1 ; c>=0+row ; c--) {
      await goToNextField(table, row, c, TABLE, setSum, speedDivider);
    }
  },
];

function goToNextField(table: HTMLDivElement, row: number, column: number, TABLE: number[][], setSum: SetSumFun, speedDivider: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(async () => {
      if (document.querySelector("#button-resume") !== null) {
        await waitForResume();
      }
      const field = getField(table, row, column);
      markFieldAsVisited(field);
      markFieldAsCurrent(field);
      setSum((prev) => (prev === null) ? TABLE[row][column] : prev+TABLE[row][column]);
      resolve();  
      markRowAndColAsCurrent(table, row, column);
    }, ONE_FIELD_TIME_MS/speedDivider);
  });

}

function getField(table: HTMLDivElement, r: number, c: number) {
  return table.childNodes[r].childNodes[c] as HTMLDivElement;
}

export function removeMarksFromFields() {
  removeMarkFieldAsVisited();
  removeMarkFieldAsCurrent();
}

function removeMarkFieldAsVisited() {
  document.querySelectorAll(".visited").forEach(el => el.classList.remove("visited"));
}

function removeMarkFieldAsCurrent() {
  document.querySelectorAll(".current").forEach(el => el.classList.remove("current"));
}

function markFieldAsVisited(field: HTMLDivElement) {
  field.classList.add("visited");
}

function markFieldAsCurrent(field: HTMLDivElement) {
  removeMarkFieldAsCurrent();
  field.classList.add("current");
}

function removeMarkRowAndColCurrent() {
  document.querySelectorAll(".curr-col").forEach(label => label.classList.remove("curr-col"));
  document.querySelectorAll(".curr-row").forEach(label => label.classList.remove("curr-row"));
}

function markRowAndColAsCurrent(table: HTMLDivElement, row: number, col: number) {
  removeMarkRowAndColCurrent();
  getField(table, 0, col).querySelectorAll(".label-col").forEach((label) => label.classList.add("curr-col"));
  getField(table, row, 0).querySelectorAll(".label-row").forEach((label) => label.classList.add("curr-row"));
}

function getLabelRow(row: number, col: number): number|null {
  if (col === 0) { // is first row
    return row;
  }
  return null;
}

function getLabelCol(row: number, col: number): number|null {
  if (row === 0) { // is first row
    return col;
  }
  return null;
}

function getNewTableOfNums(length: number): number[][] {
  const newTable: number[][] = [];
  for (let r=0 ; r<length ; r++) {
    newTable[r] = [];
    for (let c=0 ; c<length ; c++) {
      newTable[r][c] = Math.floor(Math.random()*10);
    } 
  }
  return newTable;
}

function waitForResume(): Promise<void> {
  return new Promise<void>((resolve) => {
    const button = document.querySelector("#button-resume");
    if (button === null) {
      resolve();
      return;
    }
    button.addEventListener("click", () => {
      resolve();
    });
  });
}

let firstTime = true;

export default function Table() {
  const { 
    length, loopOne, loopTwo, isVisualisationRunning, setIsVisualisationRunning, speedDivider
  } = useVisualisationContext() as VisualisationContextType;
  const table = useRef<HTMLDivElement>(null);
  const [sum, setSum] = useState<null|number>(null);
  const [tableOfNums, setTableOfNums] = useState<number[][]>(getNewTableOfNums(length));
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    window.addEventListener("resize", resizeFontSize);
  }, []);

  useEffect(() => {
    removeMarkRowAndColCurrent();
    firstTime = true;
  }, [length, loopOne, loopTwo]);

  useEffect(() => {
    setTableOfNums(getNewTableOfNums(length));
    table.current?.style.setProperty("--tableSize", length.toString());
    removeMarkRowAndColCurrent();
    resizeFontSize();
  }, [length]);

  function pause(): void {
    setIsPaused(true);
  }

  function resume(): void {
    setIsPaused(false);
  }

  async function start(): Promise<void> {
    removeMarkRowAndColCurrent();
    removeMarksFromFields();
    setIsVisualisationRunning(true);
    if (!firstTime) {
      setTableOfNums(getNewTableOfNums(length));
    }
    if (table.current !== null) {
      await LOOP_ONE_FUNCTIONS[loopOne-1](table.current, length, loopTwo-1, tableOfNums, setSum, speedDivider.current);
    }
    setIsVisualisationRunning(false);
    firstTime = false;
  }

  function resizeFontSize() {
    table.current?.style.setProperty("--font-size", `${(table.current.getBoundingClientRect().width / length * 0.7)}px`);
  }

  function createFieldJsxEl(row: number, col: number) {
    const labelRowNum = getLabelRow(row, col);
    const labelColNum = getLabelCol(row, col);
    const labelRow = 
      (labelRowNum !== null) ?
      <div className="label-row">{labelRowNum.toString()}</div> : 
      "";
    const labelCol = 
      (labelColNum !== null) ?
      <div className="label-col">{labelColNum.toString()}</div> : 
      "";
    return (
      <div className="field" key={"c"+col}>
        {labelRow}
        {labelCol}
        {tableOfNums[row][col]}
      </div>
    );
  }
  return (
    <div className="table-container">
      <div className="table" ref={table}>
        {tableOfNums.map((el, r) => 
          <div className="row" key={"r"+r}>
            {tableOfNums[r].map((el, c) => createFieldJsxEl(r, c))}
          </div>
        )}
      </div>
      <div className="ui-table">
        {!isVisualisationRunning && (
          <button onClick={start} className="button">start</button>
        )}
        {isVisualisationRunning && !isPaused && (
          <button onClick={pause} className="button" id="button-pause">stop</button>
        )}
        {isVisualisationRunning && isPaused && (
          <button onClick={resume} className="button" id="button-resume">wznów</button>
        )}
        {sum !== null && <div className="sum">suma: {sum}</div>}
      </div>
    </div>
  );
}