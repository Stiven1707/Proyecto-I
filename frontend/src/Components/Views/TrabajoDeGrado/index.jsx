import React, {useEffect, useState} from 'react'
import axios, { formToJSON } from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCirclePlus  } from '@fortawesome/free-solid-svg-icons';

const TrabajoDeGrado = () => {

    const initialState = {
        id: 0,
        users: [{
            user: {
                email: ""
            }
        },
        {
            user: {
                email: "shigidio@gmail.com"
            }
        },
        {
            user: {
                email: ""
            }
        }],
        docs: [],
        trag_titulo: "",
        trag_modalidad: "",
        trag_fecha_recepcion: new Date().toISOString().slice(0, 10),
        trag_fecha_sustentacion: null,
        trag_estado: "ACTIVO",
	}

    const [trabajoDeGradoList, setTrabajoDeGradoList] = useState([]);
	const [body, setBody] = useState(initialState);
	const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [idDelete, setIdDelete] = useState('');
	const [propuestaDelete, setPropuestaDelete] = useState('');
	const [isId, setIsId] = useState('');
	const [isEdit, setIsEdit] = useState(false);
    const [isValid, setIsValid] = useState(true);
	const [showMensaje, setShowMensaje] = useState('');




    const getTrabajosDeGrado = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
		const { data } = await axios.get('http://127.0.0.1:8000/api/trabajosdegrado/',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
		setTrabajoDeGradoList(data)
	}


    useEffect(()=>{
		getTrabajosDeGrado()}, [])

    const onChange = ({ target }) => {
        const { name, value } = target
        setBody({
            ...body,
            [name]: value
        });
        //setSelectedPeriodo(value !== "");
    };

    const onSubmit = async () => {
        const token = JSON.parse(localStorage.getItem('authTokens')).access;
        console.log('Datos body JSON: ',JSON.stringify(body));
        console.log('Datos body: ',body);
        axios.post('http://127.0.0.1:8000/api/trabajosdegrado/', body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(() => {
            //window.location.href = '/app/usuarios';
            setShowModal(false)
            setBody(initialState)
            getTrabajosDeGrado()
        })
        .catch(({response})=>{
            console.log(response)
            //setShowMensaje('Este nombre de usuario ya esta en uso. Prueba otro.');
            setIsValid(false);
        })
    }

        
    const onEdit = async () => {
        console.log(body);
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
        axios.put(`http://127.0.0.1:8000/api/user/${body.id}/`, body, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setShowModal(false)
            setBody(initialState)
            getTrabajosDeGrado()
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

    const onDelete = async () => {
        try {
            const { data } = await axios.post('http://127.0.0.1:8000/api/eliminar', { id: idDelete })
        } catch ({ response }) {
        }
    }

    function saveFiles(event) {
        // Obtener la lista de archivos seleccionados desde el evento
        const selectedFiles = event.target.files;
        // Inicializar un arreglo para almacenar los nombres y rutas de los archivos
        body.docs = [];
        // Recorrer la lista de archivos y agregar los datos al arreglo
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const fileName = file.name; // Nombre del archivo
            body.docs.push(
                { 
                doc:{
                        doc_nombre: fileName, doc_ruta: file 
                    }
                }
            );
        }
    }

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="sticky top-0 py-4 bg-gray-700 dark:bg-gray-900">
                    <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className='flex justify-between pl-5 pr-10'>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                                </div>
                                <div className='flex items-center'>
                                    <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={isId} onChange={(e)=>{
                                        setIsId(e.target.value)
                                    }} placeholder="Search"/>
                                    <button className='bg-cyan-600 text-gray-300 p-1 px-3 rounded-e' onClick={()=>{
                                        body.per_id = 0
                                    }}>Buscar</button>
                                </div>
                            </div>
                            <button className='px-4 py-2 bg-gray-700 text-white'  onClick={() => {
                                    setTitle('Crear')
                                    setBody(initialState)
                                    console.log('Datos body: ',body.users[1]);
                                    console.log('Datos initial state: ',initialState);
                                    setIsEdit(false)
                                    setShowModal(true)}}>
                                    <FontAwesomeIcon icon={faCirclePlus} /> Nuevo
                            </button>
                        </div>
                </div>
                <table className=" w-full text-sm text-left text-gray-500 dark:text-gray-400 overflow-y-scroll">{/* h-screen */}
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope='col' className='border px-6 py-3'>#</th>
                            <th scope='col' className='border px-6 py-3'>Participantes</th>
                            <th scope='col' className='border px-6 py-3'>Documentos</th>
                            <th scope='col' className='border px-6 py-3'>Titulo</th>
                            <th scope='col' className='border px-6 py-3'>Modalidad</th>
                            <th scope='col' className='border px-6 py-3'>Fecha de recepcion</th>
                            <th scope='col' className='border px-6 py-3'>Fecha de sustentacion</th>
                            <th scope='col' className='border px-6 py-3'>Estado</th>
                            <th scope='col' className='border px-6 py-3'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                    {trabajoDeGradoList.map((trabajodegrado)=>(
                        <tr key={trabajodegrado.id}>
                            <td className='border px-6 py-4'>{trabajodegrado.id}</td>
                            <td className='border px-6 py-4'>{trabajodegrado.users.map((user)=>{
                                return <p key={user.id}>{user.user.email}</p>
                                
                            })}</td>
                            <td className='border px-6 py-4'>{trabajodegrado.docs.map((doc)=>{
                                return <p key={doc.id}>{doc.doc.doc_nombre}</p>
                                
                            })}</td>
                            <td className='border px-6 py-4'>{trabajodegrado.trag_titulo}</td>
                            <td className='border px-6 py-4'>{trabajodegrado.trag_modalidad}</td>
                            <td className='border px-6 py-4'>{trabajodegrado.trag_fecha_recepcion}</td>
                            <td className='border px-6 py-4'>{trabajodegrado.trag_fecha_sustentacion}</td>
                            <td className='border px-6 py-4'>{trabajodegrado.trag_estado}</td>
                            <td className='border px-6 py-4'>
                                <div className='flex'>
                                <button className='bg-yellow-400 text-black p-2 px-3 rounded' onClick={() => {

                                        setBody(trabajodegrado)
                                        console.log(trabajodegrado)
                                        setTitle('Modificar')
                                        setIsEdit(true)
                                        setShowModal(true);}}
                                    >
                                        <FontAwesomeIcon icon={faEdit} /> 
                                    </button>    
                                    &nbsp;
                                    <button className='bg-red-700 text-gray-300 p-2 px-3 rounded'  onClick={() => {
                                        setIdDelete(trabajodegrado.id)
                                        setPropuestaDelete(trabajodegrado.username)
                                        setShowModalDelete(true)
                                    }}>
                                        <FontAwesomeIcon icon={faTrash} />
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
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">{title} trabajo de grado</h3>
                                <form className="space-y-6" action="#">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Titulo</label>
                                    <input type="text" placeholder="Digite nombre de titulo" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    label='trag_titulo'
                                    value={body.trag_titulo}
                                    onChange={onChange}
                                    name='trag_titulo'
                                    required/>
                                </div>
                                
                                <div>
                                        <label htmlFor="Roles" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modalidad</label>
                                        <select
                                                name="trag_modalidad"
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                value={body.trag_modalidad}
                                                onChange={(e)=>{
                                                    onChange(e)
                                                }}
                                                required 
                                                >
                                                    
                                                <option value='' disabled selected>Seleccionar Modalidad</option>
                                                <option value='tesis'>Tesis</option>
                                                <option value='practicaLaboral'>Practica laboral</option>
                                            </select>
                                    </div>
{/*                                     <div>
                                        <label  htmlFor="trag_fecha_recepcion" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Fecha Recepcion
                                        </label>
                                        <input
                                            type='date'
                                            name="trag_fecha_recepcion"
                                            id="trag_fecha_recepcion"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            value={body.trag_fecha_recepcion}
                                            onChange={onChange}
                                            required
                                        />
                                    </div> */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email estudiante {body.trag_modalidad === 'tesis'? 1: ''}</label>
                                        <input type="email" placeholder="Digite su correo" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                        label='email1'
                                        value={body.users[1].user.email}
                                        onChange={onChange}
                                        name='email1'
                                        required/>
                                    </div>
                                    {body.trag_modalidad === 'tesis'? 
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email estudiante 2</label>
                                            <input type="email" placeholder="Digite su correo" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                            label='email2'
                                            value={body.users[2].user.email}
                                            onChange={onChange}
                                            name='email2'
                                            required/>
                                        </div>
                                    : null}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Documento</label>
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
                                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={(e) => {
                                        if (isEdit) {
                                            onEdit();
                                        } else {
                                            onSubmit();
                                        }
                                        e.preventDefault(); // Previene el comportamiento predeterminado de envío del formulario
                                    }}
                                    >{title}</button>
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
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                <span className="sr-only text-black">Close modal</span>
                            </button>
                            <div className="px-6 py-6 lg:px-8">
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Desea eliminar el periodo {propuestaDelete}</h3>
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
                                        setPropuestaDelete('')
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

export default TrabajoDeGrado