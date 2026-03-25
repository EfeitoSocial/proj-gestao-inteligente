// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Plus, Trash } from 'lucide-react';

// interface Contato {
//   id: number;
//   tipo: string;
//   nome: string;
//   cpf: string;
//   contato: string;
//   email: string;
// }

// interface TabelaContatosProps {
//   contatos: Contato[];
//   onChange: (contatos: Contato[]) => void;
// }

// export const TabelaContatos: React.FC<TabelaContatosProps> = ({
//   contatos,
//   onChange,
// }) => {
//     const formatCpf = (value: string): string => {
//     // Remove all non-numeric characters
//     const numbers = value.replace(/\D/g, '');
    
//     // Apply CPF formatting
//     if (numbers.length <= 3) return numbers;
//     if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
//     if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
//     return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
//   };

//   const validateCpf = (cpf: string): boolean => {
//     // Remove formatting
//     const numbers = cpf.replace(/\D/g, '');
    
//     // Check if has 11 digits
//     if (numbers.length !== 11) return false;
    
//     // Check if all digits are the same
//     if (/^(\d)\1{10}$/.test(numbers)) return false;
    
//     // Validate CPF algorithm
//     let sum = 0;
//     for (let i = 0; i < 9; i++) {
//       sum += parseInt(numbers.charAt(i)) * (10 - i);
//     }
//     let remainder = 11 - (sum % 11);
//     if (remainder === 10 || remainder === 11) remainder = 0;
//     if (remainder !== parseInt(numbers.charAt(9))) return false;
    
//     sum = 0;
//     for (let i = 0; i < 10; i++) {
//       sum += parseInt(numbers.charAt(i)) * (11 - i);
//     }
//     remainder = 11 - (sum % 11);
//     if (remainder === 10 || remainder === 11) remainder = 0;
//     if (remainder !== parseInt(numbers.charAt(10))) return false;
    
//     return true;
//   };

//   const adicionarContato = () => {
//     const novoId =
//       contatos.length > 0 ? Math.max(...contatos.map((c) => c.id)) + 1 : 1;
//     const novosContatos = [
//       ...contatos,
//       {
//         id: novoId,
//         tipo: '',
//         nome: '',
//         cpf: '',
//         contato: '',
//         email: '',
//       },
//     ];
//     onChange(novosContatos);
//   };

//   const removerContato = (id: number) => {
//     const novosContatos = contatos.filter((c) => c.id !== id);
//     onChange(novosContatos);
//   };

//   const atualizarContato = (
//     id: number,
//     campo: keyof Contato,
//     valor: string,
//   ) => {
//     const novosContatos = contatos.map((contato) =>
//       contato.id === id ? { ...contato, [campo]: valor } : contato,
//     );
//     onChange(novosContatos);
//   };

//   return (
//     <div className="mb-6">
//       <div className="flex items-center justify-between mb-4">
//         <Button
//           onClick={adicionarContato}
//           className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
//           type="button"
//         >
//           <Plus size={16} />
//           Incluir Contatos
//         </Button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
//                 Tipo Contato
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
//                 Nome
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
//                 CPF
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
//                 Contato
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
//                 E-mail
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
//                 Ações
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {contatos.map((contato) => (
//               <tr key={contato.id} className="border-t">
//                 <td className="px-4 py-2">
//                   <Select
//                     value={contato.tipo}
//                     onValueChange={(valor) =>
//                       atualizarContato(contato.id, 'tipo', valor)
//                     }
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Tipo" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Principal">Principal</SelectItem>
//                       <SelectItem value="Geral">Geral</SelectItem>
//                       <SelectItem value="Financeiro">Financeiro</SelectItem>
//                       <SelectItem value="Captador">Captador</SelectItem>
//                       <SelectItem value="Outros">Outros</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </td>
//                 <td className="px-4 py-2">
//                   <Input
//                     value={contato.nome}
//                     onChange={(e) =>
//                       atualizarContato(contato.id, 'nome', e.target.value)
//                     }
//                     placeholder="Nome"
//                   />
//                 </td>
//                 <td className="px-4 py-2">
//                   <Input
//                     value={contato.cpf}
//                                         onChange={(e) => {
//                       const formattedCpf = formatCpf(e.target.value);
//                       atualizarContato(contato.id, 'cpf', formattedCpf);
//                     }}
//                     placeholder="000.000.000-00"
//                     className={
//                       contato.cpf && !validateCpf(contato.cpf)
//                         ? 'border-red-500 focus:border-red-500'
//                         : ''
//                     }
//                     maxLength={14}
//                   />
//                   {contato.cpf && !validateCpf(contato.cpf) && (
//                     <p className="text-xs text-red-500 mt-1">CPF inválido</p>
//                   )}
//                 </td>
//                 <td className="px-4 py-2">
//                   <Input
//                     value={contato.contato}
//                     onChange={(e) =>
//                       atualizarContato(contato.id, 'contato', e.target.value)
//                     }
//                     placeholder="(00) 0000-0000"
//                   />
//                 </td>
//                 <td className="px-4 py-2">
//                   <Input
//                     value={contato.email}
//                     onChange={(e) =>
//                       atualizarContato(contato.id, 'email', e.target.value)
//                     }
//                     placeholder="email@email.com"
//                   />
//                 </td>
//                 <td className="px-4 py-2">
//                   <Button
//                     onClick={() => removerContato(contato.id)}
//                     variant="outline"
//                     size="sm"
//                     className="text-red-600 hover:text-red-700"
//                     type="button"
//                   >
//                     <Trash size={16} />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';

interface Contato {
  id: number;
  tipo: string;
  nome: string;
  cpf: string;
  contato: string;
  email: string;
}

interface TabelaContatosProps {
  contatos: Contato[];
  onChange: (contatos: Contato[]) => void;
}

export const TabelaContatos: React.FC<TabelaContatosProps> = ({
  contatos,
  onChange,
}) => {
    const formatCpf = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply CPF formatting
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const validateCpf = (cpf: string): boolean => {
    // Remove formatting
    const numbers = cpf.replace(/\D/g, '');
    
    // Check if has 11 digits
    if (numbers.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };

  const adicionarContato = () => {
    const novoId =
      contatos.length > 0 ? Math.max(...contatos.map((c) => c.id)) + 1 : 1;
    const novosContatos = [
      ...contatos,
      {
        id: novoId,
        tipo: '',
        nome: '',
        cpf: '',
        contato: '',
        email: '',
      },
    ];
    onChange(novosContatos);
  };

  const removerContato = (id: number) => {
    const novosContatos = contatos.filter((c) => c.id !== id);
    onChange(novosContatos);
  };

  const atualizarContato = (
    id: number,
    campo: keyof Contato,
    valor: string,
  ) => {
    const novosContatos = contatos.map((contato) =>
      contato.id === id ? { ...contato, [campo]: valor } : contato,
    );
    onChange(novosContatos);
  };

  return (
    <div className="mb-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={adicionarContato}
          className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg"
          type="button"
        >
          <Plus size={16} />
          Incluir Contatos
        </button>
      </div>

      {/*
        Tabela para telas grandes (desktop)
        Ela é escondida no mobile com a classe `hidden` e exibida como tabela com `lg:table`
      */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 hidden lg:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Tipo Contato</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Nome</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap">CPF</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Contato</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap">E-mail</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contatos.map((contato) => (
              <tr key={contato.id} className="border-t">
                <td className="px-4 py-2 whitespace-nowrap">
                  <select
                    value={contato.tipo}
                    onChange={(e) => atualizarContato(contato.id, 'tipo', e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="Principal">Principal</option>
                    <option value="Geral">Geral</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Captador">Captador</option>
                    <option value="Outros">Outros</option>
                  </select>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={contato.nome}
                    onChange={(e) => atualizarContato(contato.id, 'nome', e.target.value)}
                    placeholder="Nome"
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={contato.cpf}
                    onChange={(e) => {
                      const formattedCpf = formatCpf(e.target.value);
                      atualizarContato(contato.id, 'cpf', formattedCpf);
                    }}
                    placeholder="000.000.000-00"
                    className={`w-full border rounded-md p-2 text-sm ${contato.cpf && !validateCpf(contato.cpf) ? 'border-red-500 focus:border-red-500' : ''}`}
                    maxLength={14}
                  />
                  {contato.cpf && !validateCpf(contato.cpf) && (
                    <p className="text-xs text-red-500 mt-1">CPF inválido</p>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={contato.contato}
                    onChange={(e) => atualizarContato(contato.id, 'contato', e.target.value)}
                    placeholder="(00) 0000-0000"
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={contato.email}
                    onChange={(e) => atualizarContato(contato.id, 'email', e.target.value)}
                    placeholder="email@email.com"
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => removerContato(contato.id)}
                    className="flex items-center justify-center p-2 rounded-md border border-gray-300 text-red-600 hover:text-red-700 hover:bg-gray-100"
                    type="button"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Layout de cartões para telas pequenas (mobile e tablet)
        Ele é escondido no desktop com a classe `lg:hidden`
      */}
      <div className="space-y-4 lg:hidden">
        {contatos.map((contato) => (
          <div key={contato.id} className="border rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-800">Tipo de Contato</p>
                <select
                  value={contato.tipo}
                  onChange={(e) => atualizarContato(contato.id, 'tipo', e.target.value)}
                  className="w-full border rounded-md p-2 text-sm mt-1"
                >
                  <option value="Principal">Principal</option>
                  <option value="Geral">Geral</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Captador">Captador</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Nome</p>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm mt-1"
                  value={contato.nome}
                  onChange={(e) => atualizarContato(contato.id, 'nome', e.target.value)}
                  placeholder="Nome"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800">CPF</p>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm mt-1"
                  value={contato.cpf}
                  onChange={(e) => {
                    const formattedCpf = formatCpf(e.target.value);
                    atualizarContato(contato.id, 'cpf', formattedCpf);
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {contato.cpf && !validateCpf(contato.cpf) && (
                  <p className="text-xs text-red-500 mt-1">CPF inválido</p>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">Contato</p>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm mt-1"
                  value={contato.contato}
                  onChange={(e) => atualizarContato(contato.id, 'contato', e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800">E-mail</p>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm mt-1"
                  value={contato.email}
                  onChange={(e) => atualizarContato(contato.id, 'email', e.target.value)}
                  placeholder="email@email.com"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => removerContato(contato.id)}
                className="flex items-center justify-center p-2 rounded-md border border-gray-300 text-red-600 hover:text-red-700 hover:bg-gray-100"
                type="button"
              >
                <Trash size={16} /> Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
