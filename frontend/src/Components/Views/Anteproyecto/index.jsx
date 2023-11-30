import React, {useEffect, useState} from 'react'
import axios from 'axios'
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCirclePlus  } from '@fortawesome/free-solid-svg-icons';

const Anteproyecto = () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)
    
    let IdDocumentos = [];
    const initialState = {
        user: datosUsuario.user_id,
        estudiante1: '',
        estudiante2: '',
        estudiantes: [],
        profesores: [],
        coprofesor: '',
        antp_titulo: "",
        antp_descripcion: "",
        Documentos: [],
        antp_modalidad:""
	}

    const [anteproyectoList, setAnteproyectoList] = useState([]);
    //const [profesorList, setProfesorList] = useState([]);
	const [body, setBody] = useState(initialState);
	const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [idDelete, setIdDelete] = useState('');
	const [anteproyectoDelete, setAnteproyectoDelete] = useState('');
	const [isId, setIsId] = useState('');
	const [isEdit, setIsEdit] = useState(false);
    //const [isFound, setIsFound] = useState(false);
    const [profesores, setProfesores] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [isValid, setIsValid] = useState(true);
	const [showMensaje, setShowMensaje] = useState('');



    let fileData = [];

    const getAnteproyectos = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get('http://127.0.0.1:8000/api/anteproyectos/',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (datosUsuario.rol === 'profesor'){
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
		const { data } = await axios.get('http://127.0.0.1:8000/api/user/',{
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

    const onChange = ({ target }) => {
        const { name, value } = target
        setBody({
            ...body,
            [name]: value
        });
        //setSelectedPeriodo(value !== "");
    };

/*     const isWorking = () => {
        if (body.estudiantes.find((id) => id === estudiantes.id)) {
            console.log('Es estudiante ya esta en un anteproyecto');
        }else{
        }
    } */

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
            const IdProfesores = [];
            const IdEstudiantes = [];
            IdProfesores.push(datosUsuario.user_id)
            if(!body.coprofesor===''){
                IdProfesores.push(parseInt(body.coprofesor));
            }
            IdEstudiantes.push(parseInt(body.estudiante1));
            if(body.antp_modalidad === 'Trabajo de Investigación' && body.estudiante2){
                IdEstudiantes.push(parseInt(body.estudiante2));
            }
            body.profesores = IdProfesores;
            body.estudiantes = IdEstudiantes;
            body.Documentos = IdDocumentos;
            if (isEdit){
                onEdit()
            }else{
                onSubmit();
            }
        } catch (error) {
            console.error('Fallo al subir el archivo: ', error);
        }
    };

    const checking = () => {
        if (body.antp_titulo === '') {
            setShowMensaje("Por favor llene el campo titulo");
            setIsValid(false);
            return false;
        }
        if (body.antp_descripcion === '') {
            setShowMensaje("Por favor llene el campo descripcion");
            setIsValid(false);
            return false;
        }
        if (body.antp_modalidad === '') {
            setShowMensaje("Por favor seleccione una modalidad");
            setIsValid(false);
            return false;
        }
        if (body.estudiante1 === '') {
            setShowMensaje(`Por favor seleccione ${body.antp_modalidad==='tesis'? 'al menos un estudiante ': 'al estudiante'}`);
            setIsValid(false);
            return false;
        }
        if (body.estudiante1 === body.estudiante2) {
            setShowMensaje('No se puede elegir el mismo estudiante');
            setIsValid(false);
            return false;
        }
        setIsValid(true);
        uploadFiles();
    };
    
    const onSubmit = async () => {
        const token = JSON.parse(localStorage.getItem('authTokens')).access;
        setShowModal(false);
        axios
            .post('http://127.0.0.1:8000/api/anteproyectos/', body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                setBody(initialState);
                getAnteproyectos();
            })
            .catch(({ response }) => {
                console.log(response);
            });
    };
    

        
    const onEdit = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
        setShowModal(false);
        console.log('Datos a editar: ', body);
        axios.put(`http://127.0.0.1:8000/api/anteproyectos/${body.anteproyecto.id}/`, body, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setBody(initialState)
            getAnteproyectos()
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

    const onDelete = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access

        axios.delete(`http://127.0.0.1:8000/api/anteproyectos/${idDelete}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            getAnteproyectos()
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

    const addPropertyToBody = (name, value) => {
        setBody(prevBody => ({
            ...prevBody,
            [name]: value
        }));
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
                            <button className='px-4 py-2 bg-gray-700 text-white'  onClick={() => {
                                    setTitle('Crear')
                                    setBody(initialState)
                                    setIsEdit(false)
                                    setIsValid(true)
                                    setShowModal(true)}}>
                                    <FontAwesomeIcon icon={faCirclePlus} /> Nuevo
                            </button>
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

                            {anteproyecto.seguimientos && anteproyecto.seguimientos[anteproyecto.seguimientos.length-1].seg.seg_observaciones === 'Aprobado'? null : 
                            
                            anteproyecto.seguimientos[anteproyecto.seguimientos.length-1].seg.seg_estado === 'A revisión'? null : 
                                <td className='border px-6 py-4'>
                                    <div className='flex'>
                                    <button className='bg-yellow-400 text-black p-2 px-3 rounded' onClick={() => {
                                            setBody(anteproyecto)
                                            setTitle('Modificar')
                                            addPropertyToBody('user', datosUsuario.user_id)
                                            addPropertyToBody('antp_titulo', anteproyecto.anteproyecto.antp_titulo)
                                            addPropertyToBody('antp_descripcion', anteproyecto.anteproyecto.antp_descripcion)
                                            addPropertyToBody('antp_modalidad', anteproyecto.anteproyecto.antp_modalidad)
                                            anteproyecto.usuarios.filter((usuario) => usuario.user.rol && usuario.user.rol.rol_nombre === 'estudiante').map((usuario, index)=>(
                                                addPropertyToBody(`estudiante${index+1}`, usuario.user.id)
                                            ))
                                            setIsValid(true)
                                            setIsEdit(true)
                                            setShowModal(true);}}
                                        >
                                            <FontAwesomeIcon icon={faEdit} /> 
                                        </button>    
                                        &nbsp;
                                        <button className='bg-red-700 text-gray-300 p-2 px-3 rounded'  onClick={() => {
                                            setIdDelete(anteproyecto.anteproyecto.id)
                                            setAnteproyectoDelete(anteproyecto.anteproyecto.antp_titulo)
                                            setShowModalDelete(true)
                                        }}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            }
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
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">{title} anteproyecto</h3>
                                <form className="space-y-6" action="#">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Titulo</label>
                                            <textarea name='antp_titulo' label='antp_titulo' id='antp_titulo' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            value={body.antp_titulo}
                                            onChange={onChange}
                                            required
                                            />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descripción</label>
                                            <textarea name='antp_descripcion' label='antp_descripcion' id='antp_descripcion' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            value={body.antp_descripcion}
                                            onChange={onChange}
                                            required
                                            />
                                    </div>
                                    <div>
                                        <label htmlFor="Roles" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modalidad</label>
                                        <select
                                                name="antp_modalidad"
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                value={body.antp_modalidad}
                                                onChange={(e)=>{
                                                    onChange(e)
                                                }}
                                                required 
                                                >
                                                    
                                                <option value='' disabled>Seleccionar Modalidad</option>
                                                <option value='Trabajo de Investigación'>Trabajo de Investigación</option>
                                                <option value='Práctica Profesional'>Práctica Profesional</option>
                                            </select>
                                    </div>
                                    {datosUsuario.rol === 'profesor'? null:
                                        <div>
                                            <label htmlFor="profesores" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Coordinador de proyecto</label>
                                            <select
                                                    name="profesores"
                                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                    value={body.profesores}
                                                    onChange={(e)=>{
                                                        onChange(e)
                                                        
                                                    }}
                                                    >
                                                        <option value={0}>Seleccionar al profesor encargado</option>
                                                        {profesores.map(profesor => (
                                                            <option key={profesor.id} value={profesor.id}>
                                                            {profesor.email}
                                                        </option>
                                                ))} 
                                                </select>
                                        </div>
                                    }
                                    <div>
                                        <label htmlFor="estudiante1" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Estudiante</label>
                                        <select
                                                name="estudiante1"
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                value={body.estudiante1}
                                                onChange={(e)=>{
                                                    onChange(e)
                                                }}
                                                >
                                                    <option value={0}>Seleccionar al estudiante {body.antp_modalidad === 'tesis'? 1: ''}</option>
                                                        {estudiantes.map(estudiante => (
                                                    <option key={estudiante.id} value={estudiante.id}>
                                                        {estudiante.email}
                                                    </option>
                                            ))} 
                                            </select>
                                    </div>
                                    {body.antp_modalidad === 'Trabajo de Investigación'?
                                        <div>
                                            <label htmlFor="estudiante2" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Estudiante</label>
                                            <select
                                                name="estudiante2"
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                value={body.estudiante2}
                                                onChange={(e)=>{
                                                    onChange(e)
                                                }}
                                                >
                                                    <option value=''>Seleccionar al estudiante 2</option>
                                                    {estudiantes
                                                    .filter(estudiante => estudiante.id !== body.estudiante1) // Filtrar el estudiante seleccionado en el primer select
                                                    .map(estudiante => (
                                                        <option key={estudiante.id} value={estudiante.id}>
                                                            {estudiante.email}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    :null}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Subir Documento</label>
                                        <input
                                            type="file"
                                            name="eva_evidencia"
                                            id="eva_evidencia"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder={body.eva_evidencia}
                                            onChange={saveFiles} // Pasa la función como manejador de eventos
                                            required
                                            multiple
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
                                    }>{title}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            ) : null}

			{showModalDelete ? (
                <>
                <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-500">
                    <div className="relative w-full max-w-md max-h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" onClick={() => setShowModalDelete(false)} >
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                <span className="sr-only text-black">Close modal</span>
                            </button>
                            <div className="px-6 py-6 lg:px-8">
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Desea eliminar el anteproyecto "{anteproyectoDelete}"</h3>
                                <div className='border px-6 py-6 pl-10 flex justify-evenly'>
                                    <button className='bg-green-600 text-gray-300 p-2 px-10 rounded' onClick={() => {
                                        onDelete();
                                        setShowModalDelete(false);}}
                                        >
                                        Aceptar 
                                    </button>    
                                    &nbsp;
                                    <button className='bg-red-700 text-gray-300 p-2 px-10 rounded'  onClick={() => {
                                        setIdDelete('')
                                        setAnteproyectoDelete('')
                                        setShowModalDelete(false)
                                    }}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            ) : null}
        </div>
	)
}

export default Anteproyecto
