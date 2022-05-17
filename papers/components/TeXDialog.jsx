import React, { useEffect, useState } from 'react'
import { Entity, convertToRaw, Modifier, EditorState, AtomicBlockUtils } from 'draft-js'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import TeXTemplate from './TeXTemplate'
import TeXBlock from './TeXBlock'

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

  // choose from template
  // FIXME keep old data
  const handleChooseTemplate = (value) => {
    setForm({...form, content:form.content + value})
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
      maxWidth="md"
      open={open}
      onClose={onClose}>
      <DialogTitle>输入数学公式</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              multiline
              rows={4}
              //variant="standard"
              name="content"
              value={form.content ? form.content : ''}
              onChange={handleChange}
              placeholder="y = f(a + b)"
              sx={{mb:2}}
            />
            <Paper variant="outlined" sx={{py:5,textAlign:'center'}}>
              {form.content ? (
                <TeXBlock value={form.content} />
              ) : (
                <Typography variant="body2" color="textSecondary">公式预览</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper variant="outlined">
              <TeXTemplate onChoose={handleChooseTemplate} />
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box sx={{flex:1,px:2}}>
          <Link 
            target="_blank"
            rel="noopener"
            variant="body2" 
            href="#"
            color="textSecondary"
            sx={{}}
          >了解如何使用TeX公式
          </Link>
        </Box>
        <Button color="inherit" onClick={onClose}>取消</Button>
        <Button 
          onClick={handleSave} 
          disabled={formValid ? undefined : true}>插入</Button>
        </DialogActions>
      </Dialog>
  )
}
