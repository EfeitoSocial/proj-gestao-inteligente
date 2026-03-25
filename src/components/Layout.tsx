import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl animate-float" />
        <div
          className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <header className="w-full p-6 flex items-center gap-3 relative z-10 max-w-7xl mx-auto">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-elevation shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">EnterpriseSync</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-7xl mx-auto pb-12">
        <Outlet />
      </div>
    </main>
  )
}
