import React from 'react'
import { Typography, Container } from '@material-ui/core'
const Footer = () => {
    return (
        <footer style={{ bottom: 0, position: 'fixed', width: '100%' }}>
            <Container maxWidth='sm'>
                <Typography align='center'>Mditran © {new Date().getFullYear()}</Typography>
            </Container>
        </footer>
    )
}

export default Footer