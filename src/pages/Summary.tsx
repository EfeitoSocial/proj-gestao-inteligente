import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, MapPin, Briefcase, FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'

const Summary = () => {
  const navigate = useNavigate()
  const { isAuthenticated, companyData, setAppState } = useAppStore()

  useEffect(() => {
    if (!isAuthenticated || !companyData) {
      navigate('/')
    }
  }, [isAuthenticated, companyData, navigate])

  const handleReset = () => {
    setAppState({ isAuthenticated: false, companyData: null })
    navigate('/')
  }

  if (!isAuthenticated || !companyData) return null

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      <Card className="border-border/50 shadow-elevation backdrop-blur-sm bg-card/95 text-center overflow-hidden">
        <div className="bg-accent/5 py-10 flex flex-col items-center justify-center border-b border-border/50">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-6 animate-slide-up">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight mb-3">
            Cadastro Concluído!
          </CardTitle>
          <CardDescription className="text-lg max-w-md mx-auto px-4">
            Os dados da sua empresa foram registrados com sucesso no nosso sistema.
          </CardDescription>
        </div>

        <CardContent className="p-8 text-left">
          <h3 className="text-lg font-semibold mb-6 flex items-center text-muted-foreground">
            <Building2 className="w-5 h-5 mr-2" />
            Resumo das Informações
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-5 rounded-xl bg-muted/40 border border-border/50 transition-colors hover:bg-muted/60">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Building2 className="w-4 h-4 mr-2" /> Nome da Empresa
              </span>
              <p className="text-lg font-semibold text-foreground">{companyData.name}</p>
            </div>

            <div className="space-y-1.5 p-5 rounded-xl bg-muted/40 border border-border/50 transition-colors hover:bg-muted/60">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Briefcase className="w-4 h-4 mr-2" /> Setor
              </span>
              <p className="text-lg font-semibold text-foreground">{companyData.sector}</p>
            </div>

            <div className="space-y-1.5 p-5 rounded-xl bg-muted/40 border border-border/50 transition-colors hover:bg-muted/60">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Regime Tributário
              </span>
              <p className="text-lg font-semibold text-foreground">{companyData.taxRegime}</p>
            </div>

            <div className="space-y-1.5 p-5 rounded-xl bg-muted/40 border border-border/50 transition-colors hover:bg-muted/60">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> Localidade
              </span>
              <p className="text-lg font-semibold text-foreground">{companyData.location}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/20 p-6 flex justify-center border-t border-border/50">
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="h-12 px-8 hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Início
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Summary
