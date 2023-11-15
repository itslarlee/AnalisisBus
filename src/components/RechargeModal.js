import React, { useState } from 'react';
import { Box, Typography, Grid, Button, Modal, Snackbar, Alert } from '@mui/material';
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
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleRechargeClick = async () => {
        if (user && selectedAmount !== null) {
            const userRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userRef, {
                    balance: increment(selectedAmount)
                });
                setBalance(prevBalance => prevBalance + selectedAmount);
                setSnackbarMessage(`₡${selectedAmount.toLocaleString()} añadido correctamente!`);
                setOpenSnackbar(true);
                setSelectedAmount(null)
                handleClose(); // Cierra el modal después de la recarga
            } catch (error) {
                console.error('Error al añadir saldo: ', error);
                setSnackbarMessage('Error al añadir saldo');
                setOpenSnackbar(true);
            }
        }
    };

    const handleAmountSelection = (amount) => {
        setSelectedAmount(amount);
    };

    const handleCloseSnackbar = () => setOpenSnackbar(false);

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" mb={2}>
                        Añadir fondos
                    </Typography>
                    <Grid container spacing={2}>
                        {rechargeOptions.map((amount, index) => (
                            <Grid item xs={3} key={index}>
                                <Button variant="outlined" onClick={() => handleAmountSelection(amount)}>
                                    ₡{amount.toLocaleString()}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    {selectedAmount !== null && (
                        <Box mt={3}>
                            <Button variant="contained" color="primary" onClick={handleRechargeClick}>
                                Confirmar ₡{selectedAmount.toLocaleString()}
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