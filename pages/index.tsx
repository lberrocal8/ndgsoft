"use client";
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Input } from "@nextui-org/input";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import notify from "@/utils/notify";
import { siteConfig } from "@/config/site";

const Login = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Error en la autenticación");
      }

      const jsonData = await response.json();

      if (jsonData) {
        localStorage.setItem("activeUser", jsonData.activeUser);
        localStorage.setItem("activeName", jsonData.activeName);
        localStorage.setItem("activeType", jsonData.activeType);
        sessionStorage.setItem("token", jsonData.token);
        router.push("/dashboard");
      } else {
        notify("error", "Credenciales invalidas");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col pt-8 pb-6 px-10 text-center">
          <h1 className="w-full text-primary font-bold text-3xl">
            Iniciar sesión
          </h1>
          <p className="w-full text-xs">Ingresa en el sistema Cursor</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 justify-center text-center align-middle px-6">
              <Input
                isRequired
                className="w-full"
                label="Usuario"
                type="text"
                value={username}
                variant="bordered"
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                isRequired
                className="w-full"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashFilledIcon className="align-middle text-3xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="align-middle text-3xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                label="Clave"
                type={isVisible ? "text" : "password"}
                value={password}
                variant="bordered"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-center text-center px-6 py-8">
              <Button className="w-full" color="primary" type="submit">
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
              {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default function IndexPage() {
  return (
    <>
      <section className="flex h-screen justify-center items-center">
        <Login />
      </section>
      <footer className="fixed bottom-0 left-0 w-full p-4 text-center text-sm text-gray-600">
        <p>Versión v{siteConfig.version} | Todos los derechos reservados</p>
      </footer>
    </>
  );
}
