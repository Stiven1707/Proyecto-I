import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../Views/Dashboard";
import SideBar from "../Layout/SideBar";
import PropuestaTesis from "../Views/PropuestaTesis";
import Anteproyecto from "../Views/Anteproyecto";
import Seguimiento from "./../Views/Seguimiento";
import Usuarios from "./../Views/Usuarios";
import TrabajoDeGrado from "../Views/TrabajoDeGrado";
import jwt_decode from "jwt-decode";
//import PrivateRoute from "./PrivateRoute";

// Function to get the user role from the token
const comprobarAcceso = (accesoUsuario) => {
    const datosUsuarioCifrados = JSON.parse(
        localStorage.getItem("authTokens")
    ).access;
    const datosUsuario = jwt_decode(datosUsuarioCifrados);

    return accesoUsuario.includes(datosUsuario.rol); // Adjust this based on your data structure
};



const Layout = () => {
    return (
        <div className="flex h-screen">
            <div className="sticky top-0">
                <SideBar />
            </div>
            <div className="flex-1 p-7 overflow-y-auto overflow-x-auto">
                <Routes>
					<Route path="/" element={<Dashboard />} />

					<Route path="/usuarios" element={comprobarAcceso([])? <Usuarios /> : <Navigate to="/app" /> }/>
					<Route path="/propuestas" element={comprobarAcceso([])? <PropuestaTesis /> : <Navigate to="/app" /> }/>
					<Route path="/anteproyectos" element={comprobarAcceso(['profesor','admin'])? <Anteproyecto /> : <Navigate to="/app" /> }/>
					<Route path="/seguimiento" element={comprobarAcceso([])? <Seguimiento /> : <Navigate to="/app" /> }/>
					<Route path="/trabajodegrado" element={comprobarAcceso([])? <TrabajoDeGrado /> : <Navigate to="/app" /> }/>
                </Routes>
            </div>
        </div>
    );
};

export default Layout;
