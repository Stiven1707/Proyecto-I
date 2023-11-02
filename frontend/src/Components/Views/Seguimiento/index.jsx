import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const Seguimiento = () => {
  const datosUsuarioCifrados = JSON.parse(localStorage.getItem('authTokens')).access;
  const datosUsuario = jwt_decode(datosUsuarioCifrados);

  const initialState = {
    user: datosUsuario.user_id,
    seg_fecha_recepcion: '',
    seg_fecha_asignacion: '',
    seg_fecha_concepto: '',
    seg_observaciones: '',
    seg_estado: 'En espera',
  };

  const [seguimientoList, setSeguimientoList] = useState([]);
  const [body, setBody] = useState(initialState);
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [idDelete, setIdDelete] = useState('');
  const [seguimientoDelete, setSeguimientoDelete] = useState('');
  const [isId, setIsId] = useState('');
  const [isEdit, setIsEdit] = useState(false);


  const getSeguimientos = async () => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;
    const { data } = await axios.get('http://127.0.0.1:8000/api/seguimientos/anteproyecto/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setSeguimientoList(data);
  };


  useEffect(() => {
    getSeguimientos();
  }, []);

  const onChange = ({ target }) => {
    const { name, value } = target;
    setBody({
      ...body,
      [name]: value,
    });
  };

  const onSubmit = async () => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;
    setShowModal(false);
    axios
      .post('http://127.0.0.1:8000/api/seguimientos/', body, {
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

  const onEdit = async () => {
    const token = JSON.parse(localStorage.getItem('authTokens')).access;
    console.log(body);
    axios
      .put(`http://127.0.0.1:8000/api/seguimientos/${body.id}/`, body, {
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
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="border px-6 py-3">#</th>
              <th scope="col" className="border px-6 py-3">Titulo</th>
              <th scope="col" className="border px-6 py-3">Seguimientos</th>
              <th scope="col" className="border px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {seguimientoList.map((seguimiento) => (
              <tr key={seguimiento.id}>
                {console.log(seguimiento)}
                <td className="border px-6 py-4">{seguimiento.antp.id}</td>
                <td className="border px-6 py-4">{seguimiento.antp.antp_titulo}</td>
                {/* {seguimiento.seg.forEach(seg => { */}
                <table>
                  <caption className='border px-6 py-3'>Segumiento 1</caption>
                  <thead>
                  <th scope="col" className="border px-6 py-3">Fecha Recepcion</th>
                  <th scope="col" className="border px-6 py-3">Fecha asignacion</th>
                  <th scope="col" className="border px-6 py-3">Fecha Concepto</th>
                  <th scope="col" className="border px-6 py-3">Observaciones</th>
                  <th scope="col" className="border px-6 py-3">Estado</th>
                  </thead>
                  <tbody>
                    <td className="border px-6 py-4">{seguimiento.seg.seg_fecha_recepcion}</td>
                    <td className="border px-6 py-4">{seguimiento.seg.seg_fecha_asignacion}</td>
                    <td className="border px-6 py-4">{seguimiento.seg.seg_fecha_concepto}</td>
                    <td className="border px-6 py-4">{seguimiento.seg.seg_observaciones}</td>
                    <td className="border px-6 py-4">{seguimiento.seg.seg_estado}</td>
                  </tbody>
                </table>
                {/* })} */}
                <td className="border px-6 py-4">
                  <div className="flex">
                    <button
                      className="px-4 py-2 bg-gray-700 text-white"
                      onClick={() => {
                        setTitle('Crear');
                        setBody(initialState);
                        setIsEdit(false);
                        setShowModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faCirclePlus} /> Nuevo
                    </button>
                  </div>
                  <div className="flex mt-2"> {/* Agrega un margen superior para separar los otros botones */}
                    <button
                      className="bg-yellow-400 text-black p-2 px-3 mr-2 rounded"
                      onClick={() => {
                        setBody(seguimiento);
                        setTitle('Modificar');
                        setIsEdit(true);
                        setShowModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="bg-red-700 text-gray-300 p-2 px-3 rounded"
                      onClick={() => {
                        setIdDelete(seguimiento.id);
                        setSeguimientoDelete(seguimiento.id);
                        setShowModalDelete(true);
                      }}
                    >
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
                      <label htmlFor="seg_fecha_recepcion" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Fecha Recepción
                      </label>
                      <input
                        type="date"
                        id="seg_fecha_recepcion"
                        name="seg_fecha_recepcion"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:ring-blue-500"
                        value={body.seg_fecha_recepcion}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="fecha_asignacion" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Fecha Asignacion
                      </label>
                      <input
                        type='date'
                        name="seg_fecha_asignacion"
                        id="seg_fecha_asignacion"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={body.seg_fecha_asignacion}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label  htmlFor="fecha_recepcion" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Fecha Concepto
                      </label>
                      <input
                        type='date'
                        name="seg_fecha_concepto"
                        id="seg_fecha_concepto"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={body.seg_fecha_concepto}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Observaciones
                      </label>
                      <textarea
                        name="seg_observaciones"
                        id="seg_observaciones"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={body.seg_observaciones}
                        onChange={onChange}
                        required
                      />
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
                      >
                        <option value="En espera">En espera</option>
                        <option value="Activo">Activo</option>
                        <option value="Terminado">Terminado</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={isEdit ? () => onEdit() : () => onSubmit()}
                    >
                      {title}
                    </button>
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