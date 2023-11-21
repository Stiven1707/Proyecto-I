import React, {useEffect, useState} from 'react'
import axios from 'axios'
import jwt_decode from "jwt-decode";

const AnteproyectoEstudiante = () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)


    const [anteproyectoList, setAnteproyectoList] = useState([]);
    const getAnteproyectos = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get('http://127.0.0.1:8000/api/anteproyectos/',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (datosUsuario.rol === 'estudiante'){
            const entradaConIdEspecifico = data.filter(entry => {
                // Verificar si el id buscado está presente en el array de usuarios
                
                return entry.usuarios.some(usuario => usuario.user.id === datosUsuario.user_id);
            });
            console.log(entradaConIdEspecifico);
            console.log(datosUsuario);
            setAnteproyectoList(entradaConIdEspecifico)

        }else{
            setAnteproyectoList(data)
        }
	}

    useEffect(()=>{
		getAnteproyectos();
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
                                    <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={''}  placeholder="Search"/>
                                    
                                </div>
                            </div>
                        </div>
                </div>
                <table className="sticky w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope='col' className='border px-6 py-3'>Titulo</th>
                            <th scope='col' className='border px-6 py-3'>Descripcion</th>
                            <th scope='col' className='border px-6 py-3'>Documentos</th>
                            <th scope='col' className='border px-6 py-3'>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                    {anteproyectoList.map((anteproyecto)=>(
                        <tr key={anteproyecto.anteproyecto.id}>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{anteproyecto.anteproyecto.antp_titulo}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{anteproyecto.anteproyecto.antp_descripcion}</td>
                            
                            <td className='border px-6 py-4'>{anteproyecto.documentos.map((doc)=>{
                                return <p key={doc.id}><a href={`http://127.0.0.1:8000${doc.doc.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-purple-800">
                                {`${doc.doc.doc_nombre.substr(0,12)}.pdf`}
                            </a></p>
                            })}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>
                            {anteproyecto.seguimientos[anteproyecto.seguimientos.length-1].seg.seg_observaciones === 'Aprovado'? 'Aprovado' : 
                                anteproyecto.seguimientos[anteproyecto.seguimientos.length-1].seg.seg_estado === 'Activo'? 'A revisión' : anteproyecto.seguimientos[anteproyecto.seguimientos.length-1].seg.seg_observaciones
                            }</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
	)
}

export default AnteproyectoEstudiante
