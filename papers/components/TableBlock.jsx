/**
 * Table Block
 * rows, cols, value
 *
 * TODO clean code
 * TODO resort
 * TODO delete table
 * TODO popper id
 */
import React, { useState, useRef } from 'react'
import { List } from 'immutable'
import Fade from '@mui/material/Fade'
import Popper from '@mui/material/Popper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import ButtonBase from '@mui/material/ButtonBase'
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export default function TableExport(props) {
  const tbody = useRef(null)
  const [form, setForm] = useState(props.data.value)
  const [active, setActive] = useState('')
  const [readonly, setReadonly] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const handleChange = (event, rowIndex, colIndex) => {
    const value = event.target.value
    setForm(List(form).setIn([rowIndex, colIndex], value).toJS())
  }

  const handleSave = () => {
    console.log('tesitng')
    setReadonly(true)
    setActive('')
    setAnchorEl(null)
    props.onCloseEdit({'value':form})
  }

  // insert a new column or row
  const handleInsert = (type='col', index=null) => {
    console.log('insert', type, index)
    if(index === null && type === 'col') {
      let newValue = []
      form.map((row, rowIndex) => {
        newValue.push([...row, ''])
      })
      setForm(newValue)
    } else if (index === null && type === 'row') {
      setForm([...form, new Array(form[0].length).fill('')])
    } else if (index !== null && type === 'col') {
      let newValue = []
      form.map((row, rowIndex) => {
        newValue.push(List(row).insert(index, '').toJS())
      })
      setForm(newValue)
    } else {
      setForm(List(form).insert(index, new Array(form[0].length).fill('')).toJS())
    }
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

  const groupType = active.substr(0,3)
  const groupIndex = parseInt(active.substr(3))

  /**
   * choose col
   */
  const handleClick = (event, index) => {
    setActive(index)
    setAnchorEl(event.currentTarget)
  }

  /**
   * delete col or row
   * TODO when is last one, delete table
   */
  const handleDelete = () => {
    if(groupType === 'col' && form[0].length <= 1) {
      // prevent delete last row or col
      return
    } else if (groupType === 'row' && form.length <= 1) {
      return
    }
    setActive('')
    setAnchorEl(null)
    if(groupType === 'col') {
      setForm(form.map(i => List(i).delete(groupIndex).toJS()))
    } else {
      setForm(List(form).delete(groupIndex).toJS())
    }
  }

  const popperOpen = Boolean(active !== '')
  const popperId = popperOpen ? 'active-popper' : undefined



  // check td is active
  const tdActive = (rowIndex, colIndex) => {
    if(groupType === 'row' && rowIndex === groupIndex) {
      return true
    }
    if(groupType === 'col' && colIndex === groupIndex) {
      return true
    }
    return false
  }

  const height = tbody.current ? tbody.current.clientHeight : 0
  const width = tbody.current ? tbody.current.clientWidth: 0

  //const InsertPoint = () => (
  //  <Box sx={{display:'inline-flex',alignItems:'center',position:'absolute',p:1,boxSizing:'border-box',top:0,left:0,transform:'translate(-50%,-120%)','&:hover':{p:0,'& > button': {display:'inline-flex'},'&>span':{display:'none'},'& + p':{display:'block'}}}}>
  //    <Box component="span" sx={{display:'inline-block',bgcolor:'grey.400',width:'5px',height:'5px',borderRadius:'99px',}} />
  //    <ButtonBase sx={{overflow:'hidden',borderRadius:'999px',display:'none',bgcolor:'primary.light'}} onClick={()=>handleInsert('col', index)}>
  //      <AddIcon fontSize="small" sx={{color:'common.white'}} />
  //    </ButtonBase>
  //  </Box>
  //)

  return (
    <ClickAwayListener onClickAway={handleSave}>
      <Box>
      <Box sx={{bgcolor:'grey.100', borderRadius:3,overflow:'visible'}}>
        <Stack alignItems="stretch">
          <Stack direction="row" alignItems="stretch">
            <Table size="small" sx={{bgcolor:'white'}}>
              <TableBody ref={tbody}>
                <TableRow sx={{bgcolor:'grey.100'}}>
                  <TableCell sx={{border:0,padding:'6px'}}>
                  </TableCell>
                  {form[0].map((col, index) => (
                    <TableCell key={index.toString()} 
                      sx={{'position':'relative',bgcolor:groupType === 'col' && index === groupIndex ? 'primary.light':'transparent',py:0,px:2,}}>
                      <Box sx={{display:'inline-flex',alignItems:'center',position:'absolute',p:1,boxSizing:'border-box',top:0,left:0,transform:'translate(-50%,-120%)','&:hover':{p:0,'& > button': {display:'inline-flex'},'&>span':{display:'none'},'& + p':{display:'block'}}}}>
                        <Box component="span" sx={{display:'inline-block',bgcolor:'grey.400',width:'5px',height:'5px',borderRadius:'99px',}} />
                        <ButtonBase sx={{overflow:'hidden',borderRadius:'999px',display:'none',bgcolor:'primary.light'}} onClick={()=>handleInsert('col', index)}>
                          <AddIcon fontSize="small" sx={{color:'common.white'}} />
                        </ButtonBase>
                      </Box>
                      <Box component="p" sx={{position:'absolute',top:0,left:'-2px',width:3,height:height,bgcolor:'primary.light',transform:'translate(0,0)',display:'none',zIndex:9}} />
                      <Box sx={{textAlign:'center !important','&:hover':{'& > button':{visibility:'visible'}}}}>
                      <ButtonBase sx={{visibility:groupType === 'col' && index === groupIndex ? 'visible' : 'hidden',display:'block',width:'100%'}} onClick={(event)=>handleClick(event, 'col'+index)}>
                        <DragIndicatorIcon sx={{transform:'rotate(90deg)',fontSize:16}} />
                      </ButtonBase>
                    </Box>
                    </TableCell>
                  ))}
                </TableRow>
                {form.map((row,rowIndex) => (
                  <TableRow key={rowIndex.toString()}>
                    <TableCell sx={{position:'relative',border:0,p:0,bgcolor:groupType === 'row' && rowIndex === groupIndex ? 'primary.light':'grey.100','&:hover':{'& > button':{visibility:'visible'}}}}>
                      <Box sx={{display:'inline-flex',alignItems:'center',position:'absolute',p:1,boxSizing:'border-box',top:0,left:0,transform:'translate(-120%,-50%)','&:hover':{p:0,'& > button': {display:'inline-flex'},'&>span':{display:'none'},'& + p':{display:'block'}}}}>
                        <Box component="span" sx={{display:'inline-block',bgcolor:'grey.400',width:'5px',height:'5px',borderRadius:'99px',}} />
                        <ButtonBase sx={{overflow:'hidden',borderRadius:'999px',display:'none',bgcolor:'primary.light'}} onClick={()=>handleInsert('row', rowIndex)}>
                          <AddIcon fontSize="small" sx={{color:'common.white'}} />
                        </ButtonBase>
                      </Box>
                      <Box component="p" sx={{position:'absolute',top:0,left:0,width:width,height:3,bgcolor:'primary.light',transform:'translate(0,0)',display:'none'}} />
                      <Box sx={{textAlign:'center !important','&:hover':{'& > button':{visibility:'visible'}}}}>

                      <ButtonBase sx={{visibility:groupType === 'row' && rowIndex === groupIndex ? 'visible' : 'hidden',display:'block',width:'100%'}} onClick={(event)=>handleClick(event, 'row'+rowIndex)}>
                        <DragIndicatorIcon sx={{fontSize:16}} />
                      </ButtonBase>
                    </Box>
                    </TableCell>
                    {row.map((col, colIndex) => (
                      <TableCell 
                        key={colIndex.toString()}
                        sx={{border:1,borderColor:'grey.300',bgcolor:tdActive(rowIndex, colIndex) ? '#e3f2fd' : 'transparent'}}
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
            <ButtonBase onClick={()=>handleInsert('col')} sx={{'&:hover':{bgcolor:'primary.light','& > svg': {color:'white'}}}}>
              <AddIcon fontSize="small" color="primary" />
            </ButtonBase>
          </Stack>
          <ButtonBase onClick={()=>handleInsert('row')} sx={{'&:hover':{bgcolor:'primary.light','& > svg': {color:'white'}}}}>
            <AddIcon fontSize="small" color="primary" />
          </ButtonBase>
        </Stack>
      </Box>
      <Popper id={popperId} 
        open={popperOpen} 
        anchorEl={anchorEl}
        placement={groupType === 'col' ? 'top' : 'left'}
        sx={[groupType === 'col' ? {marginBottom:'16px !important'} : {marginRight:'16px !important'},{zIndex:999}]}
        transition
      >
        {({TransitionProps}) => (
        <Fade {...TransitionProps} timeout={350}>
        <Stack direction={groupType === 'col' ? 'row' : 'column'}
          sx={{bgcolor:'common.black','&>button':{borderRadius:0},'& > button:hover':{bgcolor:'rgba(255,255,255,0.2)'}}}>
          <Tooltip title="删除">
            <IconButton sx={{color:'white'}} onClick={handleDelete}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Fade>
        )}
      </Popper>
    </Box>
    </ClickAwayListener>
  )
}
