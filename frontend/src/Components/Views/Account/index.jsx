import React, { useState } from "react";
import axios from 'axios'
import jwt_decode from "jwt-decode";
import { apiRoute } from "../../config";




const Account = () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)

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

    const [body, setBody] = useState(initialState)
    const [showMensaje, setShowMensaje] = useState(false);

    const onChange = ({ target }) => {
        const { name, value } = target
        setBody({
            ...body,
            [name]: value
        });
        
    };

    let fileData = [];

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

        
    const onEdit = async () => {
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
        console.log('Datos a editar: ', body);
        axios.put(`${apiRoute}anteproyectos/${body.anteproyecto.id}/`, body, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setBody(initialState)
        })
        .catch(({response})=>{
            console.log(response)
        })
    }

    return (
        <main className="">
            <section className="text-black text-opacity-70 w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-3/5 h-screen ">
            <div className="w-full h-100">
                <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12 text-center">Perfil</h1>
                <form className="mt-6">
                <div className="mt-6">
                        <img src="" alt="foto_perfil" />
                    </div>
                    <div className="mt-6 mb-4">
                        <label className="block">Nombre completo</label>
                        <input type="text" placeholder="Digite su nombre" className="w-full px-4 py-3 rounded-lg  mt-2 border border-gray-600 focus:border-blue-500  focus:outline-none" 
                        label='full_name'
                        value={body.full_name}
                        onChange={onChange}
                        name='full_name'
                        required/>
                    </div>
                    <div className="mb-4">
                                        <label className="block">Biografia</label>
                                            <textarea name='bio' label='bio' id='bio' className="mt-2 border border-gray-600 focus:border-blue-500  text-sm rounded-lg block w-full p-2.5 " placeholder="Digite su biografia"
                                            value={body.bio}
                                            onChange={onChange}
                                            required
                                            />
                                    </div>
                    <div className="mb-4">
                                        <label className="block">Contraseña</label>
                                        <input type="password" placeholder="Digite contraseña" className="w-full px-4 py-3 rounded-lg  mt-2 border border-gray-600 focus:border-blue-500  focus:outline-none" 
                                        label='password'
                                        value={body.password}
                                        onChange={onChange}
                                        name='password'
                                        required/>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block">Confirmar Contraseña</label>
                                        <input type="password" placeholder="Digite contraseña" className="w-full px-4 py-3 rounded-lg  mt-2 border border-gray-600 focus:border-blue-500  focus:outline-none" 
                                        label='password2'
                                        value={body.password2}
                                        onChange={onChange}
                                        name='password2'
                                        required/>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block">Subir Documento</label>
                                        <input
                                            type="file"
                                            name="eva_evidencia"
                                            id="eva_evidencia"
                                            className="w-full px-4 py-3 rounded-lg  mt-2 border border-gray-600 focus:border-blue-500  focus:outline-none"
                                            placeholder={body.eva_evidencia}
                                            onChange={saveFiles} // Pasa la función como manejador de eventos
                                            required
                                            multiple
                                            />
                                    </div>
                    {showMensaje ? <p className="text-red-700"> No se encontró ninguna cuenta activa con las credenciales proporcionadas</p> : null}
                    <button type="submit" className="w-full block bg-blue-900 hover:bg-blue-800 focus:bg-blue-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
                    onClick={onEdit}>
                        Actualizar datos
                    </button>
                </form>
            </div>
            </section>
        </main>
    );
};

export default Account;