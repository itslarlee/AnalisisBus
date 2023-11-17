import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useIdentity } from '../providers/IdentityProvider';
import { doc, getDoc } from 'firebase/firestore';

function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { updateIdentity } = useIdentity();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (username === '' || password === '') {
            setErrorMessage('Por favor ingrese las credenciales');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, `${username}@analisisbus.com`, password);
            const userRef = doc(db, 'users', userCredential.user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists() && userSnap.data().deactivated) {
                setErrorMessage('La cuenta está desactivada.');
                await auth.signOut();
            } else {
                updateIdentity(userCredential.user);
                navigate('/');
            }
        } catch (error) {
            setErrorMessage('El correo/contraseña ingresado es inválido');
        }
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
                        label="Nombre de Usuario"
                        margin="normal"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Contraseña"
                        margin="normal"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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


