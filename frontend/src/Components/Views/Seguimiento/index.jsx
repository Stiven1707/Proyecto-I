import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faClockRotateLeft, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import Anteproyecto from './../AnteproyectoJurado/index';

const Seguimiento = () => {
  const datosUsuarioCifrados = JSON.parse(localStorage.getItem('authTokens')).access;
  const datosUsuario = jwt_decode(datosUsuarioCifrados);

  const initialState = {
    user: datosUsuario.user_id,
    seg_fecha_recepcion: '',
    seg_fecha_asignacion: '',
    seg_fecha_concepto: '',
    seg_observaciones: '',
    evaluador1: '',
    evaluador2: '',
    seg_estado: 'En espera',
    evaluaciones: []
  };

  const [seguimientoList, setSeguimientoList] = useState([]);
  const [histotialList, setHistotialList] = useState([]);
  const [body, setBody] = useState(initialState);
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalHistorial, setShowModalHistorial] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [idDelete, setIdDelete] = useState('');
  const [seguimientoDelete, setSeguimientoDelete] = useState('');
  const [isId, setIsId] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [isValid, setIsValid] = useState(true);
	const [showMensaje, setShowMensaje] = useState('');

  let IdDocumentos = 0;
  let fileData = [];

  const getSeguimientos = async () => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;
    const { data } = await axios.get('http://127.0.0.1:8000/api/anteproyectos/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setSeguimientoList(data);
  };

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


  useEffect(() => {
    getSeguimientos();
    getParticipantes();
  }, []);

  const onChange = ({ target }) => {
    const { name, value } = target;
    setBody({
      ...body,
      [name]: value,
    });
  };

  const onSubmit = async (idAnteproyecto) => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;
    const datosSeguimiento = {
      seg: {
        seg_fecha_recepcion: null,
        seg_estado: '',
      }
    }
    setShowModal(false);
    axios
      .post(`http://127.0.0.1:8000/api/seguimientos/anteproyecto/${idAnteproyecto}/`, datosSeguimiento, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setBody(initialState);
        getSeguimientos();
      })
      .catch(({ response }) => {
        console.log(response);
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
        const fileName = `FC_${file.name}`; // Nombre del archivo
        fileData.push({ doc_nombre: fileName, doc_ruta: file, anteproyectos: [], trabajos_de_grado: [] });
    }
}

const uploadFiles = async () => {
    try {
        const token = JSON.parse(localStorage.getItem('authTokens')).access;
        if (!(Array.isArray(fileData) && fileData.length === 0)) {

            IdDocumentos = 0;
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
                    IdDocumentos = parseInt(data.data.id);
                });
            });
    }
    //body.docs = IdDocumentos;

    console.log('dopcs: ', body);
    if(IdDocumentos && IdDocumentos.length === 0){
        setShowMensaje(`Por favor, suba el documento tipo C`);
        setIsValid(false);
        return false;
    }
    onEdit()
    onEdit2()

    } catch (error) {
        console.error('Fallo al subir el archivo: ', error);
    }
};

  const checking = () => {
    if(body.seg_estado === 'PENDIENTE'){
      setIsValid(false);
	    setShowMensaje('Por favor elija un estado distinto a PENDIENTE');
      return false
    }
    if(body.seg_estado === 'A revisión'){
      body.seg_fecha_asignacion = new Date().toISOString().split("T")[0]
      let fecha = new Date();
      fecha.setDate(fecha.getDate() + 10);
      body.seg_fecha_concepto = fecha.toISOString().split("T")[0]
    }
    if(!body.evaluador1){
      setIsValid(false);
	    setShowMensaje('Por favor seleccione al evaluador 1');
      return false
    }
    if(!body.evaluador2){
      setIsValid(false);
	    setShowMensaje('Por favor seleccione al evaluador 2');
      return false
    }

    if(parseInt(body.evaluador1) === parseInt(body.evaluador2)){
      setIsValid(false);
	    setShowMensaje('No puede elegir al mismo evaluador');
      return false
    }
    setIsValid(true);
    if(body.seg_estado === 'Remitido'){
      uploadFiles();
    }else{
      onEdit()
      onEdit2()
    }
  }


  const onEdit = async () => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;

    const IdEvaluadores = [];
    if(body.evaluador1 && body.evaluador2){
      IdEvaluadores.push(parseInt(body.evaluador1));
      IdEvaluadores.push(parseInt(body.evaluador2));
      body.evaluadores = IdEvaluadores
    }
    let anteproyecto = {
      evaluadores: IdEvaluadores,
    }
    console.log('edit: ',anteproyecto);
    axios
      .patch(`http://127.0.0.1:8000/api/anteproyectos/${body.idAnteproyecto}/evaluadores/`, anteproyecto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        onEdit2()
      })
      .catch(({ response }) => {
        console.log(response);
      });
  };

  const onEdit2 = async () => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;

    let idDocs = []
    body.docs.map((doc)=> {
      if(!(doc.doc_nombre.substr(0,2) === 'FC')){
        idDocs.push(doc.id)
    }
      return 1
    })
    if(body.seg_estado === 'Remitido'){
      idDocs.push(IdDocumentos)
    }
    let datosBody = {
      id: body.id,
      docs: idDocs,
      seg_estado: body.seg_estado,
      seg_fecha_asignacion: body.seg_fecha_asignacion,
      seg_fecha_concepto: body.seg_fecha_concepto
    }
      console.log('datosBody:',datosBody);
    axios
      .patch(`http://127.0.0.1:8000/api/seguimientos/${datosBody.id}/`, datosBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setShowModal(false)
        setBody(initialState);
        getSeguimientos();
      })
      .catch(({ response }) => {
        console.log(response);
      });
  };

  const onDelete = async () => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;
      await axios.delete(`http://127.0.0.1:8000/api/seguimientos/${idDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        getSeguimientos();
      })
      .catch(({ response }) => {
        console.log(response);
      });
  };

  const addPropertyToBody = (name, value) => {
    setBody(prevBody => ({
        ...prevBody,
        [name]: value
    }));
  };

  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="py-4 bg-gray-700 dark:bg-gray-900">
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="flex justify-between pl-5 pr-10">
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  id="table-search"
                  className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={isId}
                  onChange={(e) => {
                    setIsId(e.target.value);
                  }}
                  placeholder="Search"
                />
                <button
                  className="bg-cyan-600 text-gray-300 p-1 px-3 rounded-e"
                  onClick={() => {
                    body.per_id = 0;
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
        <table className="sticky w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <tbody>
            {seguimientoList.map((seguimiento) => (
              <tr key={seguimiento.anteproyecto.id}>
                <table className='sticky w-full text-sm text-left text-gray-500 dark:text-gray-400'>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="border px-6 py-3">Titulo</th>
                        <th scope="col" className="border px-6 py-3">Modalidad</th>
                        <th scope="col" className="border px-6 py-3">Director</th>
                        <th scope="col" className="border px-6 py-3">Estudiantes</th>
                        <th scope="col" className="border px-6 py-3">Evaluadores</th>
                      </tr>
                    </thead>
                    <tbody className='text-black'>
                      <tr>
                      <td className="border px-6 py-3">{seguimiento.anteproyecto.antp_titulo}</td>
                        <td className="border px-6 py-3">{seguimiento.anteproyecto.propuesta.pro_modalidad}</td>
                        <td className="border px-6 py-4">
                          {seguimiento.usuarios.map((user)=>{
                            if (estudiantes.find((estudiante) => estudiante.id === user.user.id)) {
                                return <p key={user.user.id}>{user.user.email}</p>;
                            }
                            return null;
                          })}
                          
                        </td>
                        <td className="border px-6 py-4">
                          {seguimiento.usuarios.map((user)=>{
                            if (profesores.find((profesor) => profesor.id === user.user.id)) {
                                return <p key={user.user.id}>{user.user.email}</p>;
                            }
                            return null;
                          })}
                        </td>
                        <td className="border px-6 py-4">
                          {seguimiento.anteproyecto.evaluadores.map((user)=>{
                            if (profesores.find((profesor) => profesor.id === user.id)) {
                                return <p key={user.id}>{user.email}</p>;
                            }
                            return null;
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {seguimiento.seguimientos[seguimiento.seguimientos.length-1]? 
                  <table className='table-auto w-full'>
                    <caption className='border px-6 py-3 dark:bg-cyan-900 dark:text-gray-100'>{`Segumiento ${seguimiento.seguimientos.length}`}</caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-cyan-100 dark:text-gray-800">
                      <tr>
                        <th scope="col" className="border px-6 py-3 w-1/6">Fecha Recepcion</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Fecha asignacion</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Fecha Concepto</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Observaciones</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Documentos</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Estado</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className='text-black dark:text-black'>
                      <tr>
                        <td className="border px-6 py-4">{seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.seg_fecha_recepcion}</td>
                        <td className="border px-6 py-4">{seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.seg_fecha_asignacion}</td>
                        <td className="border px-6 py-4">{seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.seg_fecha_concepto}</td>
                        <td className="border px-6 py-4">{seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.seg_observaciones}</td>
                        <td className="border px-6 py-4">{seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.docs? seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.docs.map((doc) => {
                          return <p key={doc.id}><a href={`http://127.0.0.1:8000${doc.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-purple-800">
                          {`${doc.doc_nombre.substr(0,12)}.pdf`}
                      </a></p>
                        }):null}</td>
                        <td className="border px-6 py-4">{seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.seg_estado}</td>
                        <td className="border px-6 py-4">
                          
                          {seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.seg_estado === 'No Aprobado'?
                              <div>
                                <button
                                    className="px-4 py-2 bg-gray-700 text-white rounded"
                                    onClick={() => {
                                      setBody(initialState);
                                      onSubmit(seguimiento.anteproyecto.id)
                                    }}
                                    >
                                    <FontAwesomeIcon icon={faCirclePlus} /> Nuevo
                                </button>
                              </div>
                          :
                            <div className="flex mt-2"> {/* Agrega un margen superior para separar los otros botones */}
                              <button
                                className="bg-yellow-400 text-black p-2 px-3 mr-2 rounded"
                                onClick={() => {
                                  setBody(seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg);
                                  setTitle('Modificar');
                                  setIsValid(true);
                                  console.log('cargar los datos: ', seguimiento.anteproyecto.id);
                                  addPropertyToBody('idAnteproyecto', seguimiento.anteproyecto.id)
                                  
                                  seguimiento.usuarios.filter((usuario) => usuario.user.rol && usuario.user.rol.rol_nombre === 'profesor').map((usuario, index)=>(
                                  addPropertyToBody(`profesor${index+1}`, usuario.user.id)
                                  ))
                                  seguimiento.anteproyecto.evaluadores.map((usuario, index)=>(
                                    addPropertyToBody(`evaluador${index+1}`, usuario.id)
                                  ))
                                  addPropertyToBody('estudiantes', seguimiento.usuarios.filter(usuario => usuario.user.rol.rol_nombre === "estudiante")
                                  .map(usuario => usuario.user.id))

                                  addPropertyToBody('profesores', seguimiento.usuarios.filter(usuario => usuario.user.rol.rol_nombre === "profesor")
                                  .map(usuario => usuario.user.id)) 

                                  addPropertyToBody('Documentos', seguimiento.documentos.map(documento => documento.doc.id)) 

                                  setIsEdit(true);
                                  setShowModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="bg-red-700 text-gray-300 p-2 px-3 rounded"
                                onClick={() => {
                                  setIdDelete(seguimiento.seguimientos[seguimiento.seguimientos.length-1].seg.id);
                                  setSeguimientoDelete(seguimiento.anteproyecto.antp_titulo);
                                  setShowModalDelete(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          }
                          <div className='pt-1 flex items-center'>
                            <button className='bg-blue-600 text-gray-300 p-2 px-3 rounded' onClick={()=> {
                              setHistotialList({anteproyecto: seguimiento.anteproyecto,
                                                seguimientos: seguimiento.seguimientos})
                                                setShowModalHistorial(true)
                            }}>
                              <FontAwesomeIcon icon={faClockRotateLeft} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    </tbody>
                  </table>
: null}
<br />
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
                <button
                  type="button"
                  className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                  onClick={() => setShowModal(false)}
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
                <div className="px-6 py-6 lg:px-8">
                  <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                    {title} seguimiento
                  </h3>
                  <form className="space-y-6" action="#">
                    <div>
                      <label htmlFor="evaluador1" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Evaluador 1</label>
                      <select
                              name="evaluador1"
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                              value={body.evaluador1}
                              onChange={(e)=>{
                                  onChange(e)
                                  
                              }}
                              >
                                <option value={0}>Seleccionar al evaluador 1</option>
                                  {profesores.map(profesor => {
                                    if(profesor.id !== body.profesor1 && profesor.id !== body.profesor2){
                                      return <option key={profesor.id} value={profesor.id}>
                                      {profesor.email}
                                    </option>
                                    }
                                    else{
                                      return null
                                    }
                                  })}
                          </select>
                  </div>
                  <div>
                      <label htmlFor="evaluador2" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Evaluador 2</label>
                      <select name="evaluador2" className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        value={body.evaluador2}
                        onChange={(e)=>{
                            onChange(e)
                        }}
                      >
                      <option value={0}>Seleccionar al evaluador 2</option>
                          {profesores.map(profesor => {
                            if(profesor.id !== body.profesor1 && profesor.id !== body.profesor2){
                              return <option key={profesor.id} value={profesor.id}>
                              {profesor.email}
                            </option>
                            }
                            else{
                              return null
                            }
                        })}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="seg_estado"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Estado
                      </label>
                      <select
                        name="seg_estado"
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        value={body.seg_estado}
                        onChange={(e) => {
                          onChange(e);
                        }}
                      >{['PENDIENTE', 'A revisión', 'No Aprobado', 'Evaluado', 'Remitido', 'Aprobado'].map((datos) =>{
                        console.log(datos);
                        if(body.seg_estado==='PENDIENTE' && (datos === 'PENDIENTE' || datos === 'A revisión')){
                          return <option value={datos} disabled={datos === 'PENDIENTE'}>{`${datos}`}</option>
                        }else if(body.seg_estado==='Evaluado' && (datos === 'Evaluado' || datos === 'No Aprobado' || datos === 'Remitido')){
                          return <option value={datos} disabled={datos === 'Evaluado'}>{`${datos}`}</option>
                        }
                        else if(body.seg_estado==='Remitido' && (datos === 'Remitido' || datos === 'No Aprobado')){
                          return <option value={datos} disabled={datos === 'Remitido'}>{`${datos}`}</option>
                        }
                        else if(body.seg_estado==='Aprobado' && (datos === 'Aprobado' || datos === 'Remitido')){
                          return <option value={datos} disabled={datos === 'Aprobado'}>{`${datos}`}</option>
                        }
                        return 1
                      })}
                      </select>
                    </div>
                    {body.seg_estado === 'Remitido'? 
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
                            />
                      </div>
                    :null}
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
                <div className="px-6 py-6 lg:px-8">

                  <table className='table-auto w-full'>
                    <caption className='border px-6 py-3 dark:bg-cyan-900 dark:text-gray-100'>{`Segumiento ${histotialList.anteproyecto.antp_titulo}`}</caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-cyan-100 dark:text-gray-800">
                      <tr>
                        <th scope="col" className="border px-6 py-3 w-1/6">#</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Fecha Recepcion</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Fecha asignacion</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Fecha Concepto</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Observaciones</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Documentos</th>
                        <th scope="col" className="border px-6 py-3 w-1/6">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                  {histotialList.seguimientos.map((seg, index)=> (
                      <tr key={index+1}>
                        <td className="border px-6 py-4">{index+1}</td>
                        <td className="border px-6 py-4">{seg.seg.seg_fecha_recepcion}</td>
                        <td className="border px-6 py-4">{seg.seg.seg_fecha_asignacion}</td>
                        <td className="border px-6 py-4">{seg.seg.seg_fecha_concepto}</td>
                        <td className="border px-6 py-4">{seg.seg.seg_observaciones}</td>
                        {console.log(seg.seg)}
                        <td className="border px-6 py-4">{seg.seg.docs? seg.seg.docs.map((doc) => {
                          return <p key={doc.id}><a href={`http://127.0.0.1:8000${doc.doc_ruta}`} target="_blank" rel="noreferrer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-purple-800">
                          {`${doc.doc_nombre.substr(0,12)}.pdf`}
                      </a></p>
                        }):null}</td>
                        <td className="border px-6 py-4">{seg.seg.seg_estado}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        </>
      ) : null}
      {showModalDelete ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-500">
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow dark-bg-gray-700">
                <button
                  type="button"
                  className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                  onClick={() => setShowModalDelete(false)}
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
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only text-black">Close modal</span>
                </button>
                <div className="px-6 py-6 lg:px-8">
                  <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                    Eliminar seguimiento
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    ¿Estás seguro que deseas eliminar el seguimiento "{seguimientoDelete}"? Esta
                    acción no se puede deshacer.
                  </p>
                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      className="bg-red-700 text-gray-300 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                      onClick={() => setShowModalDelete(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="ml-2 bg-blue-700 text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={() => {
                        setShowModalDelete(false);
                        onDelete();
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Seguimiento;