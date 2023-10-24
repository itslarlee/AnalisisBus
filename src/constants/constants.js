export const UserRoles = {
    ADMIN: 'Admin',
    CLIENTE: 'Cliente',
    CHOFER: 'Chofer',
};


export const Collections = {
    Users: {
        id: String,
        name: String,
        lastName: String,
        role: UserRoles,
        email: String,
        password: String,
    },
};