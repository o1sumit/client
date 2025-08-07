// React import removed - not needed with new JSX transform
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
};

export default AdminLayout;
