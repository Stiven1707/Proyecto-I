import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Control from '../../../Assets/img/Control.png';
import Logo from '../../../Assets/img/Logo.png';
import Chart_fill from '../../../Assets/img/Chart_fill.png';
import Folder from '../../../Assets/img/Folder.png';
import Logout from '../../../Assets/img/Logout.png';
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
		{ title: 'Dashboard', src: `${Chart_fill}`, path: '', token: 1, state: false },
		{ title: 'Usuarios', src: `${Folder}`, path: '/app/usuarios', token: 1, state: false },
		{ title: 'Propuestas', src: `${Folder}`, path: '/app/propuestas', token: 1, state: false },
		{ title: 'Anteproyecto', src: `${Folder}`, path: '/app/anteproyectos', token: 1, state: false },
		{ title: 'Seguimiento', src: `${Folder}`, path: '/app/seguimiento', token: 1, state: false },
		{ title: 'Trabajo de Grado', src: `${Folder}`, path: '/app/trabajodegrado', token: 1, state: false },
		{ title: 'Log out', src: `${Logout}`, gap: true, path: handleLogout, token: 0, state: false },
	];

	Menus.map((Menu, index) => {
		if (token === Menu.token || Menu.token === 0) {
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
				className={`cursor-pointer duration-500 ${
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