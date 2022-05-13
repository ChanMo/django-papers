import React, { useState } from 'react'
import Cookies from 'js-cookie'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { CompositeDecorator, Editor, EditorState, convertToRaw, convertFromRaw, Modifier } from 'draft-js'
import ImageBlock from './ImageBlock'
import TeXBlock from './TeXBlock'
import TableBlock from './TableBlock'

/**
 * handle image upload
 */
export const uploadImage = async(event) => {
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
    return resJson['file']
  } catch(err) {
    alert('上传失败')
    console.log(err)
  }
  return
}

/*
 * custom decorator for draft editor
 * include latexBlock
 */
export const decorator = new CompositeDecorator([
  {
    strategy: findTeXEntities,
    component: TeXBlock,
    //}, {
  //  strategy: findImage,
  //  component: InlineImageBlock,
  }
])

/**
 * find inline image entity from string
 */
function findImage(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        (contentState.getEntity(entityKey).getType() === 'IMG' ||
          contentState.getEntity(entityKey).getType() === 'IMAGE')
      );
    },
    callback
  );
}

/**
 * find latex inline entity for decorator
 */
function findTeXEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'TEX'
      );
    },
    callback
  );
}


export function customBlockStyleFn(contentBlock) {
  const type = contentBlock.getType()
  if (type === 'header-one') {
    return 'h1'
  } else if (type === 'header-two') {
    return 'h2'
  } else if (type === 'header-three') {
    return 'h3'
  } else if (type === 'ALIGNCENTER') {
    return 'text-center'
  } else {
    return 'unstyled'
  }
}


export function customBlockRenderer(block) {
  if (block.getType() === 'atomic') {
    return {
      component: CustomBlock,
      editable: false,
      props: {
        //onRemove: (blockKey) => null
      }
    }
  }
  return null
}


export function CustomBlock(props) {
  //const [open, setOpen] = useState(false)
  const { block, contentState, blockProps } = props;
  const key = block.getEntityAt(0)
  try {
    var entity = contentState.getEntity(key)
  } catch (err) {
    return null
  }
  const value = entity.getData();
  const type = entity.getType()
  //const handleOpen = () => {
  //  setOpen(true)
  //  blockProps.onStartEdit(null)
  //}
  //const handleClose = () => {
  //  blockProps.onCancelEdit()
  //  setOpen(false)
  //}
  const handleChange = (newValue) => {
    const newState = contentState.mergeEntityData(
      key,
      newValue
    )
    blockProps.onCloseEdit(newState)
  }
  //const handleDelete = () => {
  //  blockProps.onRemove(block.getKey())
  //}
  if(type === 'IMG') {
    return <ImageBlock data={value} />
  } else if(type === 'TABLE') {
    return <TableBlock data={value} onStartEdit={blockProps.onStartEdit} onCloseEdit={handleChange} />
  }

  return null
}