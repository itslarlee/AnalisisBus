import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useIdentity } from '../providers/IdentityProvider';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { updateIdentity } = useIdentity();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            updateIdentity(user);
            navigate('/');
        } catch (error) {
            setErrorMessage('Hubo un error iniciando sesión');
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;

        if (newPassword.length < 8) {
            setErrorMessage('La contraseña debe tener 8 o más caracteres');
        } else {
            setErrorMessage(null);
        }

        setPassword(newPassword);
    };

    return (
        <Container maxWidth="lg">
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-evenly"
                maxWidth={true}
            >
                <Box
                    maxWidth={true}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    p={2}
                    boxShadow={1}
                    height="50vh"
                    width="100%"
                    ml={5}
                    mt={15}
                >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Iniciar sesión
                    </Typography>
                    <TextField
                        label="Correo electrónico"
                        margin="normal"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Contraseña"
                        margin="normal"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={password}
                        onChange={handlePasswordChange} // Use the new handler
                    />
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            Iniciar sesión
                        </Button>
                    </Box>
                    <Typography variant="body1" align="center">
                        ¿No tienes una cuenta? <Link to="/signup">Registrarse</Link>
                    </Typography>
                    {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                </Box>
            </Box>
        </Container>
    );
}

export default SignIn;


