import React, { useState, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { db } from '../firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const RouteForm = ({ route, handleCloseModal }) => {
    const [formData, setFormData] = useState({
        nombreRuta: '',
        codigoRuta: '',
        provinciaOrigen: '',
        cantonOrigen: '',
        provinciaDestino: '',
        cantonDestino: '',
        costoRuta: 0,
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        if (route) {
            setFormData({ ...route });
        }
    }, [route]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedValue = name === 'costoRuta' ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const collectionRef = collection(db, 'rutas');
            if (route) {
                // Estamos editando una ruta existente
                await setDoc(doc(collectionRef, route.id), formData);
                showSnackbar('Ruta actualizada con éxito', 'success');
            } else {
                // Estamos agregando una nueva ruta
                await addDoc(collectionRef, formData);
                showSnackbar('Ruta agregada con éxito', 'success');
            }
            handleCloseModal();
        } catch (error) {
            showSnackbar('Error al procesar la ruta', 'error');
        }
    };
    return (
        <>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Nombre de Ruta"
                    name="nombreRuta"
                    value={formData.nombreRuta}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Código de Ruta"
                    name="codigoRuta"
                    value={formData.codigoRuta}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Provincia Origen"
                    name="provinciaOrigen"
                    value={formData.provinciaOrigen}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Cantón Origen"
                    name="cantonOrigen"
                    value={formData.cantonOrigen}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Provincia Destino"
                    name="provinciaDestino"
                    value={formData.provinciaDestino}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Cantón Destino"
                    name="cantonDestino"
                    value={formData.cantonDestino}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Costo de Ruta"
                    name="costoRuta"
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                    value={formData.costoRuta}
                    onChange={handleChange}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    {route ? 'Actualizar Ruta' : 'Agregar Ruta'}
                </Button>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default RouteForm;
