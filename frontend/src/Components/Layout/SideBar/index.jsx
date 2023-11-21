import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Control from '../../../Assets/img/Control.png';
import Logo from '../../../Assets/img/FIET_icono_recortado.png';
import Chart_fill from '../../../Assets/img/Chart_fill.png';
import Chat from "../../../Assets/img/Chat.png";
import Folder from '../../../Assets/img/Folder.png';
import Calendar from '../../../Assets/img/Calendar.png';
import Chart from '../../../Assets/img/Chart.png'; 
import Logout from '../../../Assets/img/Logout.png';
import setting from '../../../Assets/img/Setting.png';
import jwt_decode from "jwt-decode";


const Layout = () => {
	const [open, setOpen] = useState(true);
	const navigate = useNavigate();

	const handleLogout = () => {

		localStorage.removeItem('auth');
		localStorage.removeItem('authTokens');
		window.location.href = '/login';
	};
	const datosUsuario = (JSON.parse(localStorage.getItem('authTokens'))).access
    const token = jwt_decode(datosUsuario).rol;


	const Menus = [
		{ title: 'Dashboard', src: `${Chart_fill}`, path: '', token: 0, state: false },
		{ title: 'Usuarios', src: `${Chart}`, path: '/app/usuarios', token: ['auxiliar', 'coordinador'], state: false },
		//{ title: 'Propuestas', src: `${Folder}`, path: '/app/propuestas', token: ['profesor','admin'], state: false },
		{ title: 'Anteproyecto', src: `${Chat}`, path: '/app/anteproyectos', token: ['profesor','auxiliar','coordinador'], state: false },
		{ title: 'Anteproyecto', src: `${Chat}`, path: '/app/anteproyectosE', token: ['estudiante'], state: false },
		{ title: 'Seguimiento', src: `${Calendar}`, path: '/app/seguimiento', token: ['auxiliar', 'coordinador'], state: false },
		{ title: 'Trabajo de Grado', src: `${setting}`, path: '/app/trabajodegrado', token: ['profesor','auxiliar', 'coordinador'], state: false },
		{ title: 'Evaluar Anteproyectos', src: `${Chat}`, path: '/app/anteproyectosJ', token: ['profesor','auxiliar', 'coordinador'], state: false },
		{ title: 'Log out', src: `${Logout}`, gap: true, path: handleLogout, token: 0, state: false },
	];

	Menus.map((Menu, index) => {
		if (Menu.token === 0 || Menu.token.includes(token)) {
			Menu.state = true;
		}
		return Menu;
	});

	return (
		<div
			className={` ${
			open ? 'w-72' : 'w-20 '
			} bg-gray-950 text-gray-300 h-screen p-5 pt-8 relative duration-300`}
		>
			<img
			src={Control}
			alt=""
			className={`absolute cursor-pointer -right-3 top-9 w-7 border-gray-950 border-2 rounded-full  ${
				!open && 'rotate-180'
			}`}
			onClick={() => setOpen(!open)}
			/>
			<div className="flex gap-x-4 items-center">
			<img
				src={Logo}
				alt=""
				className={`h-12 w-12 cursor-pointer duration-500 ${
				open && 'rotate-[360deg]'
				}`}
			/>
			<h1
				className={`text-gray-300 origin-left font-medium text-xl duration-200 ${
				!open && 'scale-0'
				}`}
			>
				SRSPG APP
			</h1>
			</div>
			<ul className="pt-6">
			{Menus.map((Menu, index) => (
				Menu.state? (<li key={index} className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
			${Menu.gap ? 'mt-9' : 'mt-2'} ${
					index === 0 && 'bg-light-white'
				} `}
				onClick={() => {
					if (typeof Menu.path === 'function') {
						Menu.path();
					} else {
						navigate(Menu.path);
					}
				}}
				>
				<img src={Menu.src} alt="" />
				<span
					className={`${!open && 'hidden'} origin-left duration-200`}
				>
					{Menu.title}
				</span>
				</li>): null
			))}
			</ul>

		</div>
	);
};

export default Layout;