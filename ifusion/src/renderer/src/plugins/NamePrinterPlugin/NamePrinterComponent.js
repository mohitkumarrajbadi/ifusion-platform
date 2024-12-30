import React, { useState, createElement } from 'react'

function NamePrinterComponent({ result }) {
  const [name, setName] = useState('')

  const handleInputChange = (e) => {
    setName(e.target.value)
  }

  return createElement('h1', { className: 'greeting' }, 'Hello ', '. Welcome!')
}

export default NamePrinterComponent
