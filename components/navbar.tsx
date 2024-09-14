import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";

import { LogoutIcon, HamburguerMenuIcon } from "@/components/icons";

export const Navbar = () => {
  const router = useRouter();
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("ProductosBD");
    localStorage.removeItem("mesas");
    router.push("/");
  };

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent justify="end">
        <NavbarItem>
          <div className="flex flex-row gap-2 align-middle">
            {/*<Button isIconOnly variant="light" size="sm">
              <ThemeSwitch />
            </Button>*/}
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <HamburguerMenuIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Config options">
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  startContent={<LogoutIcon className={iconClasses} />}
                  onPress={handleLogout}
                >
                  Cerrar sesión
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
