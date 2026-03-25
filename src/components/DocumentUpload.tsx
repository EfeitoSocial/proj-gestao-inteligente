import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  documento: {
    id: number;
    tipo: string;
    descricao: string;
    arquivo_url?: string;
  };
  onUpdate: (id: number, field: string, value: string) => void;
  onRemove: (id: number) => void;
  canRemove?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documento,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documentos/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      // Update document with file URL
      onUpdate(documento.id, 'arquivo_url', data.publicUrl);
      setFileName(file.name);

      toast({
        title: 'Sucesso',
        description: 'Documento anexado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao anexar documento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (documento.arquivo_url) {
      try {
        // Extract file path from URL
        const url = new URL(documento.arquivo_url);
        const filePath = url.pathname.split('/').pop();

        if (filePath) {
          await supabase.storage
            .from('project-documents')
            .remove([`documentos/${filePath}`]);
        }
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
      }
    }

    onUpdate(documento.id, 'arquivo_url', '');
    setFileName('');
  };

  return (
    <tr className="border-t">
      <td className="px-4 py-2">
        <select
          value={documento.tipo}
          onChange={(e) => onUpdate(documento.id, 'tipo', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Selecione o tipo</option>
          <option value="Contrato">Contrato</option>
          <option value="Proposta">Proposta</option>
          <option value="Relatório">Relatório</option>
          <option value="Comprovante">Comprovante</option>
          <option value="Certidão">Certidão</option>
          <option value="Outros">Outros</option>
        </select>
      </td>
      <td className="px-4 py-2">
        <Input
          value={documento.descricao}
          onChange={(e) => onUpdate(documento.id, 'descricao', e.target.value)}
          placeholder="Descrição do documento"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          {documento.arquivo_url ? (
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-green-600" />
              <span className="text-sm text-green-600">
                {fileName || 'Arquivo anexado'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                id={`file-upload-${documento.id}`}
                disabled={uploading}
              />
              <label htmlFor={`file-upload-${documento.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-blue-600 cursor-pointer"
                  disabled={uploading}
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
        </div>
      </td>
      <td className="px-4 py-2">
        <Button
          onClick={documento.arquivo_url ? handleRemoveFile : () => onRemove(documento.id)}
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </td>
    </tr>
  );
};
