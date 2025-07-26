import React from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, User, Users, LogOut, Tag, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import logo from "../../app/logo.png"

// Define the navigation link interface
interface NavLink {
  title: string;
  url: string;
  icon: React.ElementType;
  comingSoon?: boolean;
}

const SidebarNav = () => {
  const router = useRouter();
  const items: NavLink[] = [
    { title: 'Products', url: '/', icon: Package },
    { title: 'Orders', url: '/orders', icon: ShoppingBag },
    { title: 'Profile', url: '/profile', icon: User },
    { title: 'Customers', url: '/customers', icon: Users },
    { title: 'Offers', url: '/offers', icon: Tag, comingSoon: true },
    { title: 'Banner', url: '/banner', icon: Image },
    { title: 'Hero', url: '/hero', icon: Monitor, comingSoon: true },
  ];

  const handleSignout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem('admin_session', 'false');
    router.push('/login');
  };

  return (
    <Sidebar>
      {/* Header with Logo */}
      <SidebarHeader className="p-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Logo</h2>
        <Image src={logo} width={100} height={100} alt='logo' />
      </SidebarHeader>

      {/* Content with Navigation Links */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-800">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    {item.comingSoon ? (
                      <div className="flex items-center justify-between text-slate-400 cursor-not-allowed px-4 py-2">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 mr-3" />
                          <span>{item.title}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      </div>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link href={item.url} className="flex items-center text-slate-800 hover:bg-slate-100 rounded px-4 py-2">
                          <Icon className="w-5 h-5 mr-3" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Signout Button */}
      <SidebarFooter className="p-4 border-t border-slate-200">
        <button
          onClick={handleSignout}
          className="flex items-center text-slate-800 hover:bg-slate-100 rounded px-4 py-2 w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Signout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
