import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useIdentity } from '../providers/IdentityProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';


function ReportesChofer() {
    const [dailyIncome, setDailyIncome] = useState([]);
    const [rejectedUsers, setRejectedUsers] = useState([]);
    const { user } = useIdentity();
    const [rejectedUserDetails, setRejectedUserDetails] = useState([]);

    useEffect(() => {
        const getUsernameChofer = (email) => email.split('@')[0];

        const fetchDriverData = async (driverUsername) => {
            const chargesRef = collection(db, 'charges');
            const chargesQuery = query(chargesRef, where('usernameChofer', '==', driverUsername));
            const chargesSnapshot = await getDocs(chargesQuery);

            const failedChargesRef = collection(db, 'failedCharges');
            const failedChargesQuery = query(failedChargesRef, where('usernameChofer', '==', driverUsername));
            const failedChargesSnapshot = await getDocs(failedChargesQuery);


            // Process failed charges for rejected users
            const rejectionsDetails = [];
            failedChargesSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.fecha.toDate().toLocaleDateString();
                rejectionsDetails.push({
                    username: data.usernameCliente, // Replace with actual field name if different
                    route: data.codigoRuta, // Replace with actual field name if different
                    cost: data.costo, // Replace with actual field name if different
                    date: date
                });
            });

            // Update state with the details of rejected users
            setRejectedUserDetails(rejectionsDetails);

            const incomeByDay = {};
            chargesSnapshot.forEach(doc => {
                const data = doc.data();
                // Convert the fechaCobro to an ISO string for consistent formatting
                const date = data.fechaCobro.toDate().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format

                if (!incomeByDay[date]) {
                    incomeByDay[date] = 0;
                }

                incomeByDay[date] += data.costo;
            });

            // Convert the incomeByDay object into an array and sort by date
            const sortedIncome = Object.entries(incomeByDay)
                .map(([date, total]) => ({ date, total }))
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date in descending order

            setDailyIncome(sortedIncome);
            // Process failed charges for rejected users
            const rejectionsByDay = {};
            failedChargesSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.fecha.toDate().toLocaleDateString();
                rejectionsByDay[date] = (rejectionsByDay[date] || 0) + 1;
            });


            setRejectedUsers(Object.entries(rejectionsByDay).map(([date, count]) => ({ date, count })));
        };

        if (user?.email) {
            const driverUsername = getUsernameChofer(user.email);
            fetchDriverData(driverUsername);
        }
    }, [user?.email]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant='h5' gutterBottom style={{ marginTop: '20px' }}>
                Ingresos Diarios
            </Typography>

            <BarChart
                width={500}
                height={300}
                data={dailyIncome}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Ingresos" />
            </BarChart>


            <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                Usuarios Rechazados
            </Typography>
            <TableContainer component={Paper} style={{ marginTop: '20px', maxWidth: 700 }}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Usuario</TableCell>
                            <TableCell align="right">Ruta</TableCell>
                            <TableCell align="right">Costo de Ruta</TableCell>
                            <TableCell align="right">Fecha</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rejectedUserDetails.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {row.username}
                                </TableCell>
                                <TableCell align="right">{row.route}</TableCell>
                                <TableCell align="right">{row.cost}</TableCell>
                                <TableCell align="right">{row.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                Usuarios Rechazados
            </Typography>

            <BarChart
                width={500}
                height={300}
                data={rejectedUsers}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Rechazados" />
            </BarChart>
        </Box>
    );
}

export default ReportesChofer;
