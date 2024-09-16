'use client'
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@nextui-org/button';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { Tooltip } from "@nextui-org/tooltip";

import { MesaAddIcon } from '@/components/icons';
import { MesaContext } from '@/providers/mesaProvider';
import { MesaContextType } from '@/types';

export default function Mesa() {
  const [numMesa, setNumMesa] = useState(1);
  const {mesaSeleccionada, setMesaSeleccionada} = useContext(MesaContext) as MesaContextType;

  useEffect(() => {
    setTimeout(() => {
      const mesas = JSON.parse(localStorage.getItem('mesas') || '[]');
      if (mesas.length === 0) {
        localStorage.setItem('mesas', JSON.stringify([{ id: 1 }]));
      }
      setNumMesa(mesas.length);
    }, 1000);
  }, []);

  const handleChangeMesaSeleccionada = (key: any) => {
    setMesaSeleccionada(key);
  }

  const handleAddMesa = () => {
    setNumMesa(numMesa + 1);
    const mesas = JSON.parse(localStorage.getItem('mesas') || '[]');
    mesas.push({ id: numMesa + 1 });
    localStorage.setItem('mesas', JSON.stringify(mesas));
  }

  return (
    <>
      <div className='flex gap-4 items-center'>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="ghost" color='primary'>Mesa {mesaSeleccionada}</Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions" onAction={(key) => handleChangeMesaSeleccionada(key)} emptyContent='Sin mesas que mostrar. Agrega una mesa.'>
            {Array.from(Array(numMesa).keys()).map((id) => (
              <DropdownItem key={id + 1}>{id + 1}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Tooltip content='Agrega una mesa'> 
          <Button isIconOnly variant='light' size='sm' onPress={handleAddMesa}>
            <MesaAddIcon />
          </Button>
        </Tooltip>
      </div>
    </>
  );
}