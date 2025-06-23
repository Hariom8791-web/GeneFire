import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Genelogo from '../public/loggenefire.svg'
import  './App.css'
import AerosolCalculator from "./AerosolCalculator.jsx"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>   GeneFire Pvt. Ltd.</h1>
    <h3><a href="https://www.genefire.com/aerosol-fire-suppression-products">Visit Website.</a></h3>
    <AerosolCalculator />
      
     
    </>
  )
}

export default App
