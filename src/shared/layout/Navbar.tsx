import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="bg-[#0D2D54] text-white px-4 py-3 sm:px-6 sm:py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center gap-4 min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-[#00F0FF] shrink-0">Conflux</h1>
        <nav className="min-w-0">
          <ul className="flex gap-3 sm:gap-4 text-sm sm:text-base">
            <li>
              <Link to="/" className="hover:text-[#00F0FF] transition-colors">
                Home
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
