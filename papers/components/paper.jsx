import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Modifier, SelectionState, Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, AtomicBlockUtils } from 'draft-js'
import 'draft-js/dist/Draft.css'
import './app.css'

import ClickAwayListener from '@mui/material/ClickAwayListener'
import Stack from '@mui/material/Stack'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Popper from '@mui/material/Popper'
import Popover from '@mui/material/Popover'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Cookies from 'js-cookie'
import { styled } from '@mui/material/styles';

import UploadIcon from '@mui/icons-material/Upload';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import HighlightIcon from '@mui/icons-material/Highlight';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';


import Header from './Header'
import TeXDialog from './TeXDialog'

import { inline2Block, block2Inline, CustomBlock, customBlockStyleFn, decorator } from './utils'

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.MuiToggleButton-root': {
      color: 'white',
      '&:hover': {
        background: 'rgba(255,255,255,0.2)'
      },
      '&.Mui-selected': {
        background: 'rgba(255,255,255,0.2)'
      },
    },
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));



function App(props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState({})
  const [anchorEl, setAnchorEl] = useState(null) // selection anchor
  const [entityKey, setEntityKey] = useState(null) // selection entity key
  const [editorState, setEditorState] = useState(EditorState.createEmpty(decorator))
  const [readonly, setReadonly] = useState(false)

  // image resize 
  const [scaling, setScaling] = useState(false)
  const [start, setStart] = useState(0)


  const editorRef = useRef(null)

  // auto focus
  useEffect(() => {
    editorRef && editorRef.current && editorRef.current.focus()
  }, [])

  useEffect(() => {
    const f = () => {
      if(scaling === true) {
        setStart(0)
        setScaling(false)
      }
    }
    document.addEventListener("mouseup", f)
    return () => document.removeEventListener('mouseup', f)
  }, [scaling])


  const handleScaleStart = (event) => {
    setScaling(true)
    setStart(event.screenX)
  }

  const maxWidth = editorRef.current ? editorRef.current.clientWidth : 0


  useEffect(() => {
    const fetchData = async() => {
      const res = await fetch(`/api/papers/${props.paper}/`)
      const resJson = await res.json()
      setData(resJson)
      setEditorState(
        EditorState.createWithContent(convertFromRaw(resJson.data), decorator)
      )
    }
    fetchData()
  }, [])

  const handlePreview = () => {
    window.print()
  }

  const _customBlockRenderer = (block) => {
    if (block.getType() === 'atomic') {
      return {
        component: CustomBlock,
        editable: false,
        props: {
          onStartEdit: () => setReadonly(true),
          onCloseEdit: (newValue) => {
            setReadonly(false)
            EditorState.push(
              editorState,
              newValue,
              'change-block-data'
            )
          },
          onSet2Inline: (blockKey) => {
            setEditorState(block2Inline(editorState, blockKey))
            setReadonly(false)
          }
          //onMoveForward: (blockKey) => _moveForward(blockKey),
          //onMoveBackward: (blockKey) => _moveBackward(blockKey),
          //onRemove: (blockKey) => _removeBlock(blockKey)
        }
      }
    }
    return null
  }

  //const _moveForward = (blockKey) => {
  //  const content = editorState.getCurrentContent()
  //  const block = content.getBlockForKey(blockKey)

  //  const beforeBlock = content.getBlockBefore(blockKey)
  //  if (beforeBlock) {
  //    const targetRange = new SelectionState({
  //      anchorKey: beforeBlock.getKey(),
  //      anchorOffset: 0,
  //      focusKey: beforeBlock.getKey(),
  //      focusOffset: beforeBlock.getLength()
  //    })

  //    const newState = AtomicBlockUtils.moveAtomicBlock(
  //      editorState,
  //      block,
  //      targetRange,
  //      'before',
  //    )
  //    setEditorState(newState)
  //  }
  //}

  //const _moveBackward = (blockKey) => {
  //  const content = editorState.getCurrentContent()
  //  const block = content.getBlockForKey(blockKey)

  //  const afterBlock = content.getBlockAfter(blockKey)
  //  if (afterBlock) {
  //    const targetRange = new SelectionState({
  //      anchorKey: afterBlock.getKey(),
  //      anchorOffset: 0,
  //      focusKey: afterBlock.getKey(),
  //      focusOffset: afterBlock.getLength()
  //    })

  //    const newState = AtomicBlockUtils.moveAtomicBlock(
  //      editorState,
  //      block,
  //      targetRange,
  //      'after',
  //    )
  //    setEditorState(newState)
  //  }
  //}


  //const _removeBlock = (blockKey) => {
  //  const content = editorState.getCurrentContent()
  //  const block = content.getBlockForKey(blockKey)

  //  const targetRange = new SelectionState({
  //    anchorKey: blockKey,
  //    anchorOffset: 0,
  //    focusKey: blockKey,
  //    focusOffset: block.getLength()
  //  })

  //  const withoutBlock = Modifier.removeRange(content, targetRange, 'backward')
  //  const resetBlock = Modifier.setBlockType(
  //    withoutBlock,
  //    withoutBlock.getSelectionAfter(),
  //    'unstyled',
  //  )
  //  var newState = EditorState.push(editorState, resetBlock, 'remove-range')
  //  newState = EditorState.forceSelection(newState, resetBlock.getSelectionAfter())

  //  setEditorState(newState)
  //}

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      setEditorState(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  // save paper
  const handleSave = async () => {
    const content = editorState.getCurrentContent()
    const url = `/api/papers/${props.paper}/`
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken')
        },
        body: JSON.stringify({
          data: convertToRaw(content)
        })
      })
      if(!res.ok) {
        throw res.status
      }
      const resJson = await res.json()
      setData(resJson)
    } catch(err) {
      alert('保存失败')
      console.log(err)
    }
  }

  const handleToggleStyle = (style) => {
    const res = RichUtils.toggleInlineStyle(editorState, style)
    setEditorState(res)
  }

  const handleFocus = () => {
    //if (!editorState.getCurrentContent().hasText()) {
    //  editorRef && editorRef.current && editorRef.current.focus()
    //}
    editorRef && editorRef.current && editorRef.current.focus()
  }


  //// current selection
  //const selection = editorState.getSelection()
  //const blockKey = selection.getStartKey()
  //const block = editorState.getCurrentContent().getBlockForKey(blockKey)
  //const blockType = block.getType()
  //const offset = selection.focusOffset

  // popover
  const popoverId = 'selection-popover'
  let popoverOpen = Boolean(anchorEl)


  /**
   * check selection
   */
  useEffect(() => {
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const blockKey = selection.getStartKey()
    const block = editorState.getCurrentContent().getBlockForKey(blockKey)

    const s = window.getSelection()

    if(s.anchorNode) {
      const entityKey = block.getEntityAt(selection.anchorOffset)
      if(!selection.isCollapsed()) {
        let node
        if(entityKey) {
          setEntityKey(entityKey)
          node = s.anchorNode.parentNode.closest('[data-offset-key]').previousElementSibling.parentNode
          //node = s.anchorNode.parentNode.closest('.inline-entity')
          if(node) {
            node.classList.add("is-active")
            //node.setAttribute("draggable", "true")
          }
        } else {
          node = s.anchorNode.parentNode.closest('[data-offset-key]')
        }
        setAnchorEl(node)
      }
    }

  },[editorState.getSelection()])

  //// try find inline entity
  //if(selection.isCollapsed()) {
  //  console.log('tesing')
  //  const entityKey = block.getEntityAt(selection.anchorOffset)
  //  const s = window.getSelection()
  //  if(entityKey && s.focusNode) {
  //    console.log(entityKey)
  //    //const contentState = editorState.getCurrentContent()
  //    //const entity = contentState.getEntity(entityKey)
  //    const node = s.focusNode.parentNode.closest('.MuiBox-root')
  //    //console.log(node.childNodes[0])
  //    //const node = s.focusNode.parentNode.parentNode
  //    //s.extend(node.childNodes[0], 2)
  //    //node.classList.add("is-active")
  //    //const node = s.focusNode.parentNode
  //    //const range = document.createRange()
  //    //range.selectNode(node)
  //    //s.addRange(range)
  //    //
  //    //console.log(s.toString())
  //    //const entitySelection = selection.set('focusOffset', offset + 1)
  //    //console.log(entitySelection.serialize())
  //    //anchorEl = s.focusNode.parentNode
  //    anchorEl = node
  //    popoverOpen = true
  //  }
  //} else {
  //  // normal selection
  //  // selection styles
  //  if(!selection.isCollapsed() && window.getSelection().anchorNode) {
  //    anchorEl = window.getSelection().anchorNode.parentNode
  //    popoverOpen = true
  //  }
  //}

  const inlineStyle = editorState.getCurrentInlineStyle()
  //const popoverOpen = false //Boolean(anchorEl)

  // handle popover inline
  const handleToggleStyle2 = (value) => {
    const res = RichUtils.toggleInlineStyle(editorState, value)
    const selection = editorState.getSelection()
    const emptySelection = selection.set('focusOffset', selection.anchorOffset)
    const resWithoutSelection = EditorState.acceptSelection(res, emptySelection)
    window.getSelection().removeAllRanges()
    setEditorState(resWithoutSelection)

    setReadonly(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if(!editorState.getSelection().isCollapsed()) {
      setReadonly(true)
    }
  }, [editorState.getSelection().isCollapsed()])

  const handleEditEntity = (entityType) => {
    setReadonly(true)
    setOpen(entityType)
  }
  const handleDialogChange = (value) => {
    setOpen(false)
    const content = editorState.getCurrentContent()
    const newState = EditorState.push(
      editorState, 
      content.replaceEntityData(entityKey, value),
      'apply-entity'
    )
    setEditorState(newState)
    //handleClickAway()
  }

  /**
   * upload image
   */
  const handleUpload = async(event) => {
    const file = event.target.files[0]
    if (file.size > 1024 * 1024) {
      alert('文件过大, 请重新选择')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    const url = '/upload/'
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
      //setForm({...form, src:resJson['path']})
      const content = editorState.getCurrentContent()
      const newState = EditorState.push(
        editorState, 
        content.mergeEntityData(entityKey, {'src':resJson['path']}),
        'apply-entity'
      )
      setEditorState(newState)
    } catch(err) {
      alert('上传失败')
      console.log(err)
    }
  }


  const handleClickAway = () => {
    console.log('clear selection')
    anchorEl && anchorEl.classList.remove("is-active")
    const selection = editorState.getSelection()
    const emptySelection = selection.set('focusOffset', selection.anchorOffset)
    const resWithoutSelection = EditorState.acceptSelection(editorState, emptySelection)
    window.getSelection().removeAllRanges()
    setEditorState(resWithoutSelection)
    setReadonly(false)
    setAnchorEl(null)
    setEntityKey(null)
  }

  const handleSet2Block = () => {
    const res = inline2Block(editorState)
    setEditorState(res)
    window.getSelection().removeAllRanges()
    setEntityKey(null)
    setAnchorEl(null)
    setReadonly(false)
  }

  const activeEntity = entityKey ? editorState.getCurrentContent().getEntity(entityKey) : null
  const selectionType = activeEntity ? activeEntity.getType() : 'PARAGRAPH'

  const handleScaling = () => {
    if(scaling && event.screenX) {
      const data = activeEntity.getData()
      const width = event.screenX - start
      let resWidth = width + data.width
      if(resWidth > maxWidth) {
        resWidth = maxWidth
      } else if (resWidth <= 50) {
        resWidth = 50
      }
      setStart(event.screenX)
      const content = editorState.getCurrentContent()
      const newState = EditorState.push(
        editorState, 
        content.mergeEntityData(entityKey, {'width':resWidth}),
        'apply-entity'
      )
      setEditorState(newState)

      //const res = {...form, width:resWidth}
      //setForm(res)
    }
  }

  return (
    <Box onMouseMove={handleScaling}>
      <Header
        data={data}
        editorState={editorState}
        onToggleStyle={handleToggleStyle}
        onChange={(value) => setEditorState(value)}
        onSave={handleSave}
        user={props.user}
      />
      {/*}<ClickAwayListener onClickAway={handleClickAway}>*/}
      <Container maxWidth="md" sx={{mt:2}}>
        <Paper sx={{
          minHeight:'80vh',p:5,'@media print':{}
        }} 
          elevation={0}
          //onClick={handleFocus} ERROR: atomic click
        >
          <Editor
            readOnly={readonly}
            placeholder="Write something."
            ref={editorRef}
            blockStyleFn={customBlockStyleFn}
            blockRendererFn={_customBlockRenderer}
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
          />
        </Paper>
      </Container>
      {/*</ClickAwayListener>*/}
      {entityKey && selectionType === "IMG" && (
        <Popper
          id='resize-trigger' 
          open={true}
          anchorEl={anchorEl}
          onClose={handleClickAway}
          sx={{zIndex:9999}}
          placement='bottom-end'
        >
          <Box 
            onMouseDown={handleScaleStart}
            sx={{cursor:'nwse-resize',bgcolor:'primary.main',border:'2px solid white',borderRadius:99,zIndex:99,width:'14px',height:'14px',transform:'translate(50%,-50%)'}}
          />
        </Popper>
      )}

      {popoverOpen && (

        <Popover 
          id={popoverId}
          open={popoverOpen}
          anchorEl={anchorEl}
          //placement='top'
          //sx={{zIndex:99}}
          onClose={handleClickAway}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          sx={{transform:'translateY(-16px)'}}
        >
              <Stack spacing={0.5} direction="row" sx={{p:.5,bgcolor:'common.black','& .MuiIconButton-root':{color:'white',borderRadius:'4px','&:hover':{bgcolor:'rgba(255,255,255,0.2)'}}}}>
                {selectionType === "IMG" && (
                  <>
                    <IconButton onClick={handleSet2Block}>
                      <ChangeCircleOutlinedIcon fontSize="small" />
                    </IconButton>
                    <ButtonBase 
                      sx={{padding:'7px',color:'white','&:hover':{bgcolor:'rgba(255,255,255,0.2)'}}} 
                      component="label" 
                      htmlFor="id_reupload_inline_img">
                      <UploadIcon fontSize="small" />
                    </ButtonBase>
                    <Box 
                      onChange={handleUpload}
                      component="input" 
                      type="file" 
                      sx={{display:'none'}} 
                      accept="image/*" 
                      id="id_reupload_inline_img"
                    />
                  </>
                )}
                {selectionType === "TEX" && (
                  <IconButton onClick={()=>handleEditEntity('tex')}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {selectionType === "PARAGRAPH" && (
                  <>
                    <IconButton 
                      sx={{bgcolor:inlineStyle.includes('BOLD') ? 'rgba(255,255,255,0.2)':undefined}}
                      onClick={()=>handleToggleStyle2('BOLD')}>
                      <FormatBoldIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      sx={{bgcolor:inlineStyle.includes('ITALIC') ? 'rgba(255,255,255,0.2)':undefined}}
                      onClick={()=>handleToggleStyle2('ITALIC')}>
                      <FormatItalicIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      sx={{bgcolor:inlineStyle.includes('UNDERLINE') ? 'rgba(255,255,255,0.2)':undefined}}
                      onClick={()=>handleToggleStyle2('UNDERLINE')}>
                      <FormatUnderlinedIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Popover>
      )}
      {selectionType === "TEX" && (
        <TeXDialog 
          open={open === 'tex'}
          onClose={handleClose}
          editorState={editorState}
          initialValue={activeEntity.getData()}
          onChange={handleDialogChange}
        />
      )}
    </Box>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App {...window.props} />
  </React.StrictMode>,
  document.getElementById('app')
)
