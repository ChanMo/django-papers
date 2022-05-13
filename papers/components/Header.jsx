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
      alert('文件过大, 请重新选择')
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
      alert('上传失败')
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
            上次保存时间: {new Date(data.updated_at).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" size="small" onClick={onSave}>保存</Button>
          <Avatar sx={{width:32,height:32}}>{user.substr(0,1)}</Avatar>
        </Stack>
      </Toolbar>
      <Divider sx={{ '@media print': { display: 'none' } }} />
      <Toolbar variant="dense" 
        sx={{minHeight:42, '& button': {mx: .5},'& hr': {mx: .5}}}
      >
        <Tooltip title="撤销">
          <IconButton 
            size="small"
            onClick={() => onChange(EditorState.undo(editorState))}>
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="重做">
          <IconButton 
            size="small"
            onClick={() => onChange(EditorState.redo(editorState))}>
            <RedoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="打印">
          <IconButton 
            size="small"
            onClick={()=>window.print()}>
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="标题">
          <IconButton
            size="small"
            color={blockType === 'header-one' ? 'primary' : undefined}
            onClick={() => onToggleBlockStyle('header-one')}
            sx={{ fontSize: 18, fontWeight: 'bold' }}>
            H1
          </IconButton>
        </Tooltip>
        <Tooltip title="副标题">
          <IconButton
            size="small"
            color={blockType === 'header-two' ? 'primary' : undefined}
            onClick={() => onToggleBlockStyle('header-two')}
            sx={{ fontSize: 18, fontWeight: 'bold' }}>
            H2
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          color={blockType === 'header-three' ? 'primary' : undefined}
          onClick={() => onToggleBlockStyle('header-three')}
          sx={{ fontSize: 18, fontWeight: 'bold' }}>
          H3
        </IconButton>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="粗体(Ctrl+b)">
          <IconButton
            size="small"
            color={inlineStyle.has('BOLD') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('BOLD')}>
            <FormatBoldIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="斜体(Ctrl+i)">
          <IconButton
            size="small"
            color={inlineStyle.has('ITALIC') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('ITALIC')}>
            <FormatItalicIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="下划线">
          <IconButton
            size="small"
            color={inlineStyle.has('UNDERLINE') ? 'primary' : undefined}
            onClick={() => handleToggleStyle('UNDERLINE')}>
            <FormatUnderlinedIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="左对齐">
          <IconButton size="small">
            <FormatAlignLeftIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="居中对齐">
          <IconButton size="small">
            <FormatAlignCenterIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="右对齐">
          <IconButton size="small">
            <FormatAlignRightIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="符号列表">
          <IconButton size="small">
            <FormatListBulletedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="编号列表">
          <IconButton size="small">
            <FormatListNumberedIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="插入表情">
          <IconButton size="small">
            <InsertEmoticonIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="插入图片">
          <div>
            <IconButton size="small" component="label" htmlFor="id_insert_img">
              <ImageIcon />
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
        <Tooltip title="插入表格">
          <IconButton size="small" onClick={handleInsertTable}>
            <CalendarViewMonthIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="插入公式">
          <IconButton size="small" onClick={()=>setOpen('tex')}>
            <FunctionsIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="快捷键">
          <IconButton size="small">
            <KeyboardIcon />
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
