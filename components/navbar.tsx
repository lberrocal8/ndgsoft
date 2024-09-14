import { Navbar as NextUINavbar, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem} from "@nextui-org/dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { useRouter } from 'next/navigation';
import { LogoutIcon, HamburguerMenuIcon } from "@/components/icons";
import { Button } from "@nextui-org/button";

export const Navbar = () => {
  const router = useRouter();
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('ProductosBD');
    localStorage.removeItem('mesas');
    router.push('/');
  }

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
                <Button isIconOnly variant="light" size="sm">
                  <HamburguerMenuIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Config options">
                <DropdownItem startContent={<LogoutIcon className={iconClasses} />} key='logout' className="text-danger" color="danger" onPress={handleLogout}>Cerrar sesión</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
