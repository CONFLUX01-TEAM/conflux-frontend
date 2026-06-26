import { useState } from 'react'
import { Outlet } from 'react-router-dom'

const testimonials = [
  {
    quote:
      'I love how conflux has greatly reduced the mental load of hiring staff, now i look foward to interviews because the best candidates are infront of me',
    author: 'Sefa, HR Manager',
    company: 'Dynolabs',
  },
  {
    quote: 'Conflux completely transformed our hiring pipeline. We close roles 50% faster now.',
    author: 'Jane Doe, Talent Acquisition',
    company: 'TechNova',
  },
  {
    quote: "The easiest platform we've ever used. Highly recommend it to any growing team.",
    author: 'Mark Smith, CEO',
    company: 'BuildCorp',
  },
  {
    quote: 'Finding the right talent used to be a guessing game. Conflux makes it a science.',
    author: 'Sarah Lee, Head of People',
    company: 'NextGen',
  },
  {
    quote: 'Our hiring managers are thrilled. The quality of candidates is unmatched.',
    author: 'David Kim, Recruiter',
    company: 'AlphaTech',
  },
]

const OnboardingLayout = () => {
  const [step, setStep] = useState(1)
  const testimonial = testimonials[step - 1] || testimonials[0]

  return (
    <div className="w-full min-h-screen bg-[#0D2D54] flex gap-[3.19rem] lg:p-6 font-sans">
      <div className="hidden lg:block text-white ml-[2.94rem] w-[40%]">
        <div>
          <img
            src="/company-logo-white.svg"
            alt="Conflux"
            className="w-[6.44rem] h-[1.81rem] mt-[3rem] mb-[5rem]"
          />
          <h2 className="text-[#00F0FF] text-[0.88rem] font-medium">GET STARTED</h2>
          <h1 className="text-[2.25rem] font-medium">Welcome</h1>
          <p className="text-[#E6E6E6] text-[1.25rem]">
            Explore our intuitive dashboard and set up your account in just a few clicks
          </p>
        </div>

        <div className="pointer-events-none mx-auto">
          <img
            src="/onboard-company-logo.svg"
            alt=""
            className="w-[20.81rem] h-[22.19rem] my-12 object-contain mx-auto"
          />
        </div>

        <div>
          <p className="text-[1.13rem] italic text-[#E6E6E6] mb-[1.69rem] leading-relaxed font-light opacity-72 transition-all duration-300">
            "{testimonial.quote}"
          </p>
          <p className="text-[1.25rem] font-medium text-white transition-all duration-300">
            {testimonial.author} <span className="font-light italic">{testimonial.company}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 w-full bg-white lg:rounded-[0.94rem] shadow-xl">
        <Outlet context={{ step, setStep }} />
      </div>
    </div>
  )
}

export default OnboardingLayout
