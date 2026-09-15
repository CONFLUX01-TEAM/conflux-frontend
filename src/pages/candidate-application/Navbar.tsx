import { useState } from 'react'

const navLinks = [
  { name: 'Home', href: 'https://hiring-ai-lp.vercel.app' },
  { name: 'How it works', href: 'https://hiring-ai-lp.vercel.app/#how-it-works' },
  // { name: "Features", href: "https://hiring-ai-lp.vercel.app/#features" },
  // { name: "Pricing", href: "https://hiring-ai-lp.vercel.app/#pricing" },
  // { name: "Testimonials", href: "https://hiring-ai-lp.vercel.app/#testimonials" },
]

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('Home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="relative">
      <div className="navbar-border flex justify-between lg:justify-between items-center lg:gap-8 xl:gap-[4.5rem] 2xl:gap-[6.25rem] px-6 lg:px-[2rem] xl:px-[2.5rem] 2xl:px-[3.94em] py-4 lg:py-[1.2rem] xl:py-[1.4rem] 2xl:py-[1.63em] rounded-[1.25rem] border-[0.03rem] border-[#DFDFDF] bg-white/50 backdrop-blur-md shadow-lg shadow-black/[0.03]">
        <div className="shrink-0">
          <a href="/">
            <img src="/company-logo.svg" alt="conflux" className="h-8 w-auto" />
          </a>
        </div>
        <div className="hidden lg:block shrink-0">
          <ul className="flex justify-center items-center gap-6 xl:gap-7 2xl:gap-[2.19rem]">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={() => setActiveLink(link.name)}
                  className={`text-[1rem] xl:text-[1.15rem] 2xl:text-[1.25rem] transition-colors duration-200 text-black whitespace-nowrap ${
                    activeLink === link.name ? 'font-semibold' : 'font-light'
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* <Button label="Book Demo" className="hidden lg:block !w-fit bg-[#062DF6] text-white rounded-[1.25rem] px-[1.5em] xl:px-[1.7em] 2xl:px-[1.88em] text-[1rem] xl:text-[1.15rem] 2xl:text-[1.25rem] py-[0.7em] xl:py-[0.8em] 2xl:py-[0.94em] font-semibold whitespace-nowrap shrink-0" onClick={() => alert("book demo")} /> */}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-black focus:outline-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <img src="/menu.svg" alt="menu" className="size-[1.5rem]" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[110%] left-0 right-0 bg-white border border-[#DFDFDF] rounded-[1.25rem] p-6 shadow-lg lg:hidden z-50 flex flex-col gap-6">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={() => {
                    setActiveLink(link.name)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`text-[1.25rem] transition-colors duration-200 text-black block py-2 ${
                    activeLink === link.name ? 'font-semibold' : 'font-light'
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          {/* <Button
            label="Book Demo"
            className="w-full bg-[#062DF6] text-white rounded-[1.25rem] px-[1.88em] text-[1.25rem] py-[0.94em] font-semibold text-center"
            onClick={() => {
              alert("book demo")
              setIsMobileMenuOpen(false)
            }}
          /> */}
        </div>
      )}
    </div>
  )
}

export default Navbar
