import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Modal, Box, Alert, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UserForm from '../components/UserForm';
import { UserRoles } from '../constants/constants';

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

function Choferes() {
    const [choferes, setChoferes] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [rutas, setRutas] = useState([]);


    // Función para manejar la apertura del modal
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    // Función para manejar el cierre del modal
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const fetchChoferes = async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'Chofer'));
        const querySnapshot = await getDocs(q);
        const choferesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChoferes(choferesData);
    };

    const fetchRutas = async () => {
        const querySnapshot = await getDocs(collection(db, 'rutas'));
        const rutasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRutas(rutasData);
    };

    useEffect(() => {
        fetchChoferes();
        fetchRutas();
    }, []);

    useEffect(() => {
        fetchChoferes();
    }, [openModal]);

    const handleSelectChange = async (choferId, selectedRutaId) => {
        const choferRef = doc(db, 'users', choferId);
        try {
            await updateDoc(choferRef, {
                codigoRuta: selectedRutaId
            });
            // Opcional: Actualizar el estado local si es necesario
            setChoferes(choferes.map(chofer => chofer.id === choferId ? { ...chofer, codigoRuta: selectedRutaId } : chofer));
        } catch (error) {
            console.error("Error updating document: ", error);
            // Opcional: Manejar el error mostrando un mensaje al usuario
            setErrorMessage("Error al actualizar la información del chofer.");
        }
    };

    // const handleDelete = async (id) => {
    //     await deleteDoc(doc(db, 'users', id));
    //     setChoferes(choferes.filter((chofer) => chofer.id !== id));
    // };


    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                    sx={{ margin: 2 }} // Ajusta el margen según sea necesario
                    variant="contained"
                    color="primary"
                    onClick={handleOpenModal}
                >
                    Agregar Chofer
                </Button>
            </Box>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle}>
                    <UserForm setErrorMessage={setErrorMessage} role={UserRoles.CHOFER} handleCloseModal={handleCloseModal} />
                    <Box>
                        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                    </Box>
                </Box>
            </Modal>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>


                <TableContainer component={Paper} sx={{ maxHeight: 440, width: '50%' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Apellido</TableCell>
                                <TableCell>Nombre de Usuario</TableCell>
                                <TableCell>Ruta</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {choferes.map((chofer) => (
                                <TableRow key={chofer.id}>
                                    <TableCell>{chofer.name}</TableCell>
                                    <TableCell>{chofer.lastName}</TableCell>
                                    <TableCell>{chofer.username}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={chofer.codigoRuta || ''}
                                            onChange={(event) => handleSelectChange(chofer.id, event.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>Sin Asignar</em>
                                            </MenuItem>
                                            {rutas.map((ruta) => (
                                                <MenuItem key={ruta.id} value={ruta.codigoRuta}>
                                                    {ruta.nombreRuta}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
}

export default Choferes;
