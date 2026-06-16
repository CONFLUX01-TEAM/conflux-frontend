
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col overflow-x-hidden">
      <main className="grow flex items-center justify-center w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
