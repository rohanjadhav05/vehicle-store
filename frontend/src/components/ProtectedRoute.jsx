import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../recoil/authAtom';

const ProtectedRoute = () => {
  const auth = useRecoilValue(authAtom);

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
