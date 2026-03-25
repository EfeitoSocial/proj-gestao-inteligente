// import React from 'react';
// import { Link, Navigate } from 'react-router-dom';
// import { useAuth } from '@/hooks/useAuth';

// export const Home: React.FC = () => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Se usuário estiver autenticado, redirecionar para dashboard
//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h1>
//           <p className="text-gray-600 mb-8">Sistema de Gestão Inteligente</p>

//           <div className="space-y-4">
//             <Link
//               to="/signup"
//               className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 block text-center"
//             >
//               Criar Conta
//             </Link>

//             <Link
//               to="/login"
//               className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition duration-200 block text-center"
//             >
//               Fazer Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// import React from 'react';
// import { Link, Navigate } from 'react-router-dom';
// import { useAuth } from '@/hooks/useAuth';

// export const Home: React.FC = () => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#189478' }}></div>
//       </div>
//     );
//   }

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center font-sans">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h1>
//           <p className="text-gray-600 mb-8">Sistema de Gestão Inteligente</p>

//           <div className="space-y-4">
//             <Link
//               to="/signup"
//               className="w-full py-3 px-4 rounded-md text-white block text-center transition duration-200"
//               style={{ backgroundColor: '#189478' }}
//               onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#147f66')}
//               onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#189478')}
//             >
//               Criar Conta
//             </Link>

//             <Link
//               to="/login"
//               className="w-full py-3 px-4 rounded-md text-white block text-center transition duration-200"
//               style={{ backgroundColor: '#189478' }}
//               onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#147f66')}
//               onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#189478')}
//             >
//               Fazer Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export const Home: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center font-sans px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Sistema de Gestão Inteligente
          </p>

          <div className="space-y-3 sm:space-y-4">
            <Link
              to="/signup"
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-md transition duration-200 block text-center text-sm sm:text-base"
            >
              Criar Conta
            </Link>

            <Link
              to="/login"
              className="w-full bg-secondary hover:bg-secondary-hover text-white py-3 px-4 rounded-md transition duration-200 block text-center text-sm sm:text-base"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
