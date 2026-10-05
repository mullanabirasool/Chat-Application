import React from 'react'
import Router from './Router/Router'
import {AuthProvider} from './Context/AuthContext';
import './App.css' 

const App = () => {
  return (
    <div>
      
      <AuthProvider>
        <Router/>
        </AuthProvider>
    </div>
  )
}
export default App




