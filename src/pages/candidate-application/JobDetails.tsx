export interface JobDetailsData {
  title: string
  company: string
  location: string
  locationType: string
  salary: string
  deadline: string
  logoText: string
  logoBg: string
  about: string[]
  requirements: string[]
  nextSteps: string[]
}

interface JobDetailsProps {
  job: JobDetailsData
}

const JobDetails = ({ job }: JobDetailsProps) => {
  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4 lg:max-w-[548px]">
      {/* Section 1: Banner and Specs */}
      <div className="bg-white rounded-2xl border-[0.5px] border-[#DDE0E9] overflow-hidden flex flex-col">
        {/* Banner Header */}
        <div className="bg-[#0D2D54] text-white p-4 sm:px-7 sm:py-6 flex items-start gap-3.5 sm:gap-6">
          {/* Company Logo: Circular white badge */}
          <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-200 select-none shadow-sm p-1.5">
            <img
              src="/company-logo.svg"
              alt="company logo placeholder"
              className="w-auto h-auto max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-2 sm:gap-4.5 flex-1">
            <h1 className="text-lg sm:text-2xl font-semibold font-sans leading-tight tracking-[0%]">
              Apply for {job.title}
            </h1>
            <p className="text-[#CECECE] text-xs sm:text-[16px] leading-5 sm:leading-6.75 font-sans font-medium">
              Submit your details and CV. Conflux screens every application automatically. No
              account needed.
            </p>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6.5 gap-x-4 sm:gap-x-8 lg:gap-x-15 p-4 sm:pt-6 sm:pb-8 sm:px-7 bg-white">
          <div className="flex items-start gap-2.5 sm:gap-4">
            <img
              src="/Candidate-icon/company_building.svg"
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 shrink-0"
              alt="company icon"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm sm:text-[16px] font-medium font-sans text-[#000000] leading-[100%] tracking-[0%]">
                Company
              </span>
              <span className="text-xs sm:text-[16px] font-medium font-sans text-[#757575] leading-snug">
                {job.company}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:gap-4">
            <img
              src="/Candidate-icon/location-icon.svg"
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 shrink-0"
              alt="location icon"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm sm:text-[16px] font-medium font-sans text-[#000000] leading-[100%] tracking-[0%]">
                Location
              </span>
              <span className="text-xs sm:text-[16px] font-medium font-sans text-[#757575] leading-snug">
                {job.location}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:gap-4">
            <img
              src="/Candidate-icon/briefcase-black-icon.svg"
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 shrink-0"
              alt="job title icon"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm sm:text-[16px] font-medium font-sans text-[#000000] leading-[100%] tracking-[0%]">
                Job Title
              </span>
              <span className="text-xs sm:text-[16px] font-medium font-sans text-[#757575] leading-snug">
                {job.title}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:gap-4">
            <img
              src="/Candidate-icon/calendar-icon.svg"
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 shrink-0"
              alt="deadline icon"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm sm:text-[16px] font-medium font-sans text-[#000000] leading-[100%] tracking-[0%]">
                Deadline
              </span>
              <span className="text-xs sm:text-[16px] font-medium font-sans text-[#757575] leading-snug">
                {job.deadline}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:gap-4 col-span-2">
            <img
              src="/Candidate-icon/salary-icon.svg"
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 shrink-0"
              alt="salary icon"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm sm:text-[16px] font-medium font-sans text-[#000000] leading-[100%] tracking-[0%]">
                Salary
              </span>
              <span className="text-xs sm:text-[16px] font-medium font-sans text-[#757575] leading-snug">
                {job.salary}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: About this role */}
      <div className="bg-white rounded-2xl border-[0.5px] border-[#DDE0E9] p-4 sm:py-6 sm:px-6 flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full bg-[#E7EAEE] flex items-center justify-center shrink-0">
          <img
            src="/Candidate-icon/laptop-icon.svg"
            className="w-5 h-5 sm:w-6 sm:h-6"
            alt="about role icon"
          />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          <h3 className="font-semibold text-[#000000] text-base sm:text-[20px] font-sans leading-[100%] tracking-[0%]">
            About this role
          </h3>

          <div className="flex flex-col gap-3 sm:gap-4">
            <p className="text-[#767676] font-normal leading-relaxed font-inter text-sm sm:text-[16px]">
              {job.about.slice(0, 2).join(' ')}
            </p>
            <ul className="list-disc pl-4.5 text-[#767676] font-normal space-y-1.5 sm:space-y-2 leading-relaxed font-inter text-xs sm:text-[1rem]">
              {job.about.slice(2).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Requirements */}
      <div className="bg-white rounded-2xl border-[0.5px] border-[#DDE0E9] p-4 sm:py-6 sm:px-6 flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full bg-[#E7EAEE] flex items-center justify-center shrink-0">
          <img
            src="/Candidate-icon/clipboard-icon.svg"
            className="w-5 h-5 sm:w-6 sm:h-6"
            alt="requirements icon"
          />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          <h3 className="font-semibold text-[#000000] text-base sm:text-[20px] font-sans leading-[100%] tracking-[0%]">
            Requirements
          </h3>

          <ul className="list-disc pl-4.5 text-[#767676] font-normal space-y-1.5 sm:space-y-2 leading-relaxed font-inter text-xs sm:text-[1rem]">
            {job.requirements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 4: What happens next */}
      <div className="bg-white rounded-2xl border-[0.5px] border-[#DDE0E9] p-4 sm:py-6 sm:px-6 flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full bg-[#E7EAEE] flex items-center justify-center shrink-0">
          <img
            src="/Candidate-icon/suit-case-brown-icon.svg"
            className="w-5 h-5 sm:w-6 sm:h-6"
            alt="next steps icon"
          />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          <h3 className="font-semibold text-[#000000] text-base sm:text-[20px] font-sans leading-[100%] tracking-[0%]">
            What happens next
          </h3>

          <ol className="list-decimal pl-4.5 text-[#767676] font-normal space-y-1.5 sm:space-y-2 leading-relaxed font-inter text-xs sm:text-[1rem]">
            {job.nextSteps.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
export default JobDetails
