import React, { useState } from "react";
import './Login.css';
import Space01 from '../../../Assets/img/Space04.jpg';
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import jwt_decode from "jwt-decode";



const Login = () => {
    const [body, setBody] = useState({ email: '', password: '' })
    //const navigate = useNavigate()
    //const classes = useStyles()

    const handleChange = e => {
        setBody({
            ...body,
            [e.target.name]: e.target.value
        })
    }

    const onSubmit = (e) => {
        //localStorage.clear();
        e.preventDefault()
        axios.post('http://127.0.0.1:8000/api/token/', body)
        .then(({data}) => {
            localStorage.setItem('auth', true)
            console.log(jwt_decode(data.access));
            const datos = jwt_decode(data.access)
            console.log(datos.full_name);
            localStorage.setItem('userData',   JSON.stringify(jwt_decode(data.access)));
            window.location.href = '/app';
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

    return (
        <main className="main">
            <section className="hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen border-gray-900	border-s-4" dir="rtl">
                <img className="w-full h-full object-cover" src={Space01} alt="" />
            </section>
            <section className="bg-gray-950 text-white text-opacity-70 w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
            <div className="w-full h-100">
                <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12 text-center">Inicio de sesion</h1>
                <form className="mt-6">
                    <div className="mt-6">
                        <label className="block">Usuario</label>
                        <input type="text" placeholder="Digite usuario" className="w-full px-4 py-3 rounded-lg bg-gray-800 mt-2 border focus:border-blue-500 focus:bg-gray-900 focus:outline-none" 
                        label='email'
                        value={body.email}
                        onChange={handleChange}
                        name='email'
                        required/>
                    </div>
                    <div className="mt-4">
                        <label className="block">Contrasena</label>
                        <input type="password" placeholder="Digite constrasenia" className="w-full px-4 py-3 rounded-lg bg-gray-800 mt-2 border focus:border-blue-500 focus:bg-gray-900 focus:outline-none" 
                        label='password'
                        value={body.password}
                        onChange={handleChange}
                        name='password'
                        required/>
                    </div>
                    <button type="submit" className="w-full block bg-blue-900 hover:bg-blue-800 focus:bg-blue-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
                    onClick={onSubmit}>
                        Iniciar Sesion
                    </button>
                </form>
            </div>
            </section>
        </main>
    );
};

export default Login;