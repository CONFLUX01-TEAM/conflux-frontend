import React, { useState, useRef } from 'react';
import Button from '../../components/Button';
import { useCountdown } from '../../utils/useCountdown';
import { validateOTP } from '../../utils/validation';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { secondsLeft, isActive, resetCountdown } = useCountdown(60);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (error) setError('');

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    const otpError = validateOTP(otpValue);
    if (otpError) {
      setError(otpError);
      return;
    }
    
    console.log("OTP submitted:", otpValue);
    // Add logic to verify OTP here
  }

  return (
    <div className='w-full max-w-[1600px] mx-auto min-w-0'>
      <div className='w-full flex flex-col xl:grid xl:grid-cols-2 gap-6 xl:gap-8 2xl:gap-12 min-w-0 xl:items-stretch'>
        
        {/* Hero image — same height as form, scales without cropping */}
        <div className='hidden xl:block h-full min-h-0 xl:min-h-[58.25rem]'>
          <div className='h-full w-full max-w-[44.75rem] xl:min-h-[58.25rem] rounded-xl overflow-hidden bg-[#0D2D54]'>
            <img 
              src="/auth-img.svg" 
              alt='Conflux hiring illustration' 
              className='h-full w-full object-contain' 
            />
          </div>
        </div>

        {/* Form */}
        <div className='flex flex-col w-full max-w-[42rem] mx-auto xl:mx-0 xl:max-w-none 2xl:max-w-[42rem] h-full xl:min-h-[58.25rem] rounded-[0.94rem] py-6 sm:py-8 px-4 sm:px-8 lg:px-12 xl:px-10 2xl:px-[107px] border-[0.06rem] border-[#E6E6E6] justify-center'>
          
          <div className="flex flex-col items-center text-center w-full min-w-0">
          <h1 className='font-sans text-2xl sm:text-[2.5rem] md:text-[3rem] text-[#222222] font-medium leading-tight'>Email Verification</h1>
          <p className='font-inter text-base sm:text-lg md:text-[1.125rem] text-[#9D9D9D] mt-2 mb-8 sm:mb-[3.5rem] px-2 break-words'>
            A verification code had been sent to derader:****34@gmail.com
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center min-w-0">
            {error && <p className="text-[#EF4444] text-[0.88rem] mb-4 font-inter">{error}</p>}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 md:gap-4 w-full max-w-[26.63rem] mx-auto mb-8 sm:mb-12 px-1">
              {otp.map((digit, index) => (
                <div key={index} className="relative aspect-square w-full min-w-0">
                  <input
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="absolute inset-0 w-full h-full border-[0.06rem] border-[#E6E6E6] rounded-[0.5rem] text-center text-lg sm:text-xl md:text-[2rem] font-medium text-[#222222] focus:border-[#0D2D54] focus:outline-none focus:ring-1 focus:ring-[#0D2D54] transition-colors bg-transparent z-10"
                  />
                  {!digit && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#E6E6E6] text-lg sm:text-xl md:text-[2rem]">
                      _
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              label="Verify Email"
              className="bg-[#0D2D54] text-white rounded-[0.5rem] py-[0.91em] w-full max-w-[26.63rem] font-inter text-base font-medium"
            />

            <div className='mt-[2.5rem] text-center font-inter text-[0.88rem]'>
              {isActive ? (
                <p className='text-[#9D9D9D]'>
                  Resend a new otp in <span className='text-black font-medium'>{secondsLeft} seconds</span>
                </p>
              ) : (
                <button 
                  type="button" 
                  onClick={resetCountdown}
                  className='text-[#0D2D54] font-medium hover:underline focus:outline-none'
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
