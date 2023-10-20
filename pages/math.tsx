import React, { useState, useEffect } from 'react';
import '../public/pico.min.css'
import * as math from "../public/math/math";

const MathEvaluator = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputIsValid, setOutputIsValid] = useState(false);

  const [wasmLoaded, setWasmLoaded] = useState(false);

  useEffect(() => {
    async function loadWasm() {
      const wasm = await math.default();
      setWasmLoaded(true);
    }
    loadWasm();
  }, []);

  useEffect(() => {
    if (wasmLoaded) {
      try {
        if (input === "") {
          setOutput("0");
          setOutputIsValid(false);
          return;
        }
        const result = math.evaluate(input);
        setOutput(result);
        setOutputIsValid(true);
      } catch (err) {
        setOutputIsValid(false);
      }
    }
  }, [input, wasmLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className=".container" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '25em',
      margin: '0 auto',
      padding: '20px',
      height: '100vh',
    }}>
      <input type="text" value={input} onChange={handleChange} />
      =
      <input
        type="text"
        aria-busy={wasmLoaded ? "false" : "true"}
        readOnly={wasmLoaded && outputIsValid}
        disabled={wasmLoaded && !outputIsValid}
        value={output}
      />
    </div>
  );
};

export default MathEvaluator;
