import React, { useState } from 'react';
import { Camera, Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ProjectPhoto {
  id: string;
  foto_url: string;
  descricao?: string;
  ordem: number;
}

interface ProjectPhotoUploadProps {
  photos: ProjectPhoto[];
  onPhotosChange: (photos: ProjectPhoto[]) => void;
  maxPhotos?: number;
}

export const ProjectPhotoUpload: React.FC<ProjectPhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file: File, ordem: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${ordem}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-photos')
        .getPublicUrl(fileName);

      return {
        id: Date.now().toString() + ordem,
        foto_url: publicUrl,
        ordem,
      };
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, ordem: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    const newPhoto = await uploadPhoto(file, ordem);
    if (newPhoto) {
      const updatedPhotos = [...photos];
      const existingIndex = updatedPhotos.findIndex(p => p.ordem === ordem);

      if (existingIndex >= 0) {
        updatedPhotos[existingIndex] = newPhoto;
      } else {
        updatedPhotos.push(newPhoto);
      }

      // onPhotosChange(updatedPhotos.sort((a, b) => a.ordem - b.ordem));
      onPhotosChange([...updatedPhotos].sort((a, b) => a.ordem - b.ordem));


      toast({
        title: "Sucesso",
        description: "Foto enviada com sucesso!",
      });
    }
  };

  const removePhoto = (ordem: number) => {
    const updatedPhotos = photos.filter(p => p.ordem !== ordem);
    onPhotosChange(updatedPhotos);

    toast({
      title: "Sucesso",
      description: "Foto removida com sucesso!",
    });
  };

  const getPhotoByOrder = (ordem: number) => {
    return photos.find(p => p.ordem === ordem);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
          disabled={uploading}
        >
          <Camera size={16} />
          Fotos do Projeto
        </Button>
        <span className="text-sm text-gray-500">
          {photos.length}/{maxPhotos} fotos
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Array.from({ length: maxPhotos }, (_, index) => {
          const ordem = index + 1;
          const photo = getPhotoByOrder(ordem);

          return (
            <div
              key={ordem}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {photo ? (
                <>
                  <img
                    src={photo.foto_url}
                    alt={`Foto ${ordem}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(ordem)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, ordem)}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                      <span className="text-xs text-gray-500 mt-1">Enviando...</span>
                    </div>
                  ) : (
                    <>
                      <Camera size={24} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 text-center px-1">
                        Clique para adicionar
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB por imagem.
      </p>
    </div>
  );
};