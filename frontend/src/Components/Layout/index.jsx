import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../Views/Dashboard';
import SideBar from '../Layout/SideBar'
import PropuestaTesis from '../Views/PropuestaTesis';
import Anteproyecto from '../Views/Anteproyecto';
import Seguimiento from './../Views/Seguimiento';
import Usuarios from './../Views/Usuarios';
import TrabajoDeGrado from '../Views/TrabajoDeGrado';


const Layout = () => {
	return (
		<div className="flex h-screen">
			<div className="sticky top-0">
				<SideBar />
			</div>
			<div className="flex-1 p-7 overflow-y-auto overflow-x-auto">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/usuarios" element={<Usuarios />} />
					<Route path="/propuestas" element={<PropuestaTesis />} />
					<Route path="/anteproyectos" element={<Anteproyecto />} />
					<Route path="/seguimiento" element={<Seguimiento />} />
					<Route path="/trabajodegrado" element={<TrabajoDeGrado />} />
				</Routes>
			</div>
		</div>
	);
};

export default Layout;