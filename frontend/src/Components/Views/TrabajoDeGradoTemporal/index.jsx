import React, {useEffect, useState} from 'react'
import axios from 'axios'
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit  } from '@fortawesome/free-solid-svg-icons';
import { apiRoute } from "../../config";


const TrabajoDeGradoTemporal= () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)
    
    let IdDocumentos = [];
    const initialState = {
        user: datosUsuario.user_id,
        antp: '',
        doc: [],
	}

    const [trabajoDeGradoList, setTrabajoDeGradoList] = useState([]);
	const [body, setBody] = useState(initialState);
    const [showModal, setShowModal] = useState(false);
	const [isId, setIsId] = useState('');
	const [isEdit, setIsEdit] = useState(false);
    const [profesores, setProfesores] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [isValid, setIsValid] = useState(true);
    const [isDateValid, setIsDateValid] = useState(true);
	const [showMensaje, setShowMensaje] = useState('');

    let fileData = [];

    const getTrabajoDeGrado = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get(`${apiRoute}trabajosdegrado/`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (datosUsuario.rol === 'consejo'){
            setTrabajoDeGradoList(data)
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
        getTrabajoDeGrado();
        getParticipantes();
        comprobarFecha()}, [isDateValid, body])

    const onChange = ({ target }) => {
        const { name, value } = target
        setBody({
            ...body,
            [name]: value
        });
    };


    function saveFiles(event) {
        const selectedFiles = event.target.files;
        fileData = [];
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

                IdDocumentos = 0;

                const promises = fileData.map((file) => {
                    return axios.post(`${apiRoute}documentos/`, file, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                });
        
                await Promise.all(promises).then((results) => {
                    results.forEach((data) => {
                        IdDocumentos=data.data.id;
                    });
                });
        }
        
            onEdit()
            
        } catch (error) {
            console.error('Fallo al subir el archivo: ', error);
        }
    };

    const checking = () => {
        console.log(body);
        if (isDateValid && (body.trag_estado === 'SOLICITUD FECHA' || body.trag_estado === 'PRÓRROGA SOLICITADA' || body.trag_estado === 'SOLICITAR CANCELACION')) {
            setShowMensaje('Por favor seleccione una opcion');
            setIsValid(false);
            return false;
        }
        if (body.trag_estado === 'JURADOS ASIGNADOS') {
            if (body.juradoC === '' ) {
                setShowMensaje('Por favor seleccione al jurado Coordinador');
                setIsValid(false);
                return false;
            }
            if (body.juradoA === '') {
                setShowMensaje('Por favor seleccione al segundo jurado');
                setIsValid(false);
                return false;
            }
        }else if((body.trag_estado === 'PRÓRROGA APROBADA' || body.trag_estado === 'PRÓRROGA NO APROBADA') && fileData.length < 1){
            setShowMensaje('Por favor, seleccione el documento respuesta solucitud prorroga');
            setIsValid(false);
            return false;
        }else if((body.trag_estado === 'CANCELACION APROBADA' || body.trag_estado === 'CANCELACION NO APROBADA') && fileData.length < 1){
            setShowMensaje('Por favor, seleccione el documento respuesta solucitud cancelacion');
            setIsValid(false);
            return false;
        }

        if(body.trag_estado === 'PRÓRROGA APROBADA'){
            let fechaInicial= new Date(body.trag_fecha_fin);
            let fechaFinal = new Date();
            fechaFinal.setMonth(fechaInicial.getMonth() + 3)
            body.trag_fecha_fin = fechaFinal.toISOString().split("T")[0]
        }
        if(body.trag_estado === 'PRÓRROGA APROBADA'){
            let fechaMinima = new Date();
            let fechaMaxima = new Date();
            fechaMinima.setDate(fechaMinima.getDate() + 7)
            fechaMaxima.setDate(fechaMinima.getDate() + 21)

            body.trag_fecha_sustentacion_min = fechaMinima;
            body.trag_fecha_sustentacion_max = fechaMaxima;
        }

        setIsValid(true);
        uploadFiles();
    };

        
    const onEdit = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
        setShowModal(false);
        let user_ids = []
        body.users.map((user)=>{
            user_ids.push(parseInt(user.user.id))
            return 1
        })
        body.user_ids = user_ids

        let idDocs = []
        body.docs.map((doc)=> {
            idDocs.push(doc.doc.id)
            return 1
        })
        idDocs.push(parseInt(IdDocumentos))
        body.doc_ids = idDocs;

        axios.patch(`${apiRoute}trabajosdegrado/${body.trag_id}/`, body, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setBody(initialState)
            getTrabajoDeGrado()
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

    const comprobarFecha = async () => {
        const fechaFin = new Date(body.trag_fecha_fin);
        fechaFin.setHours(0, 0, 0, 0);

        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); 

        console.log(fechaFin);
        console.log(fechaFin < fechaActual);
        if (fechaActual <= fechaFin){
            setIsDateValid(true)
        }else{
            setIsDateValid(false)
        }
    }

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
                        </div>
                </div>
                <table className="sticky w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope='col' className='border px-6 py-3'>Titulo</th>
                            <th scope='col' className='border px-6 py-3'>Profesores</th>
                            <th scope='col' className='border px-6 py-3'>Estudiantes</th>
                            <th scope='col' className='border px-6 py-3'>Documentos</th>
                            <th scope='col' className='border px-6 py-3'>Fecha inicio</th>
                            <th scope='col' className='border px-6 py-3'>Fecha fin</th>
                            <th scope='col' className='border px-6 py-3'>Fecha sustentacion</th>
                            <th scope='col' className='border px-6 py-3'>Estado</th>
                            <th scope='col' className='border px-6 py-3'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                    {trabajoDeGradoList.map((trabajoDeGrado)=>(
                        <tr key={trabajoDeGrado.trag.id}>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{trabajoDeGrado.trag.antp.antp_titulo}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{
                            
                            trabajoDeGrado.users.map((user)=>{
                                if (profesores.find((profesor) => profesor.id === user.user.id)) {
                                    return <p key={user.user.id}>{user.user.email}</p>;
                                }
                                return null;
                                
                            })}</td>
                            <td className='border px-6 py-4 font-medium text-sm dark:text-slate-900'>{trabajoDeGrado.users.map((user)=>{
                                if (estudiantes.find((estudiante) => estudiante.id === user.user.id)) {
                                    return <p key={user.user.id}>{user.user.email}</p>;
                                }
                                return null;
                            })}</td>
                            
                            <td className='border px-6 py-4'>{trabajoDeGrado.docs.map((doc)=>{
                                return <p key={doc.id}><a href={`http://127.0.0.1:8000${doc.doc.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-purple-800">
                                {`${doc.doc.doc_nombre.substr(0,12)}.pdf`}
                            </a></p>
                            })}</td>
                            <td className='border px-6 py-4'>{trabajoDeGrado.trag.trag_fecha_inicio}</td>
                            <td className='border px-6 py-4'>{trabajoDeGrado.trag.trag_fecha_fin}</td>
                            <td className='border px-6 py-4'>{trabajoDeGrado.trag.trag_fecha_sustentacion}</td>
                            <td className='border px-6 py-4'>{trabajoDeGrado.trag.trag_estado}</td>
                            <td className='border px-6 py-4'>
                                <div className='flex'>
                                    <button className='bg-yellow-400 text-black p-2 px-3 rounded' onClick={() => {
                                        setBody({
                                            user: datosUsuario.user_id,
                                            trag_id: trabajoDeGrado.trag.id,
                                            trag_titulo: trabajoDeGrado.trag.antp.antp_titulo,
                                            trag_estado: trabajoDeGrado.trag.trag_estado,
                                            trag_fecha_inicio: trabajoDeGrado.trag.trag_fecha_inicio,
                                            trag_fecha_fin: trabajoDeGrado.trag.trag_fecha_fin,
                                            users: trabajoDeGrado.users,
                                            docs: trabajoDeGrado.docs
                                        })
                                        comprobarFecha()                                     
                                        setIsValid(true)
                                        setIsEdit(true)
                                        setShowModal(true);}}
                                    >
                                        <FontAwesomeIcon icon={faEdit} /> 
                                    </button>    
                                </div>
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
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Modificar trabajo de grado</h3>
                                <form className="space-y-6" action="#">
                                <div>
                        <label htmlFor="seg_estado" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" >Estado</label>
                        <select name="trag_estado" className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        value={body.trag_estado}
                        onChange={(e) => {
                            onChange(e);
                        }}
                        >
                            {['PRÓRROGA SOLICITADA', 'PRÓRROGA APROBADA', 'PRÓRROGA NO APROBADA', 'SOLICITUD FECHA', 'JURADOS ASIGNADOS', 'SOLICITAR CANCELACION', 'CANCELACION APROBADA', 'CANCELACION NO APROBADA'].map((estado)=> {
                                if((body.trag_estado === 'PRÓRROGA SOLICITADA' || body.trag_estado === 'PRÓRROGA APROBADA'|| body.trag_estado === 'PRÓRROGA NO APROBADA') && (estado === 'PRÓRROGA SOLICITADA' || estado === 'PRÓRROGA APROBADA'|| estado === 'PRÓRROGA NO APROBADA')){
                                    return <option value={estado} disabled={estado === 'PRÓRROGA SOLICITADA'}>{`${estado}`}</option>
                                }else if((body.trag_estado === 'SOLICITUD FECHA' || body.trag_estado === 'JURADOS ASIGNADOS') && (estado === 'SOLICITUD FECHA' || estado === 'JURADOS ASIGNADOS')){
                                    return <option value={estado} disabled={estado === 'SOLICITUD FECHA'}>{`${estado}`}</option>
                                }else  if((body.trag_estado === 'SOLICITAR CANCELACION' || body.trag_estado === 'CANCELACION APROBADA'|| body.trag_estado === 'CANCELACION NO APROBADA') && (estado === 'SOLICITAR CANCELACION' || estado === 'CANCELACION APROBADA'|| estado === 'CANCELACION NO APROBADA')){
                                    return <option value={estado} disabled={estado === 'SOLICITAR CANCELACION'}>{`${estado}`}</option>
                                }
                                return 1
                            })}
                        </select>
                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Subir Documentos</label>
                                        <input
                                            type="file"
                                            name="eva_evidencia"
                                            id="eva_evidencia"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder={body.eva_evidencia}
                                            onChange={saveFiles} // Pasa la función como manejador de eventos
                                            required
                                            />
                                    </div>
                                    {isEdit && Array.isArray(body.documentos)? 
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Documentos</label>
                                                <div>
                                                    {
                                                    body.documentos.map((doc) => {
                                                        IdDocumentos.push(parseInt(doc.doc.id))
                                                        return (
                                                            <div key={doc.doc.id}>
                                                            <a href={`http://127.0.0.1:8000${doc.doc.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                {doc.doc.doc_nombre}
                                                            </a>
                                                        </div>
                                                        )
                                                    })}
                                                </div>
                                        </div>
                                    : null}
                                    {isValid ? null : <p className="text-red-700">{showMensaje}</p>}
                                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={(e) => {
                                        checking();
                                        e.preventDefault(); // Previene el comportamiento predetermina
                                    }
                                    }>Editar</button>
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

export default TrabajoDeGradoTemporal