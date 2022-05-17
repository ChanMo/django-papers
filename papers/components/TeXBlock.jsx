import React, { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import katex from 'katex'

export default function TeXBlock({value, ...props}) {
  const refContainer = useRef(null)
  useEffect(() => {
    if(refContainer.current && value) {
      katex.render(
        value,
        refContainer.current,
        { displayMode: false },
      );
    }
  }, [value])
  return (
    <Box 
      ref={refContainer}
      sx={[{
        verticalAlign:'middle',
      }]}
      {...props}
    />
  )
}
