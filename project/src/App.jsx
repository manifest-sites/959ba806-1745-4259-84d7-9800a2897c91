import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import ButterflyApp from './components/ButterflyApp'

function App() {

  return (
    <Monetization>
      <ButterflyApp />
    </Monetization>
  )
}

export default App