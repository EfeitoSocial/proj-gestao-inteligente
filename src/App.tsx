import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Páginas
import { Home } from '@/pages/Home'
import { SignUp } from '@/pages/SignUp'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Projetos } from '@/pages/Projetos'
import { CadastrarProjeto } from '@/pages/CadastrarProjeto'
import NotFound from './pages/NotFound'
import { ProjetoDetalhes } from './pages/ProjetoDetalhes'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projetos"
              element={
                <ProtectedRoute>
                  <Projetos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projetos/cadastrar"
              element={
                <ProtectedRoute>
                  <CadastrarProjeto />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            <Route path="/projetos/:id" element={<ProjetoDetalhes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
