import { Outlet } from 'react-router-dom'
import Sidebar from '@/shared/layout/Sidebar'
import Header from '@/shared/layout/Header'

const MainLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans text-black">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
