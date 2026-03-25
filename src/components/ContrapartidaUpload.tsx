// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Upload, Trash2, ImageIcon } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';
// import { toast } from '@/hooks/use-toast';

// interface Contrapartida {
//   id: number;
//   quantidade: string;
//   descricao: string;
//   data: string;
//   evidencia?: string;
// }

// interface ContrapartidaUploadProps {
//   contrapartida: {
//     id: number;
//     quantidade: string;
//     descricao: string;
//     data: string;
//     evidencia: string;
//   };
//   onUpdate: (id: number, field: string, value: string) => void;
//   onRemove: (id: number) => void;
//   canRemove: boolean;
// }

// export const ContrapartidaUpload: React.FC<ContrapartidaUploadProps> = ({
//   contrapartida,
//   onUpdate,
//   onRemove,
//   canRemove,
// }) => {
//   const [uploading, setUploading] = useState(false);
//   const [fileName, setFileName] = useState<string>('');

//   const handleFileUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     try {
//       const ext = file.name.split('.').pop();
//       const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
//       const path = `contrapartidas/${uniqueName}`;

//       const { error: uploadError } = await supabase.storage
//         .from('project-documents')
//         .upload(path, file);

//       if (uploadError) throw uploadError;

//       const { data } = supabase.storage
//         .from('project-documents')
//         .getPublicUrl(path);

//       onUpdate(contrapartida.id, 'evidencia', data.publicUrl || '');
//       setFileName(file.name);

//       toast({
//         title: 'Sucesso!',
//         description: 'Evidência enviada com sucesso.',
//       });
//     } catch (error) {
//       console.error('Erro ao fazer upload da evidência:', error);
//       toast({
//         title: 'Erro',
//         description: 'Falha ao enviar evidência. Tente novamente.',
//         variant: 'destructive',
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   // const handleRemoveEvidencia = async () => {
//   //   if (!contrapartida.evidencia) return;

//   //   try {
//   //     const url = new URL(contrapartida.evidencia);
//   //     const filePath = decodeURIComponent(url.pathname.split('/').slice(-1)[0]);

//   //     await supabase.storage
//   //       .from('project-documents')
//   //       .remove([`contrapartidas/${filePath}`]);

//   //     onUpdate(contrapartida.id, 'evidencia', '');
//   //     setFileName('');
//   //   } catch (error) {
//   //     console.error('Erro ao remover evidência:', error);
//   //   }
//   // };
//   const handleRemoveEvidencia = async () => {
//   if (!contrapartida.evidencia || !contrapartida.evidencia.startsWith('http')) {
//     return;
//   }

//   try {
//     const url = new URL(contrapartida.evidencia);
//     const fileName = url.pathname.split('/').pop(); // extrai o nome do arquivo
//     const filePath = `contrapartidas/${fileName}`;

//     await supabase.storage
//       .from('project-documents')
//       .remove([filePath]);

//     onUpdate(contrapartida.id, 'evidencia', '');
//     setFileName('');
//   } catch (error) {
//     console.error('Erro ao remover evidência:', error);
//     toast({
//       title: 'Erro',
//       description: 'Não foi possível remover a evidência.',
//       variant: 'destructive',
//     });
//   }
// };

//   return (
//     <tr className="border-t">
//       <td className="px-4 py-2">
//         <Input
//           value={contrapartida.quantidade}
//           onChange={(e) => onUpdate(contrapartida.id, 'quantidade', e.target.value)}
//           placeholder="Qtd"
//         />
//       </td>
//       <td className="px-4 py-2">
//         <Input
//           value={contrapartida.descricao}
//           onChange={(e) => onUpdate(contrapartida.id, 'descricao', e.target.value)}
//           placeholder="Descrição"
//         />
//       </td>
//       <td className="px-4 py-2">
//         <Input
//           // value={contrapartida.data}
//           // onChange={(e) => onUpdate(contrapartida.id, 'data', e.target.value)}
//           // placeholder="DD/MM/AAAA"
//           type="date"
//           value={contrapartida.data}
//           onChange={(e) => onUpdate(contrapartida.id, 'data', e.target.value)}
//         />
//       </td>
//       <td className="px-4 py-2">
//         {contrapartida.evidencia ? (
//           <div className="flex items-center gap-2 text-green-700 text-sm">
//             <ImageIcon size={16} />
//             <a
//               href={contrapartida.evidencia}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="underline"
//             >
//               Visualizar
//             </a>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleRemoveEvidencia}
//               className="text-red-600 hover:text-red-700"
//             >
//               <Trash2 size={16} />
//             </Button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2">
//             <input
//               type="file"
//               onChange={handleFileUpload}
//               accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
//               className="hidden"
//               id={`contrapartida-file-${contrapartida.id}`}
//               disabled={uploading}
//             />
//             <label htmlFor={`contrapartida-file-${contrapartida.id}`}>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 disabled={uploading}
//                 className="text-blue-600 hover:text-blue-800"
//                 asChild
//               >
//                 <span>
//                   <Upload size={16} />
//                   {uploading ? 'Enviando...' : 'Anexar'}
//                 </span>
//               </Button>
//             </label>
//           </div>
//         )}
//       </td>
//       <td className="px-4 py-2">
//         {canRemove && (
//           <Button
//             onClick={() => onRemove(contrapartida.id)}
//             variant="outline"
//             size="sm"
//             className="text-red-600 hover:text-red-700"
//           >
//             <Trash2 size={16} />
//           </Button>
//         )}
//       </td>
//     </tr>
//   );
// };

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Trash2, ImageIcon } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Contrapartida {
  id: number
  quantidade: string
  descricao: string
  data: string
  evidencia?: string
}

interface ContrapartidaUploadProps {
  contrapartida: Contrapartida
  onUpdate: (id: number, field: string, value: string) => void
  onRemove: (id: number) => void
  canRemove: boolean
}

// Função para verificar se a evidência é uma URL válida
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const ContrapartidaUpload: React.FC<ContrapartidaUploadProps> = ({
  contrapartida,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `contrapartidas/${uniqueName}`

      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('project-documents').getPublicUrl(path)

      onUpdate(contrapartida.id, 'evidencia', data.publicUrl || '')
      setFileName(file.name)

      toast({
        title: 'Sucesso!',
        description: 'Evidência enviada com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao fazer upload da evidência:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao enviar evidência. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveEvidencia = async () => {
    if (!contrapartida.evidencia || !isValidUrl(contrapartida.evidencia)) return

    try {
      const url = new URL(contrapartida.evidencia)
      const fileName = decodeURIComponent(url.pathname.split('/').pop() || '')
      const filePath = `contrapartidas/${fileName}`

      await supabase.storage.from('project-documents').remove([filePath])

      onUpdate(contrapartida.id, 'evidencia', '')
      setFileName('')
    } catch (error) {
      console.error('Erro ao remover evidência:', error)
    }
  }

  return (
    <tr className="border-t">
      <td className="px-4 py-2">
        <Input
          value={contrapartida.quantidade}
          onChange={(e) => onUpdate(contrapartida.id, 'quantidade', e.target.value)}
          placeholder="Qtd"
        />
      </td>
      <td className="px-4 py-2">
        <Input
          value={contrapartida.descricao}
          onChange={(e) => onUpdate(contrapartida.id, 'descricao', e.target.value)}
          placeholder="Descrição"
        />
      </td>
      <td className="px-4 py-2">
        <Input
          type="date"
          value={contrapartida.data}
          onChange={(e) => onUpdate(contrapartida.id, 'data', e.target.value)}
        />
      </td>
      <td className="px-4 py-2">
        {contrapartida.evidencia && isValidUrl(contrapartida.evidencia) ? (
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <ImageIcon size={16} />
            <a
              href={contrapartida.evidencia}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Visualizar
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              className="hidden"
              id={`contrapartida-file-${contrapartida.id}`}
              disabled={uploading}
            />
            <label htmlFor={`contrapartida-file-${contrapartida.id}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                className="text-blue-600 hover:text-blue-800"
                asChild
              >
                <span>
                  <Upload size={16} />
                  {uploading ? 'Enviando...' : 'Anexar'}
                </span>
              </Button>
            </label>
          </div>
        )}
      </td>
      <td className="px-4 py-2">
        {canRemove && (
          <Button
            onClick={() => onRemove(contrapartida.id)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </td>
    </tr>
  )
}
