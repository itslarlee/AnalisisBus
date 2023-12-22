import React, { useState } from 'react'
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useIdentity } from '../providers/IdentityProvider';
import creditCardType from 'credit-card-type';
import VisaIcon from '../icons/visa.svg';
import MastercardIcon from '../icons/mastercard.svg';
import AmexIcon from '../icons/amex.svg';
import CreditCardIcon from '../icons/credit-card.svg';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as Yup from 'yup';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useCrypto from '../hooks/useCrypto'
import { Box, TextField, Button, InputAdornment, Grid } from '@mui/material';
import { UserRoles } from '../constants/constants';
import { useNavigate } from 'react-router-dom';


function UserForm({ setErrorMessage, updateAuth = false, role = UserRoles.CLIENTE, handleCloseModal }) {

    const { updateIdentity } = useIdentity();
    const navigate = useNavigate();
    const [cardType, setCardType] = useState(null);
    const { encrypt } = useCrypto();



    let validationSchema

    if (role !== 'Chofer') {
        validationSchema = Yup.object({
            name: Yup.string().required('Nombre es requerido'),
            lastName: Yup.string().required('Apellido es requerido'),
            username: Yup.string()
                .required('Usuario es requerido')
                .matches(/^\S*$/, 'El usuario no puede contener espacios')
                .matches(/^[a-z0-9_]*$/, 'El usuario solo puede contener caracteres en minúscula, números y guiones bajos'),
            password: Yup.string().matches(/(?=.*[A-Z]).{8,}/, 'La contraseña debe tener al menos 8 caracteres y al menos una letra mayúscula').required('Contraseña es requerida'),
            cardNumber: Yup.string()
                .required('Número de tarjeta es requerido')
                .matches(/^(?:\d{4}[- ]?){3}\d{4}$/, 'Número de tarjeta inválido. Debe tener 16 dígitos y puede estar separado por espacios o guiones cada 4 dígitos'),
            birthdate: Yup.date()
                .nullable()
                .required('Fecha de nacimiento es requerida')
                .typeError('Fecha de nacimiento es requerida'),
            cvv: Yup.string().matches(/^\d{3}$/, 'CVV inválido').required('CVV es requerido'),
            expiryDate: Yup.string().matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Fecha de vencimiento inválida. Debe ser en formato MM/AA').required('Fecha de vencimiento es requerida'),
        });
    } else {
        validationSchema = Yup.object({
            name: Yup.string().required('Nombre es requerido'),
            lastName: Yup.string().required('Apellido es requerido'),
            username: Yup.string()
                .required('Usuario es requerido')
                .matches(/^\S*$/, 'El usuario no puede contener espacios')
                .matches(/^[a-z0-9_]*$/, 'El usuario solo puede contener caracteres en minúscula, números y guiones bajos'),
            password: Yup.string().matches(/(?=.*[A-Z]).{8,}/, 'La contraseña debe tener al menos 8 caracteres y al menos una letra mayúscula').required('Contraseña es requerida'),
            birthdate: Yup.date()
                .nullable()
                .required('Fecha de nacimiento es requerida')
                .typeError('Fecha de nacimiento es requerida'),
        });
    }

    const formik = useFormik({
        initialValues: {
            name: '',
            lastName: '',
            username: '',
            password: '',
            cardNumber: '',
            cvv: '',
            expiryDate: '',
            birthdate: null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, `${values.username}@analisisbus.com`, values.password);
                const user = userCredential.user;

                await setDoc(doc(db, 'users', user.uid), {
                    name: values.name,
                    lastName: values.lastName,
                    username: values.username,
                    cardNumber: encrypt(values.cardNumber),
                    cvv: encrypt(values.cvv),
                    expiryDate: encrypt(values.expiryDate),
                    birthdate: new Date(values.birthdate),
                    role: role,
                    balance: 0,
                    deactivated: false
                });

                if (updateAuth) {
                    updateIdentity(user);
                    navigate('/perfil');
                }

                if (handleCloseModal) {
                    handleCloseModal()
                }
            } catch (error) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        setErrorMessage('Nombre de usuario ya está en uso')
                        break;
                    default:
                        console.log(error);
                        break;
                }
            }
        },
    });


    const getCardIcon = (cardType) => {
        switch (cardType) {
            case 'visa':
                return <img width="40" height="40" src={VisaIcon} alt="Visa Icon" />;
            case 'mastercard':
                return <img width="40" height="40" src={MastercardIcon} alt="Mastercard Icon" />;
            case 'american-express':
                return <img width="40" height="40" src={AmexIcon} alt="American Express Icon" />;
            default:
                return <img width="40" height="40" src={CreditCardIcon} alt="Credit Card Icon" />;
        }
    }


    const handleCardNumberChange = (event) => {
        const newCardNumber = event.target.value;
        formik.setFieldValue('cardNumber', newCardNumber);
        if (newCardNumber) {
            const cardTypeInfo = creditCardType(newCardNumber);
            if (cardTypeInfo && cardTypeInfo.length > 0) {
                setCardType(cardTypeInfo[0].type);
            } else {
                setCardType(null);
            }
        } else {
            setCardType(null);
        }
    };

    return (
        <>

            <TextField
                label="Nombre"
                margin="normal"
                variant="outlined"
                fullWidth
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                name="name"
            />

            <TextField
                label="Apellido"
                margin="normal"
                variant="outlined"
                fullWidth
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                name="lastName"
            />

            <TextField
                label="Usuario"
                margin="normal"
                variant="outlined"
                fullWidth
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                name="username"
            />
            <TextField
                label="Contraseña"
                margin="normal"
                variant="outlined"
                fullWidth
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                name="password"
            />


            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Fecha de Nacimiento"
                    value={formik.values.birthdate}
                    onChange={(newValue) => formik.setFieldValue('birthdate', newValue)}
                    onBlur={formik.handleBlur('birthdate')}
                    error={formik.touched.birthdate && Boolean(formik.errors.birthdate)}
                    helperText={formik.touched.birthdate && formik.errors.birthdate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    name="birthdate"
                />
            </LocalizationProvider>

            {
                role !== 'Chofer' && (
                    <>
                        <TextField
                            label="Número de tarjeta"
                            margin="normal"
                            variant="outlined"
                            fullWidth
                            value={formik.values.cardNumber}
                            onChange={handleCardNumberChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                            helperText={formik.touched.cardNumber && formik.errors.cardNumber}
                            name="cardNumber"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {getCardIcon(cardType)}
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="CVV"
                                    margin="normal"
                                    variant="outlined"
                                    fullWidth
                                    value={formik.values.cvv}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                                    helperText={formik.touched.cvv && formik.errors.cvv}
                                    name="cvv"
                                    inputProps={{ maxLength: 3 }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Fecha de Vencimiento"
                                    margin="normal"
                                    variant="outlined"
                                    fullWidth
                                    value={formik.values.expiryDate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                                    helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                                    name="expiryDate"
                                    placeholder="MM/AA"
                                    inputProps={{ maxLength: 5 }}
                                />
                            </Grid>
                        </Grid>
                    </>
                )
            }

            <Box mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={formik.handleSubmit}
                    disabled={!formik.isValid}
                >
                    Registrar
                </Button>
            </Box>
        </>
    )
}

export default UserForm