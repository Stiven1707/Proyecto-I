import React from "react";
import { Route, Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

// Function to get the user role from the token
const getUserRole = () => {
    const datosUsuarioCifrados = JSON.parse(
        localStorage.getItem("authTokens")
    ).access;
    const datosUsuario = jwt_decode(datosUsuarioCifrados);
    return datosUsuario.rol; // Adjust this based on your data structure
};

// Component for protected routes
const PrivateRoute = ({ element, roles, ...rest }) => {
    const userRole = getUserRole();

    // Check if the user has the required role
    if (!userRole || !roles.includes(userRole.toString())) {
        // Redirect to the home page or an error page if the role is not valid
        return <Navigate to="/" />;
    }

    // Render the specified element if the role is valid
    console.log('datos: ', element);
    return <Route {...rest} element={element} />;
};

export default PrivateRoute;
