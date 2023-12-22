import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Box, Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { useIdentity } from '../providers/IdentityProvider';

function Cobrar() {
    const [ruta, setRuta] = useState(null);
    const [username, setUsername] = useState('');
    const [costoRuta, setCostoRuta] = useState(0);
    const { user } = useIdentity();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        const fetchRutaChofer = async () => {
            const choferRef = doc(db, 'users', user.uid);
            const choferSnap = await getDoc(choferRef);

            if (choferSnap.exists()) {
                const choferData = choferSnap.data();
                // Ahora se realiza una consulta a la colección 'rutas' para encontrar la ruta con el código correspondiente
                const rutasRef = collection(db, 'rutas');
                const q = query(rutasRef, where('codigoRuta', '==', choferData.codigoRuta));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // Suponiendo que cada código de ruta es único, tomaremos el primer documento
                    const rutaData = querySnapshot.docs[0].data();
                    setRuta(rutaData);
                    setCostoRuta(rutaData.costoRuta);
                } else {
                    console.error('No se encontró una ruta con el código asignado al chofer');
                    // Puedes manejar este caso como consideres necesario
                }
            } else {
                console.error('El chofer no está registrado en la base de datos');
                // Manejar este caso como consideres necesario
            }
        };

        fetchRutaChofer();
    }, [user.uid]);

    const handleCobrar = async () => {
        // Suponiendo que user.uid es el UID del chofer actualmente autenticado
        const choferUid = user.uid; // Debes tener acceso a esta información desde el contexto o estado de autenticación

        // Busca el documento del chofer utilizando su UID
        const choferRef = doc(db, 'users', choferUid);
        const choferSnap = await getDoc(choferRef);


        if (!choferSnap.exists()) {
            setSnackbar({
                open: true,
                message: 'Chofer no encontrado',
                severity: 'error',
            });
            return;
        }
        const usernameChofer = choferSnap.data().username;
        // Busca el documento del cliente utilizando el username
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        // Suponiendo que hay un único documento que corresponde a este username

        if (querySnapshot.empty) {
            setSnackbar({
                open: true,
                message: 'El usuario no existe',
                severity: 'error',
            });
            return;
        }

        try {
            // Verifica si el usuario tiene suficiente balance
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            if (userData.balance < costoRuta) {
                setSnackbar({
                    open: true,
                    message: 'El usuario no tiene fondos suficientes',
                    severity: 'error',
                });

                // Crea el documento de cargo fallido
                const failedChargeData = {
                    usernameCliente: username,
                    usernameChofer: usernameChofer, // Asegúrate de obtener el nombre de usuario del chofer de choferData
                    codigoRuta: ruta.codigoRuta,
                    fecha: new Date(),
                    costo: costoRuta,
                };

                try {
                    await addDoc(collection(db, 'failedCharges'), failedChargeData);
                } catch (error) {
                    console.error('Error al registrar el cargo fallido:', error);
                }

                return;
            }
            await updateDoc(userDoc.ref, {
                balance: userData.balance - costoRuta
            });

            // Agrega el documento a la colección 'charges'
            const chargeData = {
                codigoRuta: ruta.codigoRuta,
                costo: costoRuta,
                usernameCliente: username,
                usernameChofer: usernameChofer,
                fechaCobro: new Date()
            };

            await addDoc(collection(db, 'charges'), chargeData);

            setSnackbar({
                open: true,
                message: `Cobro realizado correctamente a ${username}`,
                severity: 'success',
            });

            // Resetea los campos del formulario a su estado inicial
            setUsername('');

        } catch (error) {
            console.log(error);
        }

    };


    return (
        <>
            <Container maxWidth="sm">
                <Typography variant="h4" gutterBottom>
                    Cobrar
                </Typography>
                {ruta && (
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Ruta Asignada: {ruta.nombreRuta} | Costo: ₡{costoRuta}
                    </Typography>
                )}
                <TextField
                    label="Nombre de Usuario"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                />
                <Box mt={2}>
                    <Button
                        variant="contained"
                        onClick={handleCobrar}
                        disabled={!ruta || !username}
                    >
                        Cobrar
                    </Button>
                </Box>
            </Container>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default Cobrar;
