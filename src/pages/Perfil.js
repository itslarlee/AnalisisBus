import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, CardContent, Card, } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { useIdentity } from '../providers/IdentityProvider';
import { db } from '../firebase';
import RechargeModal from '../components/RechargeModal';


function Perfil() {
    const { user } = useIdentity();
    const [balance, setBalance] = useState(null);
    const [open, setOpen] = useState(false);
    const [userDB, setUserDB] = useState()

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const fetchBalance = async () => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                try {
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        setBalance(userDoc.data().balance);
                        setUserDB(userDoc.data());
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error getting document:", error);
                }
            }
        };

        fetchBalance();
    }, [user]);



    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            {userDB &&
                <>
                    <Card sx={{ marginTop: 4, padding: 2, borderRadius: '20px' }}>
                        <CardContent>
                            <Typography variant="h4" component="h1">
                                {`${userDB.name} ${userDB.lastName}`}
                            </Typography>
                            <Typography variant="subtitle1" component="h2" gutterBottom sx={{ mb: 2 }}>
                                {`${userDB.username} - ${userDB.role}`}
                            </Typography>

                            {
                                userDB.role === 'Cliente' && (
                                    <>
                                        <Typography variant="h3" gutterBottom>
                                            ₡{balance !== null ? balance.toLocaleString() : 'Cargando...'}
                                        </Typography>
                                        <Button variant="contained" onClick={handleOpen} sx={{ mt: 2 }}>
                                            + Agregar fondos
                                        </Button>
                                    </>
                                )
                            }

                        </CardContent>
                    </Card>
                    <RechargeModal
                        open={open}
                        handleClose={handleClose}
                        rechargeOptions={[1000, 2000, 5000, 10000]}
                        setBalance={setBalance}
                    />
                </>
            }
        </Container>
    );
}

export default Perfil;
