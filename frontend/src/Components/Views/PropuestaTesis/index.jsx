import React, {useEffect, useState} from 'react'
import axios from 'axios'
import jwt_decode from "jwt-decode";

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
        const token = (JSON.parse(localStorage.getItem('authTokens'))).access
        console.log(token);
		const { data } = await axios.get('http://127.0.0.1:8000/api/propuestas/2/',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log(data);
		setPropuestaList(data)
	} 

    useEffect(()=>{
		getPropuestas()}, [])

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
            hola mundo
        </div>
	)
}
}

export default PropuestaTesis
