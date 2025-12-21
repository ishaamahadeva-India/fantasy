
'use client';
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { MainNav } from './main-nav';
import { Header } from './header';
import { BookHeart } from 'lucide-react';


export function AppShell({ children }: { children: ReactNode }) {
  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <BookHeart className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold font-headline text-foreground">
                Ultra-Posh
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="p-4 md:p-8 lg:p-12">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
}
