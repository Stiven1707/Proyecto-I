import React from 'react'
import jwt_decode from "jwt-decode";

const Dashboard = () => {

    const datosUsuarioCifrados = (JSON.parse(localStorage.getItem('authTokens'))).access
    const datosUsuario = jwt_decode(datosUsuarioCifrados)
    console.log(datosUsuario);
    console.log(datosUsuarioCifrados);


    return (
        <div className="container mx-auto flex flex-col items-center" style={{backgroundColor: 'white'}}>
            <div className="flex flex-col items-center">
                <h2 className="mt-3 font-bold text-7xl">Bienvenido </h2>
                <h4 className="mt-3 font-bold text-3xl">{datosUsuario.full_name}</h4>  
            </div> 
            <div className="mt-6 ">
                <img src="https://agriperfiles.agri-d.net/file/n230433/uni-cauca.jpg" alt="..." className="flex items-center max-h-96 mt-6"/>
            </div>
        </div>

    )
}

export default Dashboard