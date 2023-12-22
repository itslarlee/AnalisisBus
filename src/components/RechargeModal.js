import React, { useState } from 'react';
import { Box, Typography, Grid, Button, Modal, Snackbar, Alert, TextField } from '@mui/material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useIdentity } from '../providers/IdentityProvider';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const RechargeModal = ({ open, handleClose, rechargeOptions, setBalance }) => {
    const { user } = useIdentity();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [amountToRecharge, setAmountToRecharge] = useState('');



    const handleRechargeClick = async () => {
        const amount = Number(amountToRecharge);
        if (user && !isNaN(amount) && amount > 0) {
            const userRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userRef, {
                    balance: increment(amountToRecharge)
                });
                setBalance(prevBalance => Number(prevBalance) + amount);
                setSnackbarMessage(`₡${amountToRecharge.toLocaleString()} añadido correctamente!`);
                setOpenSnackbar(true);
                setAmountToRecharge('')
                handleClose(); // Cierra el modal después de la recarga
            } catch (error) {
                console.error('Error al añadir saldo: ', error);
                setSnackbarMessage('Error al añadir saldo');
                setOpenSnackbar(true);
            }
        }
    };

    const handleCustomAmountChange = (event) => {
        const value = event.target.value;
        const re = /^[0-9\b]+$/; // Regex para permitir solo números

        if (value === '' || re.test(value)) {
            setAmountToRecharge(value);
        }
    };

    const handleAmountSelection = (amount) => {
        setAmountToRecharge(amount);
    };

    const handleCloseSnackbar = () => setOpenSnackbar(false);

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" mb={2}>
                        Añadir fondos
                    </Typography>
                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Monto Personalizado"
                                variant="outlined"
                                fullWidth
                                value={amountToRecharge}
                                onChange={handleCustomAmountChange}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        {rechargeOptions.map((amount, index) => (
                            <Grid item xs={3} key={index}>
                                <Button variant="outlined" onClick={() => handleAmountSelection(amount)}>
                                    ₡{amount.toLocaleString()}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    {amountToRecharge && (
                        <Box mt={3}>
                            <Button variant="contained" color="primary" onClick={handleRechargeClick}>
                                Confirmar ₡{Number(amountToRecharge).toLocaleString()}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Modal>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default RechargeModal;