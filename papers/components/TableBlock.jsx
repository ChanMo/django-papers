/**
 * Table Block
 * rows, cols, value
 */
import React, { useState } from 'react'
import { List } from 'immutable'
import Popover from '@mui/material/Popover'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export default function TableExport(props) {
  const [form, setForm] = useState(props.data.value)
  const [activeCol, setActiveCol] = useState(false)
  const [readonly, setReadonly] = useState(true)
  const handleChange = (event, rowIndex, colIndex) => {
    const value = event.target.value
    setForm(List(form).setIn([rowIndex, colIndex], value).toJS())
  }

  const handleSave = () => {
    setReadonly(true)
    props.onCloseEdit({'value':form})
  }

  const handleInsertRow = () => {
    //setForm(List(form).push(['','']))
    setForm([...form, new Array(form[0].length).fill('')])
  }

  const handleInsertCol = () => {
    let newValue = []
    form.map((row, rowIndex) => {
      newValue.push([...row, ''])
    })
    setForm(newValue)
  }

  const handleStartEdit = () => {
    setReadonly(false)
    props.onStartEdit()
  }

  if(readonly) {
    return (
      <Table size="small" onClick={handleStartEdit}>
        <TableBody>
          {form.map((row,rowIndex) => (
            <TableRow key={rowIndex.toString()}>
              {row.map((col, colIndex) => (
                <TableCell 
                  key={colIndex.toString()}
                  sx={{border:1,borderColor:'grey.300'}}
                >
                  <Typography>{col ? col : ' '}</Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }


  return (
    <ClickAwayListener onClickAway={handleSave}>
      <Box sx={{bgcolor:'grey.100', borderRadius:3,overflow:'hidden'}}>
        <Stack alignItems="stretch">
          <Stack direction="row" alignItems="stretch">
            <Table size="small" sx={{bgcolor:'white'}}>
              <TableBody>
                <TableRow sx={{bgcolor:'grey.100'}}>
                  <TableCell sx={{border:0,padding:'6px'}}>
                  </TableCell>
                  {form[0].map((col, index) => (
                    <TableCell key={index.toString()} 
                      sx={{bgcolor:index === activeCol ? 'primary.light':'transparent','&>button':{visibility:'visible'},p:0,textAlign:'center !important','&:hover':{'& > button':{visibility:'visible'}}}}>
                      <ButtonBase sx={{visibility:'hidden'}} onClick={()=>setActiveCol(index)}>
                        <DragIndicatorIcon sx={{transform:'rotate(90deg)',fontSize:16}} />
                      </ButtonBase>
                    </TableCell>
                  ))}
                </TableRow>
                {form.map((row,rowIndex) => (
                  <TableRow key={rowIndex.toString()}>
                    <TableCell sx={{bgcolor:'grey.100',border:0,padding:'6px'}}>
                    </TableCell>
                    {row.map((col, colIndex) => (
                      <TableCell 
                        key={colIndex.toString()}
                        sx={activeCol !== colIndex ? {border:1,borderColor:'grey.300'} : {bgcolor:'grey.50',borderLeftColor:'primary.light',borderLeftWidth:2,borderRightWidth:2,borderRightColor:'primary.light'}}
                      >
                        {readonly ? (
                          <Typography>{col}</Typography>
                        ) : (
                          <InputBase 
                            fullWidth
                            value={col}
                            onChange={(event)=>handleChange(event, rowIndex, colIndex)}
                            //onBlur={handleSave}
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ButtonBase onClick={handleInsertCol} sx={{'&:hover':{bgcolor:'primary.light','& > svg': {color:'white'}}}}>
              <AddIcon fontSize="small" color="primary" />
            </ButtonBase>
          </Stack>
          <ButtonBase onClick={handleInsertRow} sx={{'&:hover':{bgcolor:'primary.light','& > svg': {color:'white'}}}}>
            <AddIcon fontSize="small" color="primary" />
          </ButtonBase>
        </Stack>
      </Box>
    </ClickAwayListener>
  )
}
