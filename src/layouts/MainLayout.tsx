import { type ReactNode } from 'react'

interface MainLayoutProps { children : ReactNode
}

const MainLayout = ({children}: MainLayoutProps) => {

  return (
    <div>
        <main>
            {children}
        </main>
    </div>
  )
}

export default MainLayout;