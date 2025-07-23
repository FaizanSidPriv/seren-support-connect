import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  Heart, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Users,
  Bell,
  LogOut,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'caregiver';
  avatar_url?: string;
}

interface AppSidebarProps {
  user: User | null;
}

// Navigation items for users
const userNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Routine Planner", url: "/routine-planner", icon: Calendar },
  { title: "Emotion Logger", url: "/emotion-logger", icon: Heart },
  { title: "AAC Board", url: "/communication-tools", icon: MessageCircle },
  { title: "Progress", url: "/progress", icon: BarChart3 },
];

// Navigation items for caregivers
const caregiverNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Users", url: "/users", icon: Users },
  { title: "Communication Patterns", url: "/communication-patterns", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { toast } = useToast();
  const [notificationCount] = useState(3); // Placeholder for real-time notifications

  const currentPath = location.pathname;
  const navItems = user?.role === 'caregiver' ? caregiverNavItems : userNavItems;

  const isActive = (path: string) => currentPath === path;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <Sidebar
      className={`border-r border-sidebar-border bg-sidebar ${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* User Profile Section */}
        <div className={`p-4 border-b border-sidebar-border ${collapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getUserInitials(user?.full_name, user?.email)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        } ${collapsed ? 'justify-center px-2' : ''}`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={`w-full ${collapsed ? 'px-2' : 'justify-start'} relative`}
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
            {!collapsed && <span className="ml-2">Notifications</span>}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={`w-full ${collapsed ? 'px-2' : 'justify-start'}`}
            asChild
          >
            <NavLink to="/settings">
              <Settings className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Settings</span>}
            </NavLink>
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={`w-full ${collapsed ? 'px-2' : 'justify-start'} text-destructive hover:text-destructive`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}