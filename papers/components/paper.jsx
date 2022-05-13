import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Modifier, SelectionState, Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, AtomicBlockUtils } from 'draft-js'
import 'draft-js/dist/Draft.css'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Cookies from 'js-cookie'

import Header from './Header'

import { CustomBlock, customBlockStyleFn, decorator } from './utils'


function App(props) {
  const [data, setData] = useState({})
  const [editorState, setEditorState] = useState(EditorState.createEmpty(decorator))
  const [readonly, setReadonly] = useState(false)

  const editorRef = useRef(null)

  // auto focus
  useEffect(() => {
    editorRef && editorRef.current && editorRef.current.focus()
  }, [])

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

  return (
    <>
      <Header
        data={data}
        editorState={editorState}
        onToggleStyle={handleToggleStyle}
        onChange={(value) => setEditorState(value)}
        onSave={handleSave}
        user={props.user}
      />
      <Container maxWidth="md" sx={{mt:2}}>
        <Paper sx={{minHeight:'80vh',p:5,'@media print':{}}} 
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
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App {...window.props} />
  </React.StrictMode>,
  document.getElementById('app')
)
