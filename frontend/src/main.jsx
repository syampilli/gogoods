import './i18n/index.js'  // ← ఇది first line గా ఉండాలి
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider }   from './context/AuthContext'
import { ThemeProvider }  from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <SocketProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }}/>
      </SocketProvider>
    </AuthProvider>
  </ThemeProvider>
)