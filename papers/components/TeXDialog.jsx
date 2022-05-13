import React, { useState} from 'react'
import { Entity, convertToRaw, Modifier, EditorState, AtomicBlockUtils } from 'draft-js'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

export default function TeXDialog(props) {
  const { open, onClose, editorState, onChange } = props
  const [form, setForm] = useState({})

  const handleSave = () => {
    const content = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const entity = content.createEntity('TEX', 'IMMUTABLE', form)
    const key = entity.getLastCreatedEntityKey()

    // create selection for apply entity
    const firstBlank = Modifier.insertText(
        content, editorState.getSelection(), ' '
    )
    const withEntity = Modifier.insertText(
      firstBlank,
      selection,
      ' ',
      null,
      key,
    )
    const withBlank = Modifier.insertText(
      withEntity,
      selection,
      ' '
    )
    onChange(EditorState.push(
      editorState,
      withBlank,
      'insert-characters'
    ))
  }

  const handleChange = (event) => {
    const name = event.target.name
    const value = event.target.value
    setForm({...form, [name]:value})
  }

  const formValid = form.content && form.content.length > 0
  
  return (
    <Dialog 
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}>
      <DialogTitle>输入数学公式</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="standard"
          name="content"
          value={form.content ? form.content : ''}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>取消</Button>
        <Button 
          onClick={handleSave} 
          disabled={formValid ? undefined : true}>插入</Button>
      </DialogActions>
    </Dialog>
  )
}
