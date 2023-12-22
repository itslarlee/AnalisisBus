import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate de tener esta importación para tu instancia de Firestore
import { useIdentity } from '../providers/IdentityProvider';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { Box, Typography } from '@mui/material';

function ReportesClientes() {
    const [reportData, setReportData] = useState({ expensesByMonth: {}, routesByMonth: {} });
    const { user } = useIdentity();
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#81d8d0'];

    useEffect(() => {
        // Función para obtener el usernameCliente del email
        const getUsernameCliente = (email) => email.split('@')[0];

        // Función para obtener los datos de Firestore
        const fetchChargesData = async (username) => {
            const chargesColRef = collection(db, 'charges');
            const q = query(chargesColRef, where('usernameCliente', '==', username));
            const querySnapshot = await getDocs(q);
            let chargesData = [];
            querySnapshot.forEach((doc) => {
                chargesData.push({ id: doc.id, ...doc.data() });
            });
            return chargesData;
        };

        // Función para procesar los datos para reportes
        const processDataForReports = (chargesData) => {
            let expensesByMonth = {};
            let routesByMonth = {};

            chargesData.forEach((charge) => {
                // Ensure that fechaCobro is converted properly from Firestore timestamp
                const date = charge.fechaCobro.toDate ? charge.fechaCobro.toDate() : new Date(charge.fechaCobro);
                const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`; // Format as "Month-Year"

                // Accumulate expenses by month
                if (!expensesByMonth[monthYear]) {
                    expensesByMonth[monthYear] = 0;
                }
                expensesByMonth[monthYear] += charge.costo;

                // Record routes by month
                if (!routesByMonth[monthYear]) {
                    routesByMonth[monthYear] = [];
                }
                routesByMonth[monthYear].push(charge.codigoRuta);
            });

            return { expensesByMonth, routesByMonth };
        };



        // Si hay un usuario conectado
        if (user?.email) {
            const username = getUsernameCliente(user.email);
            fetchChargesData(username).then((chargesData) => {
                const processedData = processDataForReports(chargesData);
                setReportData(processedData);
            });
        }
    }, [user?.email]);

    const expensesChartData = reportData.expensesByMonth
        ? Object.entries(reportData.expensesByMonth).map(([month, Gasto]) => ({
            month,
            Gasto,
        }))
        : [];

    const allRoutes = new Set(
        Object.values(reportData.routesByMonth).reduce((acc, curr) => acc.concat(curr), [])
    );

    const uniqueRoutes = Array.from(allRoutes);

    const routesChartData = Object.keys(reportData.routesByMonth).map(month => {
        const monthRoutes = reportData.routesByMonth[month];
        const monthData = { month };

        uniqueRoutes.forEach(route => {
            monthData[route] = monthRoutes.filter(r => r === route).length;
        });

        return monthData;
    });


    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant='h5' gutterBottom style={{ marginTop: '20px' }}>
                Gastos por Mes
            </Typography>

            <Box display="flex" justifyContent="center" width="100%" margin="20px">
                <BarChart
                    width={600}
                    height={300}
                    data={expensesChartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                        dataKey="Gasto"
                        fill="#1769aa"
                    />
                </BarChart>
            </Box>

            <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                Rutas Utilizadas por Mes
            </Typography>

            <BarChart
                width={600}
                height={300}
                data={routesChartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {uniqueRoutes.map((route, index) => (
                    <Bar
                        key={route}
                        dataKey={route}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                    />
                ))}
            </BarChart>
        </Box>
    );
}

export default ReportesClientes;
