import React from 'react'
import { AppBar, Toolbar, IconButton, Typography, Button } from '@material-ui/core'
import  MenuIcon  from '@material-ui/icons/Menu'
import { useNavigate} from 'react-router-dom'

const Header = ({setOpen}) => {
  const navigate = useNavigate()
  
  return (
    <AppBar color='secondary'>
				<Toolbar>
					<IconButton edge='start' color='inherit' onClick={() => setOpen(true)}>
						<MenuIcon />
					</IconButton>
					<Typography style={{ flexGrow: 1 }}>Autoevaluacion</Typography>
					<Button variant='text' color='inherit' onClick={() => navigate('/')}>Log out</Button>
				</Toolbar>
			</AppBar>
  )
}

export default Header