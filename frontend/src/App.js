import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Views/Login';
import Layout from './Components/Layout';

function App() {
  return (
    <Router>
    <Routes>
    <Route path="/" element={localStorage.getItem('auth') ? <Navigate to="/app" /> : <Navigate to="/login" />}/> 
      <Route path="/login" element={localStorage.getItem('auth') ? <Navigate to="/app" /> : <Login />}
      />
      <Route path="/app/*"  element={localStorage.getItem('auth') ? (
            <Layout />
          ) : (
            <Navigate to="/login" replace state={{ from: '/app' }} />
          )
        }
      /> 
    </Routes>
  </Router>
  );
}

export default App;
