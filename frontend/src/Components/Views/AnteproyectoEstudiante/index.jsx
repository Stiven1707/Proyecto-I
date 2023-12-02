import React, {useEffect, useState} from 'react'
import axios from 'axios'
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft  } from '@fortawesome/free-solid-svg-icons';
import { apiRoute } from "../../config";


const AnteproyectoEstudiante = () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)
    
    const [anteproyectoList, setAnteproyectoList] = useState([]);
    const [showModalHistorial, setShowModalHistorial] = useState(false);
    const [histotialList, setHistotialList] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);

    const getAnteproyectos = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get(`${apiRoute}anteproyectos/`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (datosUsuario.rol === 'estudiante'){
            const entradaConIdEspecifico = data.filter(entry => {
                // Verificar si el id buscado está presente en el array de usuarios
                return entry.usuarios.some(usuario => usuario.user.id === datosUsuario.user_id);
            });
            setAnteproyectoList(entradaConIdEspecifico)

        }else{
            setAnteproyectoList(data)
        }
	}

    const getParticipantes = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get(`${apiRoute}user/`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const profesoresData = data.filter((user) => user.rol && user.rol.rol_nombre === 'profesor');
        const estudiantesData = data.filter((user) => user.rol && user.rol.rol_nombre === 'estudiante');

		setProfesores(profesoresData);
        setEstudiantes(estudiantesData);
	}


    useEffect(()=>{
		getAnteproyectos();
        getParticipantes()}, [])

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
                                    <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={0} placeholder="Search"/>
                                    <button className='bg-cyan-600 text-gray-300 p-1 px-3 rounded-e' >Buscar</button>
                                </div>
                            </div>
                        </div>
                </div>
                <table className="sticky w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope='col' className='border px-6 py-3'>Titulo</th>
                            <th scope='col' className='border px-6 py-3'>Descripcion</th>
                            <th scope='col' className='border px-6 py-3'>Coordiandor</th>
                            <th scope='col' className='border px-6 py-3'>Estudiantes</th>
                            <th scope='col' className='border px-6 py-3'>Documentos</th>
                            <th scope='col' className='border px-6 py-3'>Observaciones</th>
                            <th scope='col' className='border px-6 py-3'>Seguimiento</th>
                            <th scope='col' className='border px-6 py-3'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                    {anteproyectoList.map((anteproyecto)=>(
                        <tr key={anteproyecto.anteproyecto.id}>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{anteproyecto.anteproyecto.antp_titulo}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{anteproyecto.anteproyecto.antp_descripcion}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{
                            
                            anteproyecto.usuarios.map((user)=>{
                                if (profesores.find((profesor) => profesor.id === user.user.id)) {
                                    return <p key={user.user.id}>{user.user.email}</p>;
                                }
                                return null;
                                
                            })}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{anteproyecto.usuarios.map((user)=>{
                                if (estudiantes.find((estudiante) => estudiante.id === user.user.id)) {
                                    return <p key={user.user.id}>{user.user.email}</p>;
                                }
                                return null;
                            })}</td>
                            
                            <td className='border px-6 py-4'>{anteproyecto.documentos.map((doc)=>{
                                return <p key={doc.id}><a href={`http://127.0.0.1:8000${doc.doc.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-purple-800">
                                {`${doc.doc.doc_nombre.substr(0,12)}.pdf`}
                            </a></p>
                            })}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>
                                {anteproyecto.seguimientos.length > 0 ? anteproyecto.seguimientos[anteproyecto.seguimientos.length-1].seg.seg_observaciones: null}
                            </td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>
                                {anteproyecto.seguimientos.length > 0 ? anteproyecto.seguimientos[anteproyecto.seguimientos.length-1].seg.seg_estado: null}
                            </td>
                            <td className='border px-6 py-4'>
                            {anteproyecto.seguimientos.length > 0 ? 
                                <div className='pt-1 flex items-center'>
                                    <button className='bg-blue-600 text-gray-300 p-2 px-3 rounded' onClick={()=> {
                                    setHistotialList({anteproyecto: anteproyecto.anteproyecto,
                                                        historial: anteproyecto.anteproyecto.docs_historial})
                                                        setShowModalHistorial(true)
                                    }}>
                                    <FontAwesomeIcon icon={faClockRotateLeft} />
                                    </button>
                                </div>
                            : null}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        
{showModalHistorial ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-500">
              <div className="relative bg-white rounded-lg shadow">
                <button
                  type="button"
                  className="absolute top-3 right-2.5 text-gray-700 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                  onClick={() => setShowModalHistorial(false)}
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only text-black">Close modal</span>
                </button>
                <div className="px-6 py-6 lg:px-10">

                  <table className='table-auto w-full'>
                    <caption className='border px-6 py-3 dark:bg-cyan-900 dark:text-gray-100'>{`Historial de  ${histotialList.anteproyecto.antp_titulo}`}</caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-cyan-100 dark:text-gray-800">
                      <tr>
                        <th scope="col" className="border px-6 py-3 w-1/6">#</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Fecha Creacion</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Documentos</th>
                      </tr>
                    </thead>
                    <tbody>
                  {histotialList.historial.map((hist, index)=> (
                      <tr key={index+1}>
                        <td className="border px-6 py-4">{index+1}</td>
                        <td className="border px-4 py-4">{hist.doc_fecha_creacion}</td>
                        <td className="border px-6 py-4">
                             <p key={hist.id}>
                                <a href={`http://127.0.0.1:8000${hist.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-purple-800">{`${hist.doc_nombre.substr(0,12)}.pdf`}
                                </a>
                            </p>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        </>
      ) : null}
        </div>
	)
}

export default AnteproyectoEstudiante
