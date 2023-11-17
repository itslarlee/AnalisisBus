import React, { useState } from 'react';
import { Box, Container, Typography, Alert, } from '@mui/material';
import { UserRoles } from '../constants/constants';
import { Link, useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';


function SignUp() {

  const [errorMessage, setErrorMessage] = useState(null);

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.paper"
        p={2}
        boxShadow={1}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Registrarse
        </Typography>

        <UserForm
          updateAuth
          setErrorMessage={setErrorMessage}
        />

        <Typography variant="body1" align="center">
          ¿Ya tienes una cuenta? <Link to="/signin">Iniciar sesión</Link>
        </Typography>
        <Box>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Box>
      </Box>

    </Container>
  );
}

export default SignUp;
