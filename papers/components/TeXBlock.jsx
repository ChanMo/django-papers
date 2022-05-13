import React, { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import katex from 'katex'

export default function TeXBlock(props) {
  const refContainer = useRef(null)
  useEffect(() => {
    const {content} = props.contentState.getEntity(props.entityKey).getData();
    katex.render(
      content,
      refContainer.current,
      { displayMode: false },
    );
  }, [])

  return (
    <span>
      <Box 
        component="span" 
        ref={refContainer}
        sx={[{
          verticalAlign:'middle',
        }]}
      />
      {props.children}
    </span>
  )
}
