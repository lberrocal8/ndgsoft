export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Cursor app",
  description: "",
  version: "1.0.0",
  navItems: [
    {
      label: "Mesas",
      href: "/dashboard",
    },
    {
      label: "Comandas",
      href: "/comandas",
    },
  ],
};
