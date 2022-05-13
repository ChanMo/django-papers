import React from 'react'
import Box from '@mui/material/Box'

/**
 * ImageBlock
 * editing: check is editing.
 */
export default function ImageBlock(props) {
  return (
    <Box
      component="img"
      src={props.data.src}
      alt=''
    />
  )
}
