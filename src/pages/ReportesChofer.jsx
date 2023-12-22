import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useIdentity } from '../providers/IdentityProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function ReportesChofer() {
    const [dailyIncome, setDailyIncome] = useState([]);
    const { user } = useIdentity();
    const [rejectedUserDetails, setRejectedUserDetails] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dailyIncomes, setDailyIncomes] = useState([]);
    const [totalDailyIncome, setTotalDailyIncome] = useState(0);

    const getUsernameChofer = (email) => email.split('@')[0];

    // New function to handle fetching incomes for a specific day
    const fetchIncomesForDate = async (date) => {
        const dateString = date.toISOString().split('T')[0]; // Format selected date as YYYY-MM-DD
        const chargesRef = collection(db, 'charges');
        const chargesQuery = query(
            chargesRef,
            where('usernameChofer', '==', getUsernameChofer(user.email)),
            where('fechaCobro', '>=', new Date(dateString)),
            where('fechaCobro', '<', new Date(dateString + 'T23:59:59')) // End of the selected date
        );

        const querySnapshot = await getDocs(chargesQuery);
        let incomes = [];
        let totalIncome = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const income = {
                id: doc.id,
                usernameCliente: data.usernameCliente,
                route: data.codigoRuta,
                cost: data.costo,
                date: data.fechaCobro.toDate().toLocaleTimeString(), // Format time for display
            };
            incomes.push(income);
            totalIncome += data.costo;
        });

        setDailyIncomes(incomes);
        setTotalDailyIncome(totalIncome);
    };

    useEffect(() => {
        if (user?.email) {
            fetchIncomesForDate(selectedDate);
        }
    }, [selectedDate, user?.email]);
    useEffect(() => {

        const fetchDriverData = async (driverUsername) => {
            const chargesRef = collection(db, 'charges');
            const chargesQuery = query(chargesRef, where('usernameChofer', '==', driverUsername));
            const chargesSnapshot = await getDocs(chargesQuery);

            const failedChargesRef = collection(db, 'failedCharges');
            const failedChargesQuery = query(failedChargesRef, where('usernameChofer', '==', driverUsername));
            const failedChargesSnapshot = await getDocs(failedChargesQuery);


            const rejectionsDetails = [];
            failedChargesSnapshot.forEach(doc => {
                const data = doc.data();
                const dateObject = data.fecha.toDate(); // Get the Date object for sorting
                rejectionsDetails.push({
                    username: data.usernameCliente, // Replace with actual field name if different
                    route: data.codigoRuta, // Replace with actual field name if different
                    cost: data.costo, // Replace with actual field name if different
                    date: dateObject.toLocaleDateString(), // Format the date for display
                    dateObject: dateObject // Store the Date object for sorting
                });
            });

            // Sort rejectionsDetails by the dateObject
            rejectionsDetails.sort((a, b) => b.dateObject - a.dateObject);

            // Remove the dateObject property before setting state
            const sortedRejections = rejectionsDetails.map(({ dateObject, ...rest }) => rest);

            setRejectedUserDetails(sortedRejections);

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


        };

        if (user?.email) {
            const driverUsername = getUsernameChofer(user.email);
            fetchDriverData(driverUsername);
        }
    }, [user?.email]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">

            {/* Table for Incomes of Selected Date */}
            <Typography variant='h5' gutterBottom style={{ marginTop: '20px' }}>

                Ingresos del {selectedDate.toLocaleDateString()}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Seleccionar fecha"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>

            <TableContainer component={Paper} style={{ marginTop: '20px', maxWidth: 700 }}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Ruta</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell align="right">Costo</TableCell>
                            <TableCell align="right">Hora</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dailyIncomes.map((income) => (
                            <TableRow key={income.id}>
                                <TableCell component="th" scope="row">
                                    {income.route}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {income.usernameCliente}
                                </TableCell>
                                <TableCell align="right">{income.cost}</TableCell>
                                <TableCell align="right">{income.date}</TableCell>
                            </TableRow>
                        ))}
                        {/* Row to display the total income */}
                        <TableRow>
                            <TableCell colSpan={2}>Total Ingresos</TableCell>
                            <TableCell align="right">{totalDailyIncome}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

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


            <Typography variant='h5' gutterBottom style={{ marginTop: '20px' }}>

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


        </Box>
    );
}

export default ReportesChofer;
