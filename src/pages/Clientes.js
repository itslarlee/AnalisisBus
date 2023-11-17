import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block'; // Este ícono puede representar la acción de desactivar

function Clientes() {
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        const fetchClientes = async () => {
            const q = query(collection(db, 'users'), where('role', '==', 'Cliente'));
            const querySnapshot = await getDocs(q);
            setClientes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchClientes();
    }, []);

    const handleDeactivate = async (id, isDeactivated) => {
        try {
            const userRef = doc(db, 'users', id);
            await updateDoc(userRef, { deactivated: !isDeactivated });
            setClientes(clientes.map((cliente) => cliente.id === id ? { ...cliente, deactivated: !isDeactivated } : cliente));
        } catch (error) {
            console.error('Error al cambiar el estado del cliente:', error);
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Apellido</TableCell>
                        <TableCell>Nombre de Usuario</TableCell>
                        <TableCell>Desactivar</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {clientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                            <TableCell>{cliente.name}</TableCell>
                            <TableCell>{cliente.lastName}</TableCell>
                            <TableCell>{cliente.username}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outlined"
                                    color={cliente.deactivated ? "success" : "error"}
                                    onClick={() => handleDeactivate(cliente.id, cliente.deactivated)}
                                    disabled={cliente.checkingStatus}
                                >
                                    {cliente.deactivated ? "Activar" : "Desactivar"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default Clientes;
