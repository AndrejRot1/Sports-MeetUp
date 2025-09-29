
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { EventProvider } from '@/contexts/EventContext';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <EventProvider>
          <Outlet />
        </EventProvider>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
