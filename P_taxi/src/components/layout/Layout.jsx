import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="min-h-screen lg:pl-[310px]">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="px-4 py-5 md:px-6 lg:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;