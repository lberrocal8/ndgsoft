'use client'
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button"
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Input } from "@nextui-org/input";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { version } from "@/package.json";

const Login = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const jsonData = await response.json();
      
      if(jsonData) {
        sessionStorage.setItem('token', jsonData.token);
        router.push('/dashboard');
      } else {
        alert('Credenciales invalidas');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col pt-8 pb-6 px-10 text-center">
          <h1 className="w-full text-primary-600 font-bold text-3xl">Iniciar sesión</h1>
          <p className="w-full text-xs">Ingresa en el sistema Cursor</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 justify-center text-center align-middle px-6">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} isRequired variant="bordered" type="text" label="Usuario" className="w-full" />
              <Input value={password} onChange={(e) => setPassword(e.target.value)} isRequired className="w-full" label="Clave" variant="bordered" type={isVisible ? "text" : "password"} endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                  {isVisible ? (
                    <EyeSlashFilledIcon className="align-middle text-3xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="align-middle text-3xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }/>
            </div>
            <div className="flex flex-col justify-center text-center px-6 py-8">
              <Button type="submit" color="primary" className="w-full">
                {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
              </Button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}

export default function IndexPage() {
  return (
    <>
      <section className="flex h-screen justify-center items-center">
        <Login />
      </section>
      <footer className="fixed bottom-0 left-0 w-full p-4 text-center text-sm text-gray-600">
        <p>Version v{version} | Todos los derechos reservados</p>
      </footer>
    </>
  );
}
