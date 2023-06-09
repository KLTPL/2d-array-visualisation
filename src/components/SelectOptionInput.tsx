import React, { useRef } from "react";
import { LENGTH_START } from "./Table";
import { removeMarksFromFields } from "./Table";
import { useVisualisationContext, VisualisationContextType } from "../context/VisualisationContext";

const firstLoopConfig = new Map<string, number>();
firstLoopConfig.set("for (w=0 ; w<n ; w++)", 1);
firstLoopConfig.set("for (w=n-1 ; w>=0 ; w--)", 2);
firstLoopConfig.set("for (i=0 ; i<n ; i++)", 3);
firstLoopConfig.set("for (i=n-1 ; i>=0 ; i--)", 4);

const secondLoopConfig = new Map<string, number>();
secondLoopConfig.set("for (k=0 ; k<n ; k++)", 1);
secondLoopConfig.set("for (k=n-1 ; k>=0 ; k--)", 2);
secondLoopConfig.set("for (k=0 ; k<n-w ; k++)", 3);
secondLoopConfig.set("for (k=n-1 ; k>=w ; k--)", 4);

const loopOneNumToIsLoopTwoAllowed = new Map<number, boolean>();
loopOneNumToIsLoopTwoAllowed.set(1, true);
loopOneNumToIsLoopTwoAllowed.set(2, true);
loopOneNumToIsLoopTwoAllowed.set(3, false);

const loopOneNumToExpression = new Map<number, string>();
loopOneNumToExpression.set(1, "suma += tabela[w][k]");
loopOneNumToExpression.set(2, "suma += tabela[w][k]");
loopOneNumToExpression.set(3, "suma += tabela[i][i]");
loopOneNumToExpression.set(4, "suma += tabela[n-1-i][i]");

function changeSpeed(slider: HTMLInputElement|null, speedDivider: React.MutableRefObject<number>) {
  if (slider !== null) {
    speedDivider.current = parseInt(slider.value)/50;
  }
}

export default function SelectOptionInput() {
  const { 
    setLength, loopOne, setLoopOne, setLoopTwo, isVisualisationRunning, speedDivider
  } = useVisualisationContext() as VisualisationContextType;
  const timeSlider = useRef<HTMLInputElement>(null);
  function chooseOptionLength(ev: React.ChangeEvent<HTMLSelectElement>) {
    setLength(parseInt(ev.target.value));
    removeMarksFromFields();
  }

  function chooseOptionFirst(ev: React.ChangeEvent<HTMLSelectElement>) {
    const loopNum = firstLoopConfig.get(ev.target.value);
    if (loopNum !== undefined) {
      setLoopOne(loopNum);
    }
    removeMarksFromFields();
  }

  function chooseOptionSecond(ev: React.ChangeEvent<HTMLSelectElement>) {
    const loopNum = secondLoopConfig.get(ev.target.value);
    if (loopNum !== undefined) {
      setLoopTwo(loopNum);
    } else {
      console.error("Unexpected loop string. Cannot recognize loop type. String:",ev.target.value);
    }
    removeMarksFromFields();
  }

  return (
    <div className="input-container">
      <div className="hide-layout-button">
        <input type="checkbox" id="isInputContainerHidden" className="isInputContainerHidden" />
        <label htmlFor="isInputContainerHidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" className="icon-opened" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="icon-closed" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
          </svg>
        </label>
      </div>
      <div className="main-layout">
        <div className="length">
          n =&nbsp;
          <select 
            onChange={chooseOptionLength} 
            disabled={isVisualisationRunning} 
            defaultValue={LENGTH_START}
          >
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>9</option>
          </select>
        </div>
        <div>suma = 0</div>
        <div>
          <select onChange={chooseOptionFirst} disabled={isVisualisationRunning}>
            <option>for (w=0 ; w&lt;n ; w++)</option>
            <option>for (w=n-1 ; w&gt;=0 ; w--)</option>
            <option>for (i=0 ; i&lt;n ; i++)</option>
            <option>for (i=n-1 ; i&gt;=0 ; i--)</option>
          </select>
          &nbsp;&#123;
        </div>
        {loopOneNumToIsLoopTwoAllowed.get(loopOne) && <div> &nbsp;&nbsp;
          <select 
            onChange={chooseOptionSecond} 
            disabled={isVisualisationRunning}
          >
            <option>for (k=0 ; k&lt;n ; k++)</option>
            <option>for (k=n-1 ; k&gt;=0 ; k--)</option>
            <option>for (k=0 ; k&lt;n-w ; k++)</option>
            <option>for (k=n-1 ; k&gt;=w ; k--)</option>
          </select>
          &nbsp;&#123;
        </div>}
        <div>
        {loopOneNumToIsLoopTwoAllowed.get(loopOne) && <span>&nbsp;&nbsp;</span>}
          &nbsp;&nbsp;{loopOneNumToExpression.get(loopOne)}
        </div> 
        {loopOneNumToIsLoopTwoAllowed.get(loopOne) && <div>&nbsp;&nbsp;&#125;</div>}
        <div>&#125;</div>
      </div>
      <div className="speed-bar">
          <label htmlFor="speed">prędkość:</label> 
          <input 
            disabled={isVisualisationRunning}
            type="range" 
            id="speed" 
            ref={timeSlider} 
            min={10}
            max={300}
            defaultValue={150}
            onChange={() => changeSpeed(timeSlider.current, speedDivider)}
          />
        </div>
    </div>
  );
}