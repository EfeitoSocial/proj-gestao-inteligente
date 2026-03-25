import { useState, useEffect, createContext, useContext, type FC, type ReactNode } from 'react'

export interface User {
  id: string
  email?: string
  user_metadata: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    nomeFantasia: string,
    razaoSocial: string,
    cnpj: string,
  ) => Promise<{ error: any }>
  signIn: (loginField: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual simulada
    const getSession = () => {
      try {
        const storedUser = localStorage.getItem('@app:user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Error reading session', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()
  }, [])

  const signUp = async (
    email: string,
    password: string,
    nomeFantasia: string,
    razaoSocial: string,
    cnpj: string,
  ) => {
    try {
      const users = JSON.parse(localStorage.getItem('@app:users') || '[]')

      if (users.some((u: any) => u.email === email)) {
        return { error: { message: 'E-mail já cadastrado' } }
      }

      const newUser = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        email,
        password,
        user_metadata: {
          nome_fantasia: nomeFantasia,
          razao_social: razaoSocial,
          cnpj: cnpj,
        },
      }

      users.push(newUser)
      localStorage.setItem('@app:users', JSON.stringify(users))

      return { error: null }
    } catch (err) {
      return { error: { message: 'Erro ao cadastrar usuário' } }
    }
  }

  const signIn = async (loginField: string, password: string) => {
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500))

      const users = JSON.parse(localStorage.getItem('@app:users') || '[]')
      let foundUser = null

      if (loginField.includes('@')) {
        foundUser = users.find((u: any) => u.email === loginField && u.password === password)
      } else {
        foundUser = users.find(
          (u: any) =>
            (u.user_metadata.cnpj === loginField ||
              u.user_metadata.nome_fantasia.toLowerCase() === loginField.toLowerCase()) &&
            u.password === password,
        )
      }

      if (!foundUser) {
        if (loginField.includes('@')) {
          return { error: { message: 'E-mail ou senha incorretos' } }
        }
        return { error: { message: 'Empresa não encontrada ou dados incorretos' } }
      }

      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('@app:user', JSON.stringify(userWithoutPassword))

      return { error: null }
    } catch (err) {
      return { error: { message: 'Erro ao processar login' } }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('@app:user')
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
