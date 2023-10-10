import React, {useEffect, useState} from 'react'
import axios from 'axios'

const PropuestaTesis = () => {
 //const url = 'http://localhost/4000/api';
    const initialState = {
        por_id: 0,
        por_titulo: "",
        por_descripcion: "",
        por_objetivos: "",
	}

    const [propuestaList, setPropuestaList] = useState([]);
	const [body, setBody] = useState(initialState);
	const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [idDelete, setIdDelete] = useState('');
	const [propuestaDelete, setPropuestaDelete] = useState('');
	const [isId, setIsId] = useState('');
	const [isEdit, setIsEdit] = useState(false);
    const [isFound, setIsFound] = useState(false);




    const getPropuestas = async () => {
        
		const { data } = await axios.get('http://127.0.0.1:8000/api/propuestas/')
		setPropuestaList(data)
	} 

    const onChange = ({ target }) => {
        const { name, value } = target
        setBody({
            ...body,
            [name]: value
        });
        //setSelectedPeriodo(value !== "");
    };

    const onSubmit = async () => {
        setShowModal(false)
        axios.post('http://127.0.0.1:8000/api/propuestas/', body)
        .then(() => {
            setBody(initialState)
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

        
    const onEdit = async () => {
        try {
            setShowModal(false)
            const { data } = await axios.post('http://127.0.0.1:8000/api/editar', body)
            setBody(initialState)
        } catch ({ response }) {
    }

    const onDelete = async () => {
        try {
            const { data } = await axios.post('http://127.0.0.1:8000/api/eliminar', { id: idDelete })
        } catch ({ response }) {
        }
    }

    return (
        <div >
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="pb-4 bg-white dark:bg-gray-900">
                    <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className='flex justify-between pl-5 pr-10'>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                        </div>
                        <div className='flex'>
                            <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={isId} onChange={(e)=>{
                                setIsId(e.target.value)
                                console.log(e.target.value);
                            }} laceholder="Search"/>
                            <button className='bg-cyan-600 text-gray-300 p-1 px-3 rounded-e' onClick={()=>{
                                body.per_id = 0
                            }}>Buscar</button>
                        </div>
                    </div>
                        {isFound? <button className='px-4 py-2 bg-gray-800 text-white'  onClick={() => {
                            setTitle('Crear')
                            setBody(initialState)
                            setIsEdit(false)
                            setShowModal(true)}}>
                                <i className='fa-solid fa-circle-plus'></i> Nuevo
                        </button> : null}
                        </div>
                </div>
                <table className="sticky w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope='col' className='border px-6 py-3'>#</th>
                            <th scope='col' className='border px-6 py-3'>Titulo</th>
                            <th scope='col' className='border px-6 py-3'>Descripcion</th>
                            <th scope='col' className='border px-6 py-3'>Objetivos</th>
                            <th scope='col' className='border px-6 py-3'>Descripcion</th>
                            <th scope='col' className='border px-6 py-3'>Acciones</th>

                        </tr>
                    </thead>
                    <tbody>
                    {propuestaList.map((propuesta)=>(
                        <tr key={propuesta.per_id}>
                            <td className='border px-6 py-4'>{propuesta.pro_id}</td>
                            <td className='border px-6 py-4'>{propuesta.pro_titulo}</td>
                            <td className='border px-6 py-4'>{propuesta.pro_descripcion}</td>
                            <td className='border px-6 py-4'>{propuesta.pro_objetivos}</td>
                            <td className='border px-6 py-4'>
                                <button className='bg-yellow-400 text-black p-2 px-3 rounded' onClick={() => {
                                    console.log(propuestaList);
                                    setBody(propuesta)
                                    setTitle('Modificar')
                                    setIsEdit(true)
                                    setShowModal(true);}}
                                >
                                    <i className='fa-solid fa-edit'></i>    
                                </button>    
                                &nbsp;
                                <button className='bg-red-700 text-gray-300 p-2 px-3 rounded'  onClick={() => {
                                    setIdDelete(propuesta.pro_id)
                                    setPropuestaDelete(propuesta.pro_titulo)
                                    setShowModalDelete(true)
                                }}>
                                    <i className='fa-solid fa-trash'></i>
                                </button>
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
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                <span className="sr-only text-black">Close modal</span>
                            </button>
                            <div className="px-6 py-6 lg:px-8">
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">{title} periodo</h3>
                                <form className="space-y-6" action="#">
                                    <div>
                                        <label htmlFor="per_nombre" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                                        <input type="text" name="per_nombre" id="per_nombre" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" 
                                        value={body.per_nombre}
                                        onChange={onChange}
                                        required/>
                                    </div>
                                    <div>
                                        <label htmlFor="per_fechainicio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha inicio</label>
                                        <input
                                        type="date"
                                        id="per_fechainicio"
                                        name="per_fechainicio"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Selecciona una fecha"
                                        value={body.per_fechainicio}
                                        onChange={onChange} required/>

                                    </div>
                                    <div>
                                        <label htmlFor="per_fechainicio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha fin</label>
                                        <input
                                        type="date"
                                        id="per_fechafin"
                                        name="per_fechafin"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Selecciona una fecha"
                                        value={body.per_fechafin}
                                        onChange={onChange} required/>

                                    </div>
                                    <div>
                                        <label htmlFor="per_anno" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ano</label>
                                        <input type="number" name="per_anno" id="per_anno" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="ej:2020" min="2000" max="2024" maxLength="4" pattern="\d{4}"
                                        value={body.per_anno}
                                        onChange={onChange}
                                        required/>
                                    </div>
                                    <div>
                                        <label htmlFor="per_semestre" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Semestre</label>
                                        <input type="number" name="per_semestre" id="per_semestre" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" min="1" max="2" step="1" maxLength="1" pattern="[1-9]" 
                                        value={body.per_semestre}
                                        onChange={onChange}
                                        required/>
                                    </div>
                                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={isEdit ? () => onEdit() : () => onSubmit()
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
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
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
}

export default PropuestaTesis
