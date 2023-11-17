import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Box, Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { useIdentity } from '../providers/IdentityProvider';

function Cobrar() {
    const [rutas, setRutas] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
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
        const fetchRutas = async () => {
            const querySnapshot = await getDocs(collection(db, 'rutas'));
            setRutas(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchRutas();
    }, []);

    useEffect(() => {
        const ruta = rutas.find(r => r.codigoRuta === selectedRoute);
        setCostoRuta(ruta ? ruta.costoRuta : 0);
    }, [selectedRoute, rutas]);

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
                    codigoRuta: selectedRoute,
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
                codigoRuta: selectedRoute,
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
            setSelectedRoute('');
            setUsername('');
            setCostoRuta(0);

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
                <FormControl fullWidth>
                    <InputLabel id="ruta-select-label">Código de Ruta</InputLabel>
                    <Select
                        labelId="ruta-select-label"
                        value={selectedRoute}
                        label="Código de Ruta"
                        onChange={(e) => setSelectedRoute(e.target.value)}
                    >
                        {rutas.map((ruta) => (
                            <MenuItem key={ruta.id} value={ruta.codigoRuta}>
                                {ruta.codigoRuta}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Precio: ₡{costoRuta}
                </Typography>
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
                        disabled={!selectedRoute || !username}
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
