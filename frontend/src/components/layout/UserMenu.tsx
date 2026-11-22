// Menu desplegable del usuario logueado: avatar, datos, accesos y cerrar sesion.
import { Link } from "react-router";
import { CarIcon, LogOutIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MenuUser {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

export const UserAvatar = ({ user, className }: { user: MenuUser; className?: string }) => (
  <Avatar className={className}>
    {user.image && <AvatarImage src={user.image} alt="" />}
    <AvatarFallback className="bg-brand-100 font-semibold text-brand-700">{initials(user.name)}</AvatarFallback>
  </Avatar>
);

export const UserMenu = ({ user, onLogout }: { user: MenuUser; onLogout: () => void }) => {
  const isAdmin = user.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 rounded-full pr-3 pl-1" aria-label="Menú de usuario">
          <UserAvatar user={user} className="size-8" />
          <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-2 font-normal">
          <UserAvatar user={user} className="size-10" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {isAdmin && (
              <Badge className="mt-1 bg-amber-100 text-amber-900">
                <ShieldCheckIcon /> Administrador
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/mis-publicaciones">
              <CarIcon /> Mis publicaciones
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link to="/admin">
                  <ShieldCheckIcon /> Panel de administración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/users">
                  <UsersIcon /> Usuarios y roles
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} className="text-destructive focus:text-destructive">
          <LogOutIcon /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
