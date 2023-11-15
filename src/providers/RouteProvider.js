import { Navigate, useRoutes } from 'react-router-dom';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import PageWrapper from '../components/PageWrapper';
import Header from '../components/Header';
import { useIdentity } from './IdentityProvider';
import Perfil from '../pages/Perfil';

// AuthRoute component
const AuthRoute = ({ children }) => {
    const { user } = useIdentity();
    return user ? children : <Navigate to="/signin" replace={true} />;
};

// NonAuthRoute component
const NonAuthRoute = ({ children }) => {
    const { user } = useIdentity();
    return user ? <Navigate to="/" replace={true} /> : children;
};

// RouteProvider component
function RouteProvider() {
    const routes = useRoutes([
        {
            path: '/',
            element: (
                <AuthRoute>
                    <Header />
                    <PageWrapper >
                    </PageWrapper>
                </AuthRoute>
            ),
        },
        {
            path: '/perfil',
            element: (
                <AuthRoute>
                    <Header />
                    <PageWrapper >
                        <Perfil />
                    </PageWrapper>
                </AuthRoute>
            ),
        },
        {
            path: '/signin',
            element: (
                <NonAuthRoute>
                    <PageWrapper>
                        <SignIn />
                    </PageWrapper>
                </NonAuthRoute>
            ),
        },
        {
            path: '/signup',
            element: (
                <NonAuthRoute>
                    <PageWrapper>
                        <SignUp />
                    </PageWrapper>
                </NonAuthRoute>
            ),
        },
    ]);

    return routes;
}

export default RouteProvider;
