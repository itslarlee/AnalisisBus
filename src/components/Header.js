import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useIdentity } from '../providers/IdentityProvider';
import { doc, getDoc } from 'firebase/firestore';
import { UserRoles } from '../constants/constants';



function Header() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const navigate = useNavigate();
    const { updateIdentity, user } = useIdentity();
    const [currentUser, setCurrentUser] = React.useState()
    const [headerTabs, setHeaderTabs] = React.useState([])
    const [headerSettings, setHeaderSettings] = React.useState([])

    async function getUserByUid(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data();
            } else {
                console.log("No such user!");
                return null;
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }


    React.useEffect(() => {
        if (user && user.uid) {
            getUserByUid(user.uid).then(userData => {
                setCurrentUser(userData);
            });
        }
    }, [user]);


    React.useEffect(() => {
        if (currentUser && currentUser.role) {

            switch (currentUser.role) {
                case UserRoles.CLIENTE:
                    setHeaderTabs(['Cliente'])
                    setHeaderSettings(['Perfil', 'Cerrar Sesión'])
                    break;
                case UserRoles.CHOFER:
                    setHeaderTabs(['Chofer'])
                    setHeaderSettings(['Perfil', 'Cerrar Sesión'])
                    break;
                case UserRoles.ADMIN:
                    setHeaderTabs(['Admin'])
                    setHeaderSettings(['Perfil', 'Cerrar Sesión'])
                    break;

                default:
                    break;
            }

        }
    }, [currentUser]);





    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            updateIdentity(null);
            navigate('/signin');
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    return (
        <AppBar position="static" color="primary">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <IconButton
                        size="large"
                        aria-label="open navigation"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        color="inherit"
                        sx={{ display: { xs: 'flex', md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Navigation Menu */}
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        keepMounted
                        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{ display: { xs: 'block', md: 'none' } }}
                    >
                        {headerTabs.map((tab) => (
                            <MenuItem
                                key={tab}
                                onClick={handleCloseNavMenu}
                                component={RouterLink}
                                to={`/${tab.toLowerCase()}`}
                            >
                                {tab}
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* Navigation Buttons */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {headerTabs.map((tab) => (
                            <Button
                                key={tab}
                                color="inherit"
                                component={RouterLink}
                                to={`/${tab.toLowerCase()}`}
                            >
                                {tab}
                            </Button>
                        ))}
                    </Box>

                    {/* User Avatar */}
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        onClick={handleOpenUserMenu}
                        color="inherit"
                    >
                        <Avatar alt="User Avatar" />
                    </IconButton>

                    {/* User Menu */}
                    <Menu
                        id="menu-appbar-user"
                        anchorEl={anchorElUser}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        {headerSettings.map((setting) => (
                            <MenuItem
                                key={setting}
                                onClick={
                                    setting === 'Cerrar Sesión' ? handleSignOut : handleCloseUserMenu
                                }
                                component={RouterLink}
                                to={`/${setting.toLowerCase().replace(' ', '')}`}
                            >
                                {setting}
                            </MenuItem>
                        ))}
                    </Menu>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;
