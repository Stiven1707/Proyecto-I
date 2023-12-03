import React, {useEffect, useState} from 'react'
import axios from 'axios'
import jwt_decode from "jwt-decode";

const PropuestaTesisE = () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)
    const [propuestaList, setPropuestaList] = useState([]);
    const getPropuestas = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get('http://127.0.0.1:8000/api/propuestas/',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (datosUsuario.rol === 'profesor'){
            const entradaConIdEspecifico = data.filter(entry => {
                if(entry.user.id === datosUsuario.user_id){
                    return entry;
                }
                return null
            });
            setPropuestaList(entradaConIdEspecifico)

        }else{
            setPropuestaList(data)
        }
	}

    useEffect(()=>{
		getPropuestas();
        }, [])

    return (
        <div >
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="py-4 bg-gray-700 dark:bg-gray-900">
                    <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className='flex justify-between pl-5 pr-10'>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                                </div>
                                <div className='flex items-center'>
                                    <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  placeholder="Search"/>
                                    <button className='bg-cyan-600 text-gray-300 p-1 px-3 rounded-e' >Buscar</button>
                                </div>
                            </div>
                        </div>
                </div>
                <table className="sticky w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope='col' className='border px-6 py-3'>Titulo</th>
                            <th scope='col' className='border px-6 py-3'>Objetivos</th>
                            <th scope='col' className='border px-6 py-3'>Director</th>
                            <th scope='col' className='border px-6 py-3'>Estudiantes</th>
                            <th scope='col' className='border px-6 py-3'>Documento</th>
                            <th scope='col' className='border px-6 py-3'>Estado</th>
                            <th scope='col' className='border px-6 py-3'>Fecha maxima de respuesta</th>
                        </tr>
                    </thead>
                    <tbody>
                    {propuestaList.map((propuesta)=>(
                        <tr key={propuesta.id}>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{propuesta.pro_titulo}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{propuesta.pro_objetivos}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{propuesta.user.email}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{propuesta.estudiantes.map((estudiante)=>{
                                    return <p key={estudiante.id}>{estudiante.email}</p>;
                            })}</td>
                            
                            <td className='border px-6 py-4'>
                                <p key={propuesta.doc.id}><a href={`http://127.0.0.1:8000${propuesta.doc.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-purple-800">
                                {`${propuesta.doc.doc_nombre.substr(0,12)}.pdf`}
                            </a></p>
                            </td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{propuesta.pro_estado}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{propuesta.pro_fecha_max}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
	)
}

export default PropuestaTesisE
