/**
 * ImageBlock
 * editing: check is editing.
 * TODO images list
 * [*] resize
 * FIXME popperId
 */

import React, { useEffect, useState, useRef } from 'react'
import Cookies from 'js-cookie'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import UploadIcon from '@mui/icons-material/Upload';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';

import { styled } from '@mui/material/styles';


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

export default function ImageBlock(props) {
  const [readonly, setReadonly] = useState(true)
  const [form, setForm] = useState(props.data)
  const [anchorEl, setAnchorEl] = useState(null)
  const [scaling, setScaling] = useState(false)
  const [start, setStart] = useState(0)

  const imgRef = useRef()
  useEffect(() => {
    if(imgRef.current && !props.data.width) {
      const width = imgRef.current.clientWidth
      setForm({...props.data, width:width})
    }
  }, [props.data])

  const maxWidth = imgRef.current ? imgRef.current.closest('figure').clientWidth : -1

  const handleClick = (event) => {
    setReadonly(false)
    setAnchorEl(event.currentTarget)
    props.onStartEdit()
  }

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
      setForm({...form, src:resJson['path']})
    } catch(err) {
      alert('上传失败')
      console.log(err)
    }
  }



  const handleChange = (event, value) => {
    setForm({...form, alignment:value})
  }

  const handleSave = () => {
    if(!readonly) {
      setReadonly(true)
      props.onCloseEdit(form)
    }
  }

  const handleScaleStart = (event) => {
    setScaling(true)
    setStart(event.screenX)
  }

  const handleScaling = () => {
    if(scaling && event.screenX) {
      const width = event.screenX - start
      let resWidth = width + form.width
      if(resWidth > maxWidth) {
        resWidth = maxWidth
      } else if (resWidth <= 50) {
        resWidth = 50
      }
      //setForm({...form, width:resWidth})
      setStart(event.screenX)
      const res = {...form, width:resWidth}
      setForm(res)
      //props.onCloseEdit(res)
    }
  }

  const popperId = 'image-popper'
  const popperOpen = !readonly

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

  let width
  if(form.alignment === 'justify') {
    width = '100%'
  } else if (form.width) {
    width = form.width
  }
  return (
    <ClickAwayListener onClickAway={handleSave}>
      <Box sx={{textAlign:form.alignment !== 'justify' ? form.alignment : undefined}} onMouseMove={handleScaling}>
        <Box sx={{display:'inline-block',position:'relative'}}>
          <Box
            ref={imgRef}
            onClick={handleClick}
            component="img"
            src={form.src}
            //sx={[readonly ? {} : {outline:'4px solid',outlineColor:'#1976d2',borderRadius:1},{maxWidth:'100%',width:form.alignment === 'justify' ? '100%' : undefined}]}
            sx={[readonly ? {} : {outline:'4px solid',outlineColor:'#1976d2',borderRadius:1},{maxWidth:'100%',width:width}]}
            alt=''
          />
          {!readonly && (

            <Box 
              onMouseDown={handleScaleStart}
              sx={{cursor:'nwse-resize',position:'absolute',bottom:0,right:0,bgcolor:'primary.main',border:'2px solid white',borderRadius:99,transform:'translate(80%,30%)',zIndex:99,width:'14px',height:'14px'}} />
          )}
        </Box>
        <Popper 
          id={popperId}
          open={popperOpen}
          anchorEl={anchorEl}
          placement='top'
          sx={{zIndex:99}}
        >
          <Paper elevation={0} sx={{display:'flex',alignItems:'center',flexWrap:'wrap',mb:2,bgcolor:'common.black'}}>
            <StyledToggleButtonGroup 
              size="small"
              onChange={handleChange}
              value={form.alignment ? form.alignment : 'left'} 
              exclusive>
              <ToggleButton value="left" aria-label="align left">
                <FormatAlignLeftIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="center" aria-label="align center">
                <FormatAlignCenterIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="right" aria-label="align right">
                <FormatAlignRightIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="justify" aria-label="align justify">
                <FormatAlignJustifyIcon fontSize="small" />
              </ToggleButton>
            </StyledToggleButtonGroup>
            <Divider orientation="vertical" flexItem sx={{mx:0.5, my:1}} />
            <Box sx={{borderRadius:'4px',overflow:'hidden',mx:'4px'}}>
              <ButtonBase 
                onClick={props.onSet2Inline}
                sx={{padding:'7px',color:'white','&:hover':{bgcolor:'rgba(255,255,255,0.2)'}}}>
                <ChangeCircleOutlinedIcon fontSize="small" />
              </ButtonBase>
              <ButtonBase 
                sx={{padding:'7px',color:'white','&:hover':{bgcolor:'rgba(255,255,255,0.2)'}}} 
                component="label" 
                htmlFor="id_reupload_img">
                <UploadIcon fontSize="small" />
              </ButtonBase>
              <Box 
                onChange={handleUpload}
                component="input" 
                type="file" 
                sx={{display:'none'}} 
                accept="image/*" 
                id="id_reupload_img"
              />
            </Box>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}
