import { Outlet } from 'react-router-dom'
import Footer from '@/shared/layout/Footer'
import Navbar from '@/shared/layout/Navbar'

const MainLayout = () => {
  return (
    <div className="min-h-screen min-h-dvh bg-white text-black flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow container mx-auto w-full min-w-0 px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
