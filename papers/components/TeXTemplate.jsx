import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import katex from 'katex'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Grid from '@mui/material/Grid'
import ButtonBase from '@mui/material/ButtonBase'
import TeXBlock from './TeXBlock'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


const data1 = [
  ['+', '-', '*', '/', '\cdot'],
  ['\sum', '\int', '\prod'],
  ['\\frac{a}{b}', '\\binom{n}{k}', '{n\\brace k}', '{n\\brack k}'],
  ['\\forall', '\\complement', '\\therefore', '\\emptyset', '\\exists', '\\subset', '\\because', '\\supset']
]

const data = [
  {'value': 'f(x) = {{{a_0}} \\over 2} + \\sum\\limits_{n = 1}^\\infty {({a_n}\\cos {nx} + {b_n}\\sin {nx})}', 'label': '傅立叶级数'},
  {'value': 'e ^ { x } = 1 + \\frac { x } { 1 ! } + \\frac { x ^ { 2 } } { 2 ! } + \\frac { x ^ { 3 } } { 3 ! } + \\cdots , \\quad - \\infty < x < \\infty', 'label':'泰勒展开式'}
]


export default function TexTemplate(props) {
  const [value, setValue] = useState(0)
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  return (
    <Box>
      <Box sx={{borderBottom:1, borderColor:'divider'}}>
        <Tabs 
          variant="fullWidth"
          value={value} 
          onChange={handleChange} 
          aria-label="basic tabs">
          <Tab label="常用符号" {...a11yProps(0)} />
          <Tab label="公式" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {data1.map((row,rowIndex) => (
          <Grid container key={rowIndex.toString()} sx={{mb:3}}>
            {row.map((col, colIndex) => (
              <Grid item key={colIndex.toString()} xs={3} 
                sx={{textAlign:'center'}}>
                <ButtonBase 
                  onClick={()=>props.onChoose(col)}
                  sx={{p:1,'&:hover':{bgcolor:'grey.200'}}}>
                  <TeXBlock value={col} />
                </ButtonBase>
              </Grid>
            ))}
          </Grid>
        ))}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {data.map((item, index) => (
          <Box sx={{mb:3}} key={index.toString()}>
            <Typography variant="body2" sx={{mb:1}}>{item.label}</Typography>
            <ButtonBase 
              onClick={()=>props.onChoose(item.value)}
              sx={{overflow:'hidden','&:hover':{bgcolor:'grey.200'}}}>
              <TeXBlock value={item.value} />
            </ButtonBase>
          </Box>
        ))}
      </TabPanel>
    </Box>
  )
}
