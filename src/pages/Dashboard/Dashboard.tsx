import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { clearToken, getToken } from '../../utils/auth';

const getUser = () => {
  const token = getToken();
  // Simple mock since this is a temporary dashboard
  return token ? { name: 'User', email: 'user@example.com', avatar: '' } : null;
};
const logout = clearToken;

/**
 * Minimal authenticated landing page. Its main job today is to give the OAuth
 * flow a real signed-in destination — reaching it confirms the token round-trip
 * worked. Replace with the real product dashboard when it exists.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
      {user?.avatar && (
        <img
          src={user.avatar}
          alt=""
          referrerPolicy="no-referrer"
          className="size-16 rounded-full object-cover"
        />
      )}
      <h1 className="font-sans text-2xl sm:text-3xl text-[#222222] font-medium">
        Welcome{user?.name ? `, ${user.name}` : ''} 🎉
      </h1>
      <p className="font-inter text-base text-[#9D9D9D]">
        You're signed in{user?.email ? ` as ${user.email}` : ''}.
      </p>
      <Button
        type="button"
        label="Log out"
        onClick={handleLogout}
        className="mt-2 bg-[#0D2D54] text-white rounded-[0.5rem] py-3 px-8 font-inter text-base font-medium"
      />
    </div>
  );
};

export default Dashboard;
