import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import AppBar from '@mui/material/AppBar'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'

import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';
import HighlightIcon from '@mui/icons-material/Highlight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HelpIcon from '@mui/icons-material/Help';
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined';
import ImageIcon from '@mui/icons-material/Image';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import FunctionsIcon from '@mui/icons-material/Functions';
import PrintIcon from '@mui/icons-material/Print';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';

import { uploadImage } from './utils'
import TeXDialog from './TeXDialog'

import { convertToRaw, SelectionState, Modifier, AtomicBlockUtils,EditorState, RichUtils } from 'draft-js'


export default function PaperHeader(props) {
  const {data, editorState, onToggleStyle, onChange, onSave, user} = props
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }
  const handleDialogChange = (value) => {
    setOpen(false)
    onChange(value)
  }

  const onToggleBlockStyle = (blockStyle) => {
    onChange(RichUtils.toggleBlockType(editorState, blockStyle))
  }

  const selection = editorState.getSelection()
  const blockKey = selection.getStartKey()
  const block = editorState.getCurrentContent().getBlockForKey(blockKey)
  const blockType = block.getType()
  const offset = selection.focusOffset

  const inlineStyle = editorState.getCurrentInlineStyle()

  const handleToggleStyle = (style) => {
    onChange(RichUtils.toggleInlineStyle(editorState, style))
  }

  // insert a image block
  const handleInsertImage = async(event) => {
    const file = event.target.files[0]
    if (file.size > 1024 * 1024) {
      alert('????????????, ???????????????')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    const url = '/upload/'
    let src
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken')
        },
        body: formData
      })
      if(!res.ok) {
        throw res.status
      }
      const resJson = await res.json()
      src = resJson['path']
    } catch(err) {
      alert('????????????')
      console.log(err)
      return
    }

    const content = editorState.getCurrentContent()
    const entity = content.createEntity('IMG', 'IMMUTABLE', {'src':src})
    const key = entity.getLastCreatedEntityKey()
    const newState = EditorState.set(
      editorState,
      { currentContent: entity }
    )
    const res = AtomicBlockUtils.insertAtomicBlock(
      newState,
      key,
      ' '
    )
    onChange(res)
  }

  const handleInsertTable = () => {
    const emptyTable = [['',''],['','']]
    const content = editorState.getCurrentContent()
    const entity = content.createEntity('TABLE', 'IMMUTABLE', {'value':emptyTable})
    const key = entity.getLastCreatedEntityKey()
    const newState = EditorState.set(
      editorState,
      { currentContent: entity }
    )
    const res = AtomicBlockUtils.insertAtomicBlock(
      newState,
      key,
      ' '
    )
    onChange(res)
  }

  return (
    <>
    <AppBar
      position="sticky"
      color="background"
      sx={{top:0,boxShadow:0,'@media print': { display: 'none' } }}>
      <Toolbar>
        <IconButton sx={{mr:1}} onClick={()=>window.history.back()}>
          <KeyboardArrowLeftIcon />
        </IconButton>
        <Box>
          <Typography variant="h6">{data.title}</Typography>
          <Typography variant="body2" color="textSecondary">
            ??????????????????: {new Date(data.updated_at).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" size="small" onClick={onSave}>??????</Button>
          <Avatar sx={{width:32,height:32}}>{user.substr(0,1)}</Avatar>
        </Stack>
      </Toolbar>
      <Divider sx={{ '@media print': { display: 'none' } }} />
      <Toolbar variant="dense" 
        sx={{minHeight:42, '& .MuiButtonBase-root': {mx: .5,borderRadius:0.5},'& hr': {mx: .5}}}
      >
        <Tooltip title="??????">
          <IconButton 
            size="small"
            onClick={() => onChange(EditorState.undo(editorState))}>
            <UndoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="??????">
          <IconButton 
            size="small"
            onClick={() => onChange(EditorState.redo(editorState))}>
            <RedoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="??????">
          <IconButton 
            size="small"
            onClick={()=>window.print()}>
            <PrintIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="??????">
          <IconButton
            size="small"
            color={blockType === 'header-one' ? 'primary' : undefined}
            onClick={() => onToggleBlockStyle('header-one')}
            sx={{ fontSize: 16, fontWeight: 'bold' }}>
            H1
          </IconButton>
        </Tooltip>
        <Tooltip title="?????????">
          <IconButton
            size="small"
            color={blockType === 'header-two' ? 'primary' : undefined}
            onClick={() => onToggleBlockStyle('header-two')}
            sx={{ fontSize: 16, fontWeight: 'bold' }}>
            H2
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          color={blockType === 'header-three' ? 'primary' : undefined}
          onClick={() => onToggleBlockStyle('header-three')}
          sx={{ fontSize: 16, fontWeight: 'bold' }}>
          H3
        </IconButton>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="??????(Ctrl+b)">
          <IconButton
            size="small"
            color={inlineStyle.has('BOLD') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('BOLD')}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="??????(Ctrl+i)">
          <IconButton
            size="small"
            color={inlineStyle.has('ITALIC') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('ITALIC')}>
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="?????????">
          <IconButton
            size="small"
            color={inlineStyle.has('UNDERLINE') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('UNDERLINE')}>
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="????????????">
          <IconButton
            size="small">
            <HighlightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="??????">
          <IconButton
            size="small"
            color={inlineStyle.has('SUPERSCRIPT') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('SUPERSCRIPT')}>
            <SuperscriptIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="??????">
          <IconButton
            size="small"
            color={inlineStyle.has('SUBSCRIPT') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('SUBSCRIPT')}>
            <SubscriptIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="?????????">
          <IconButton size="small">
            <FormatAlignLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="????????????">
          <IconButton size="small">
            <FormatAlignCenterIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="?????????">
          <IconButton size="small">
            <FormatAlignRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="????????????">
          <IconButton size="small">
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="????????????">
          <IconButton size="small">
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="????????????">
          <IconButton size="small">
            <InsertEmoticonIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="????????????">
          <div>
            <IconButton size="small" component="label" htmlFor="id_insert_img">
              <ImageIcon fontSize="small" />
            </IconButton>
            <Box 
              onChange={handleInsertImage}
              component="input" 
              type="file" 
              sx={{display:'none'}} 
              accept="image/*" 
              id="id_insert_img" />
          </div>
        </Tooltip>
        <Tooltip title="????????????">
          <IconButton size="small" onClick={handleInsertTable}>
            <CalendarViewMonthIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="????????????">
          <IconButton size="small" onClick={()=>setOpen('tex')}>
            <FunctionsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="?????????">
          <IconButton size="small">
            <KeyboardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Divider sx={{ '@media print': { display: 'none' } }} />
    </AppBar>
    <TeXDialog 
      open={open === 'tex'}
      onClose={handleClose}
      editorState={editorState}
      onChange={handleDialogChange}
    />
    </>
  )
}
