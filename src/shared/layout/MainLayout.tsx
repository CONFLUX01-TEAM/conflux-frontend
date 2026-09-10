import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/shared/layout/Sidebar'
import Header from '@/shared/layout/Header'

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024
    }
    return false
  })

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans text-black relative">
      {/* Mobile Backdrop Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setCollapsed(true)}
      />

      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Header
          isSidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 bg-[#FAFAFA]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
