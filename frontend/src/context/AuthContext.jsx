import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('ems_token')
    const savedUser  = localStorage.getItem('ems_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (loginResponse) => {
    setToken(loginResponse.token)
    setUser(loginResponse)
    localStorage.setItem('ems_token', loginResponse.token)
    localStorage.setItem('ems_user',  JSON.stringify(loginResponse))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('ems_token')
    localStorage.removeItem('ems_user')
  }

  const isAdmin   = () => user?.role === 'ADMIN'
  const isManager = () => ['ADMIN', 'MANAGER', 'HR'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
