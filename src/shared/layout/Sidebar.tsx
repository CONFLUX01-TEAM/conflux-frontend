import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearToken } from '@/services/auth.service'

type NavItem = {
  label: string
  to: string
  iconSrc: string
}

const NavIcon = ({ src, isActive }: { src: string; isActive: boolean }) => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    className={`size-5 shrink-0 ${isActive ? 'brightness-0 invert' : 'brightness-0'}`}
  />
)

const generalNav: NavItem[] = [
  {
    label: 'Overview',
    to: '/dashboard',
    iconSrc: '/dashboard/overview-icon.svg',
  },
  {
    label: 'Assessment',
    to: '/assessment',
    iconSrc: '/dashboard/accessment-icon.svg',
  },
  {
    label: 'Interviews',
    to: '/interviews',
    iconSrc: '/dashboard/interview-icon.svg',
  },
  {
    label: 'Candidates',
    to: '/candidates',
    iconSrc: '/dashboard/candidate-icon.svg',
  },
  {
    label: 'Jobs',
    to: '/jobs',
    iconSrc: '/dashboard/jobs-icon.svg',
  },
]

const othersNav: NavItem[] = [
  {
    label: 'Settings',
    to: '/settings',
    iconSrc: '/dashboard/settings-icon.svg',
  },
]

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    navigate('/signin', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-4 rounded-l-lg py-2 lg:py-[0.8125rem] text-base font-sans font-medium transition-colors cursor-pointer',
      collapsed ? 'justify-center px-0' : 'px-3 lg:px-[1.3125rem]',
      isActive ? 'bg-[#0D2D54] text-[#FFFFFF]' : 'text-[#000000] hover:bg-gray-50',
    ].join(' ')

  return (
    <aside
      className={[
        'flex h-screen shrink-0 flex-col border-r border-[#CECECE] bg-[#FFFFFF] transition-[width] duration-200',
        collapsed ? 'w-[4.5rem]' : 'w-64',
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center border-b border-[#CECECE] py-4 lg:py-[2.09375rem]',
          collapsed ? 'justify-center px-2' : 'justify-between px-3 lg:px-[1.545rem]',
        ].join(' ')}
      >
        {!collapsed && (
          <Link to="/dashboard">
            <img
              src="/company-logo-blue.svg"
              alt="Conflux"
              className="h-[1.81rem] w-auto cursor-pointer"
            />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="transition-opacity hover:opacity-80"
        >
          <img
            src="/dashboard/collapse-icon.svg"
            alt=""
            className={`w-[2.0625rem] h-[2.0625rem] cursor-pointer ${collapsed ? 'rotate-180' : ''} transition-transform duration-200`}
          />
        </button>
      </div>

      <nav className={`flex flex-1 flex-col justify-between pt-4 lg:pt-6 overflow-y-auto min-h-0 ${collapsed ? 'pl-0' : 'pl-3 lg:pl-5'}`}>
        <div className="flex flex-col gap-3">
          <p
            className={`mb-2 px-3 lg:px-[1.3125rem] font-inter font-medium tracking-[0.05em] text-[#B5B5B5] ${collapsed ? 'text-center text-base normal-case px-0' : 'text-base'
              }`}
          >
            {!collapsed ? 'General' : '•'}
          </p>

          <div className='flex flex-col gap-3 lg:gap-6'>
            {generalNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                title={collapsed ? item.label : undefined}
                className={navLinkClass}
              >
                {({ isActive }) => (
                  <>
                    <NavIcon src={item.iconSrc} isActive={isActive} />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        <div className={`mt-4 border-t border-[#CECECE] mb-3 lg:mb-[0.9375rem] ${collapsed ? 'mx-3 lg:mx-4' : 'ml-3 mr-4 lg:ml-4 lg:mr-9'}`} />

        <div className="flex flex-col gap-3">
          <p
            className={`px-3 lg:px-[1.3125rem] font-medium tracking-[0.05em] text-[#B5B5B5] ${collapsed ? 'text-center text-base ml-0' : 'text-base'
              }`}
          >
            {!collapsed ? 'Others' : '•'}
          </p>

          <div className='flex flex-col gap-3 lg:gap-6'>
            {othersNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={navLinkClass}
              >
                {({ isActive }) => (
                  <>
                    <NavIcon src={item.iconSrc} isActive={isActive} />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? 'Log out' : undefined}
              className={navLinkClass({ isActive: false })}
            >
              <NavIcon src="/dashboard/log-out-icon.svg" isActive={false} />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
