import { useState } from 'react'

export function CalculatorWindow() {
  const [display, setDisplay] = useState('0')

  const commit = (value: string) => {
    setDisplay((current) => (current === '0' ? value : `${current}${value}`))
  }

  const clear = () => {
    setDisplay('0')
  }

  const evaluate = () => {
    if (!/^[0-9+\-*/. ()]+$/.test(display)) {
      setDisplay('ERR')
      return
    }

    try {
      const result = Function(`'use strict'; return (${display})`)() as number
      if (Number.isFinite(result)) {
        setDisplay(String(result))
      } else {
        setDisplay('ERR')
      }
    } catch {
      setDisplay('ERR')
    }
  }

  const keys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+']

  return (
    <div className="calculator-window">
      <div className="calculator-window__display">{display}</div>
      <div className="calculator-window__keys">
        <button type="button" onClick={clear} className="calculator-window__key is-wide">
          C
        </button>
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="calculator-window__key"
            onClick={() => {
              if (key === '=') {
                evaluate()
                return
              }

              commit(key)
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
