import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../recoil/authAtom';

const AdminRoute = () => {
  const auth = useRecoilValue(authAtom);

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (auth.userType !== 'A') {
    return <Navigate to="/vehicles" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
