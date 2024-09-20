import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/dropdown";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/navbar";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Link } from "@nextui-org/link";

import { LogoutIcon, UserCircleIcon, UserIcon } from "@/components/icons";

export const Navbar = () => {
  const [nombre, setNombre] = useState<String>();
  const [usuario, setUsuario] = useState<String>();
  const [tipoUsuario, setTipoUsuario] = useState<String>();
  const router = useRouter();
  const pathname = usePathname();
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  useEffect(() => {
    setNombre(localStorage.getItem("activeName") || "");
    setUsuario(localStorage.getItem("activeUser") || "");
    setTipoUsuario(localStorage.getItem("activeType") || "");
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("mesas");
    localStorage.removeItem("activeUser");
    localStorage.removeItem("activeName");
    localStorage.removeItem("activeType");
    localStorage.removeItem("ultimaComanda");
    router.push("/");
  };

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent justify="start">
        <NavbarItem>
          <Link
            key="mesas"
            className={`text-foreground pr-2 ${pathname === "/dashboard" ? "text-primary" : ""}`}
            href="/dashboard"
          >
            Mesas
          </Link>
          <Link
            key="comandas"
            className={`text-foreground pl-2 ${pathname === "/comandas" ? "text-primary" : ""}`}
            href="/comandas"
          >
            Comandas
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <div className="flex flex-row gap-2 align-middle">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly color="primary" variant="light">
                  <UserCircleIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Config options"
                disabledKeys={["userInfo"]}
              >
                <DropdownSection>
                  <DropdownItem
                    key="userInfo"
                    startContent={<UserIcon className={iconClasses} />}
                  >
                    <div className="flex flex-row gap-2">
                      <div className="flex flex-col gap-0">
                        <p className="text-xs font-medium">{nombre}</p>
                        <p className="text-xs font-light">{tipoUsuario}</p>
                      </div>
                    </div>
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection>
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    startContent={<LogoutIcon className={iconClasses} />}
                    onPress={handleLogout}
                  >
                    Cerrar sesión
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
