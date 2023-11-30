import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../Views/Dashboard";
import SideBar from "../Layout/SideBar";
import PropuestaTesis from "../Views/PropuestaTesis";
import PropuestaTesisTemporal from "../Views/PropuestaTesisTemporal";
import PropuestaTesisEstudiante from "../Views/PropuestaTesisEstudiante";
import PropuestaTesisAuxiliar from "../Views/PropuestaTesisAuxiliar";
import Anteproyecto from "../Views/Anteproyecto";
import AnteproyectoTemporal from "../Views/AnteproyectoTemporal";
import AnteproyectoEstudiante from "../Views/AnteproyectoEstudiante";
import EvaluacionAnteproyecto from "../Views/AnteproyectoJurado";
import ValidarAnteproyecto from "../Views/AnteproyectoConsejo";
import Seguimiento from "./../Views/Seguimiento";
import Usuarios from "./../Views/Usuarios";
import TrabajoDeGrado from "../Views/TrabajoDeGrado";
import jwt_decode from "jwt-decode";

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
					<Route path="/usuarios" element={comprobarAcceso(['profesor','auxiliar', 'coordinador'])? <Usuarios /> : <Navigate to="/app" /> }/>
					<Route path="/propuestas" element={comprobarAcceso(['profesor'])? <PropuestaTesis /> : <Navigate to="/app" /> }/>
					<Route path="/propuestasT" element={comprobarAcceso(['temporal'])? <PropuestaTesisTemporal /> : <Navigate to="/app" /> }/>
					<Route path="/propuestasE" element={comprobarAcceso(['profesor'])? <PropuestaTesisEstudiante /> : <Navigate to="/app" /> }/>
					<Route path="/propuestasA" element={comprobarAcceso(['profesor'])? <PropuestaTesisAuxiliar /> : <Navigate to="/app" /> }/>
					<Route path="/anteproyectos" element={comprobarAcceso(['profesor','auxiliar', 'coordinador'])? <Anteproyecto /> : <Navigate to="/app" /> }/>
					<Route path="/anteproyectosT" element={comprobarAcceso(['temporal','auxiliar', 'coordinador'])? <AnteproyectoTemporal /> : <Navigate to="/app" /> }/>
					<Route path="/seguimiento" element={comprobarAcceso(['profesor','auxiliar', 'coordinador'])? <Seguimiento /> : <Navigate to="/app" /> }/>
					<Route path="/trabajodegrado" element={comprobarAcceso(['profesor','auxiliar', 'coordinador'])? <TrabajoDeGrado /> : <Navigate to="/app" /> }/>
                    <Route path="/anteproyectosJ" element={comprobarAcceso(['profesor','auxiliar', 'coordinador'])? <EvaluacionAnteproyecto /> : <Navigate to="/app" /> }/>
                    <Route path="/anteproyectosE" element={comprobarAcceso(['estudiante'])? <AnteproyectoEstudiante/> : <Navigate to="/app" /> }/>
                    <Route path="/anteproyectosC" element={comprobarAcceso(['profesor', 'consejo'])? <ValidarAnteproyecto/> : <Navigate to="/app" /> }/>
                </Routes>
            </div>
        </div>
    );
};

export default Layout;
