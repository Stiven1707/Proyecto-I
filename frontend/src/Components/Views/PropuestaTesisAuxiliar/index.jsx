import React, {useEffect, useState} from 'react'
import axios from 'axios'
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const PropuestaTesisAuxiliar = () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)

    let IdDocumentos = [];

    const initialState = {
        user: datosUsuario.user_id,
        estudiante1: '',
        estudiante2: '',
        pro_titulo: "",
        pro_objetivos: "",
        pro_modalidad:""
	}


    const [propuestaList, setPropuestaList] = useState([]);
	const [body, setBody] = useState(initialState);
	const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
	const [isId, setIsId] = useState('');
    const [isValid, setIsValid] = useState(true);
	const [showMensaje, setShowMensaje] = useState('');
    const [filtro, setFiltro] = useState('PENDIENTE')

    let fileData = [];

    const getPropuestas = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get('http://127.0.0.1:8000/api/propuestas/',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log(data);
        if (datosUsuario.rol === 'auxiliar'){
            const entradaConIdEspecifico = data.filter(entry => {
                console.log(filtro);
                if(entry.pro_estado === filtro){
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
    }, [filtro])

    const onChange = ({ target }) => {
        const { name, value } = target
        setBody({
            ...body,
            [name]: value
        });
    };


    function saveFiles(event) {
        // Obtener la lista de archivos seleccionados desde el evento
        const selectedFiles = event.target.files;
        // Inicializar un arreglo para almacenar los nombres y rutas de los archivos
        fileData = [];
        // Recorrer la lista de archivos y agregar los datos al arreglo
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const fileName = file.name; // Nombre del archivo
            fileData.push({ doc_nombre: fileName, doc_ruta: file, anteproyectos: [], trabajos_de_grado: [] });
        }
    }

    const uploadFiles = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('authTokens')).access;
            if (!(Array.isArray(fileData) && fileData.length === 0)) {

                IdDocumentos = [];

                const promises = fileData.map((file) => {
                    return axios.post('http://127.0.0.1:8000/api/documentos/', file, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                });
        
                await Promise.all(promises).then((results) => {
                    results.forEach((data) => {
                        IdDocumentos.push(parseInt(data.data.id));
                    });
                });
        }

            body.doc = IdDocumentos[0];
            onEdit()
            
        } catch (error) {
            console.error('Fallo al subir el archivo: ', error);
        }
    };

    const onEdit = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
        setShowModal(false);
        axios.patch(`http://127.0.0.1:8000/api/propuestas/${body.id}/`, body, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            if(body.pro_estado === 'APROBADO'){
                onSubmit();
            }else{
                setBody(initialState);
                getPropuestas();
            }
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

    const onSubmit = async () => {
        const token = JSON.parse(localStorage.getItem('authTokens')).access;
        setShowModal(false);
        console.log('onms: ', body);
        let datosAnteproyecto = {
            antp_titulo: body.pro_titulo,
            antp_descripcion: body.pro_objetivos,
            Documentos : [],
            propuesta: body.id
        }
        console.log('datos onsubmit: ', datosAnteproyecto);
        axios
            .post('http://127.0.0.1:8000/api/anteproyectos/', datosAnteproyecto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                setBody(initialState);
                getPropuestas();
            })
            .catch(({ response }) => {
                console.log(response);
            });
    };

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
                                    <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={isId} onChange={(e)=>{
                                        setIsId(e.target.value)
                                    }} laceholder="Search"/>
                                    <button className='bg-cyan-600 text-gray-300 p-1 px-3 rounded-e' onClick={()=>{
                                        body.per_id = 0
                                    }}>Buscar</button>
                                </div>
                            </div>
                            <div className='flex items-center'>
                                <label htmlFor="Filtros" className="block mr-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">FILTRO</label>
                                <select
                                    name="filtro"
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                    value={filtro}
                                    onChange={(e)=>{
                                        const { value } = e.target
                                        setFiltro(value)
                                        getPropuestas()
                                    }}
                                    required 
                                    >
                                    <option value='PENDIENTE'>Pendiente</option>
                                    <option value='APROBADO'>Aprobado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                <table className="sticky w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope='col' className='border px-6 py-3'>Titulo</th>
                            <th scope='col' className='border px-6 py-3'>Objetivos</th>
                            <th scope='col' className='border px-6 py-3'>Coordiandor</th>
                            <th scope='col' className='border px-6 py-3'>Estudiantes</th>
                            <th scope='col' className='border px-6 py-3'>Documento</th>
                            <th scope='col' className='border px-6 py-3'>Estado</th>
                            <th scope='col' className='border px-6 py-3'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {console.log(propuestaList)}
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


                            <td className='border px-6 py-4'>
                                {propuesta.pro_estado === 'APROBADO'? null : 
                                    <div className='flex'>
                                    <button className='bg-yellow-400 text-black p-2 px-3 rounded' onClick={() => {
                                            setBody({
                                                id: propuesta.id,
                                                pro_estado: propuesta.pro_estado,
                                                pro_titulo: propuesta.pro_titulo,
                                                pro_objetivos: propuesta.pro_objetivos
                                            })
                                            setTitle('Modificar')
                                            setIsValid(true)
                                            setShowModal(true);}}
                                        >
                                            <FontAwesomeIcon icon={faEdit} /> 
                                        </button>    
                                        
                                    </div>
                            }
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {showModal ? (
                <>
                <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-500">
                    <div className="relative w-full max-w-md max-h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" onClick={() => setShowModal(false)} >
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                <span className="sr-only text-black">Close modal</span>
                            </button>
                            <div className="px-6 py-6 lg:px-8">
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">{title} propuesta</h3>
                                <form className="space-y-6" action="#">
                                <div>
                                        <label htmlFor="estados" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Estado</label>
                                        <select
                                                name="pro_estado"
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                value={body.pro_estado}
                                                onChange={(e)=>{
                                                    onChange(e)
                                                }}
                                                required 
                                                >
                                                <option value='PENDIENTE' disable>PENDIENTE</option>
                                                <option value='RECHAZADO'>RECHAZADO</option>
                                                <option value='APROBADO'>APROBADO</option>
                                            </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Subir Documento</label>
                                        <input
                                            type="file"
                                            name="eva_evidencia"
                                            id="eva_evidencia"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder={body.eva_evidencia}
                                            onChange={saveFiles} 
                                            required
                                            />
                                    </div>
                                    {isValid ? null : <p className="text-red-700">{showMensaje}</p>}
                                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={(e) => {
                                        uploadFiles();
                                        e.preventDefault(); // Previene el comportamiento predetermina
                                    }
                                    }>{title}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            ) : null}
        </div>
	)
}

export default PropuestaTesisAuxiliar
