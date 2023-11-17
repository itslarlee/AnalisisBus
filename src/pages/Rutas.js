import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Modal,
    Box,
    TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RouteForm from '../components/RouteForm';


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

function Rutas() {
    const [rutas, setRutas] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const fetchRutas = async () => {
        const q = query(collection(db, 'rutas'));
        const querySnapshot = await getDocs(q);
        setRutas(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    useEffect(() => {

        fetchRutas();
    }, [openModal]);
    const handleOpenModal = (route = null) => {
        setSelectedRoute(route);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };


    // Función para eliminar una ruta
    const deleteRoute = async (id) => {
        try {
            await deleteDoc(doc(db, 'rutas', id));
            setRutas(rutas.filter((route) => route.id !== id)); // Actualizar el estado local
        } catch (error) {
            console.error("Error al eliminar la ruta:", error);
        }
    };

    return (
        <>
            <Button
                sx={{ margin: 2 }}
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
            >
                Agregar Ruta
            </Button>

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{ ...modalStyle }}>
                    <RouteForm route={selectedRoute} handleCloseModal={handleCloseModal} />
                </Box>
            </Modal>

            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre de la Ruta</TableCell>
                            <TableCell>Código de la Ruta</TableCell>
                            <TableCell>Provincia Origen</TableCell>
                            <TableCell>Cantón Origen</TableCell>
                            <TableCell>Provincia Destino</TableCell>
                            <TableCell>Cantón Destino</TableCell>
                            <TableCell>Costo de la Ruta</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rutas.map((ruta) => (
                            <TableRow key={ruta.id}>
                                <TableCell>{ruta.nombreRuta}</TableCell>
                                <TableCell>{ruta.codigoRuta}</TableCell>
                                <TableCell>{ruta.provinciaOrigen}</TableCell>
                                <TableCell>{ruta.cantonOrigen}</TableCell>
                                <TableCell>{ruta.provinciaDestino}</TableCell>
                                <TableCell>{ruta.cantonDestino}</TableCell>
                                <TableCell>₡{ruta.costoRuta}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(ruta)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => deleteRoute(ruta.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default Rutas;