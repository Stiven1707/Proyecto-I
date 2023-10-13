import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Control from '../../Assets/img/Control.png';
import Logo from '../../Assets/img/Logo.png';
import Chart_fill from '../../Assets/img/Chart_fill.png';
import Chat from '../../Assets/img/Chat.png';
import User from '../../Assets/img/User.png';
import Calendar from '../../Assets/img/Calendar.png';
import Search from '../../Assets/img/Search.png';
import Chart from '../../Assets/img/Chart.png';
import Folder from '../../Assets/img/Folder.png';
import Logout from '../../Assets/img/Logout.png';
import Dashboard from '../Views/Dashboard';
import SideBar from '../Layout/SideBar'
import PropuestaTesis from '../Views/PropuestaTesis';
import Anteproyecto from '../Views/Anteproyecto';


const Layout = () => {
	return (
		<div className="flex h-100%">
			<SideBar />
		<div className="h-screen flex-1 p-7">
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/propuestas" element={<PropuestaTesis />} />
				<Route path="/anteproyectos" element={<Anteproyecto />} />
			</Routes>
		</div>
		</div>
	);
};

export default Layout;