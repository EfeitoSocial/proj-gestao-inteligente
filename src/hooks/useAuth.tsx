import {
  useState,
  useEffect,
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    nomeFantasia: string,
    razaoSocial: string,
    cnpj: string,
  ) => Promise<{ error: any }>;
  signIn: (loginField: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    nomeFantasia: string,
    razaoSocial: string,
    cnpj: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_fantasia: nomeFantasia,
          razao_social: razaoSocial,
          cnpj: cnpj,
        },
      },
    });
    return { error };
  };

  const signIn = async (loginField: string, password: string) => {
    // Se o campo de login contém @, assumir que é um e-mail
    if (loginField.includes('@')) {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginField,
        password,
      });
      return { error };
    }

    // Se não contém @, buscar o e-mail através do CNPJ ou Nome Fantasia na tabela profiles
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .or(`cnpj.eq.${loginField},nome_fantasia.ilike.${loginField}`)
        .single();

      if (profileError || !profile) {
        return {
          error: { message: 'Empresa não encontrada ou dados incorretos' },
        };
      }

      // Buscar o usuário na tabela auth.users usando o ID do perfil
      // Como não podemos acessar auth.users diretamente, vamos tentar uma abordagem diferente
      // Vamos buscar todos os perfis que correspondem e tentar fazer login com cada um
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .or(`cnpj.eq.${loginField},nome_fantasia.ilike.${loginField}`);

      if (profilesError || !profiles || profiles.length === 0) {
        return { error: { message: 'Empresa não encontrada' } };
      }

      // Como não podemos acessar o email diretamente, retornamos um erro mais específico
      return {
        error: {
          message:
            'Para login com CNPJ ou Nome Fantasia, use seu e-mail cadastrado',
        },
      };
    } catch (e) {
      return { error: { message: 'Erro ao processar login' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
