'use client'
import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Badge } from "@nextui-org/badge";
import { Button } from '@nextui-org/button';
import { Card, CardFooter, CardBody } from "@nextui-org/card";
import { Input, Textarea } from '@nextui-org/input';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Pagination } from "@nextui-org/pagination";

import { AddCircleIcon, SearchIcon, ShoppingCart, TrashIcon, AddIcon, MinusIcon } from '@/components/icons';
import { MesaContext } from '@/providers/mesaProvider';
import { MesaContextType } from '@/types';

// Tipo para el hook [productosFromBD, setProductosFromBD]
interface Producto {
  idproducto: number;
  referencia: number;
  descripcion: string;
  vrventa: number;
}

// Tipo para el hook [carrito, setCarrito]
interface ProductoCarrito extends Producto {
  mesa: string,
  cantidad: number;
  subtotal: number;
}

// Tipo para la funcion getProductsCart()
interface ProductCart {
  referencia: number;
  descripcion: string;
  vrventa: number;
  cantidad: number;
}

export default function Comanda() {
  const {mesaSeleccionada, setMesaSeleccionada} = useContext(MesaContext) as MesaContextType;
  const {isOpen, onOpen, onOpenChange} = useDisclosure(); // State para abrir el carrito
  const [productosFromBD, setProductosFromBD] = useState<Producto[]>([]); // State para cargar los productos que vienen de la base de datos
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]); // State para guardar el producto seleccionado en una comanda
  const [filterValue, setFilterValue] = useState(''); // State para filtrar los productos
  const [rowsPerPage, setRowsPerPage] = useState<number>(8); // State para establecer cuantos items se van a mostrar en cada pagina
  const [page, setPage] = useState<number>(1); // State para la paginacion de la tabla productos
  const [cantidadProducto, setCantidadProducto] = useState<number>(0); // State para establecer la cantidad de producto a agregar al carrito (el valor es global y cambia al ingresar otra cantidad)
  const hasSearchFilter = Boolean(filterValue);

  // Hook que monta los productos una vez se renderiza el componente
  useEffect(() => {
    setTimeout(() => {
      const productos = JSON.parse(localStorage.getItem('ProductosBD') || '[]');
      setProductosFromBD(productos);
    }, 500);
  }, []);

  // Funcion para evaluar el cambio en el input de busqueda
  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  // Funcion que filtra los productos segun el valor del campo de busqueda
  const filteredItems = React.useMemo<Producto[]>(() => {
    let filteredProducts = [...productosFromBD];

    if (hasSearchFilter) {
      filteredProducts = filteredProducts.filter((producto) =>
        producto.descripcion.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    return filteredProducts;
  }, [productosFromBD, filterValue]);

  // Funcion que muestra los productos segun el campo de busqueda
  const items = React.useMemo<Producto[]>(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  // Funcion que envia los productos seleccionados al carrito
  let currentIndex = 0;
  const handleConfirmProductSelected = (idproducto: number, referencia: number, descripcion: string, vrventa: number, cantidad: number) => {
    const isProductExist = carrito.find((item) => item.referencia === referencia && item.mesa === mesaSeleccionada);
    if (!isProductExist) {
      setCarrito((prevCart) => [ ...prevCart, { idproducto, referencia, descripcion, vrventa, mesa: mesaSeleccionada, cantidad, subtotal: cantidadProducto*vrventa} ]);
    } else {
      alert('El producto ya esta en el carrito...');
    }
    currentIndex++;
  };

  // Funcion para buscar los productos seleccionados en el carrito en productosFromBD dependiendo de la mesa seleccionada
  const getProductsCart = (mesaNumber: number): { [key: string]: ProductCart } => {
    const productsCart: { [key: string]: ProductCart } = {};
    carrito.forEach((item) => {
      if (parseInt(item.mesa) === mesaNumber) {
        const product = productosFromBD.find((p) => p.referencia === item.referencia);
        if (product) {
          productsCart[item.referencia] = {...product, cantidad: item.cantidad};
        }
      }
    });
    return productsCart;
  };

  // Funcion para interactuar con la cantidad de producto de forma global y mutable
  const handleChangeCantidad = (value: number) => {
    setCantidadProducto(value)
  };

  // Funcion para remover productos del carrito
  const handleRemoveItemFromCart = (referencia: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito.filter((item) => item.referencia !== referencia)
    );
  };

  // Funcion para calcular el total a pagar del carrito dependiendo de la mesa seleccionada
  const totalToPay = useMemo(() => {
    const productsFromMesa = getProductsCart(parseInt(mesaSeleccionada));
    return Object.values(productsFromMesa).reduce((acc, product) => acc + product.cantidad * product.vrventa, 0);
  }, [carrito, mesaSeleccionada]);

  // Funcion para incrementar la cantidad de un item dentro del carrito
  const incrementarCantidad = (referencia: number) => {
    setCarrito(prevCarrito => prevCarrito.map(item => item.referencia === referencia ? {
      ...item,
      cantidad: item.cantidad + 1,
      subtotal: (item.cantidad + 1) * item.vrventa
    }
      : item
    )
    );
  };
  
  // Funcion para decrementar la cantidad de un item dentro del carrito
  const decrementarCantidad = (referencia: number) => {
    setCarrito(prevCarrito => prevCarrito.map(item => item.referencia === referencia && item.cantidad > 0 ? {
      ...item,
      cantidad: item.cantidad - 1,
      subtotal: (item.cantidad - 1) * item.vrventa
    }
      : item
    )
    );
  };

  // Funcion para contar los item que estan en el carrito dependiendo de la mesa seleccionada
  const carritoLength = useMemo(() => {
    return carrito.filter((item) => item.mesa === mesaSeleccionada).length;
  }, [carrito, mesaSeleccionada]);

  return (
    <>
      <div className='w-1/2 xxs:w-full'>
        <div className='flex justify-between mb-2'>
        <Input isClearable className="w-full mb-4 px-2" type='text' placeholder="Buscar por nombre de producto" value={filterValue} onClear={() => {setFilterValue(''); setPage(1)}} onValueChange={onSearchChange} startContent={<SearchIcon />} />
          <Badge content={carritoLength} color='danger'>
            <Button isIconOnly variant='light' size='sm' color='primary' onPress={onOpen}>
              <ShoppingCart />
              <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className='mt-2'>Comanda de la mesa {mesaSeleccionada}</ModalHeader>
                      <ModalBody>
                        <div>
                          <div>
                            <div>
                              {Object.values(getProductsCart(parseInt(mesaSeleccionada))).map((producto, index) => (
                                <Card className='mb-2' key={index}>
                                  <CardBody className='flex flex-row px-4 justify-between items-center'>
                                    <div className='flex flex-col gap-0 w-full'>
                                      <p className='text-sm font-medium'>{producto.descripcion}</p>
                                      <p className='text-xs'>{producto.vrventa.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</p>
                                    </div>
                                    <div className='flex flex-row gap-2 items-center'>
                                      <Button isIconOnly size='sm' variant='light' color='primary' onPress={() => decrementarCantidad(producto.referencia)}>
                                        <MinusIcon />
                                      </Button>
                                      <p className='mx-2'>{producto.cantidad}</p>
                                      <Button isIconOnly size='sm' variant='light' color='primary' onPress={() => incrementarCantidad(producto.referencia)}>
                                        <AddIcon />
                                      </Button>
                                    </div>
                                    <div>
                                      <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => handleRemoveItemFromCart(producto.referencia)}>
                                        <TrashIcon />
                                      </Button>
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Textarea label='Observaciones' maxRows={3} placeholder='¿Salchipapa sin verduras? ¿Jugo sin azucar?'/>
                        <div className='flex px-4 text-center justify-between items-center align-middle'>
                          <p className='text-xs font-bold'>Total a pagar:</p>
                          <p className='text-md font-semibold ml-3'>{totalToPay.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</p>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button size='sm' color='primary' onPress={onClose}>Confirmar pedido</Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </Button>
          </Badge>
        </div>
        <div>
          <div>
            <div className='mb-4 w-1/2 xxs:w-full'>
              <div className='grid md:grid-cols-4 xxs:grid-cols-2 gap-2'>
                {items.map((item) => (
                  <Card className='w-full' key={item.idproducto}>
                    <CardBody>
                      <div className='flex flex-col gap-0'>
                        <p className='text-sm xxs:text-xs font-medium'>{item.descripcion}</p>
                      </div>
                    </CardBody>
                    <CardFooter className='flex flex-row items-center justify-between'>
                      <p className='text-xs font-light'>{item.vrventa.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</p>
                      <Input isRequired name={'cant'+item.idproducto} type='number' size='sm' variant='bordered' className='w-1/3' onChange={(e) => handleChangeCantidad(parseInt(e.target.value, 10) || 0)} />
                      <Button isIconOnly variant='light' color='primary' size='sm' onPress={() => handleConfirmProductSelected(item.idproducto, item.referencia, item.descripcion, item.vrventa, cantidadProducto)}>
                        <AddCircleIcon />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className='flex mt-4 justify-center'>
                <Pagination showControls color='primary' variant='light' total={pages} onChange={(page) => setPage(page)} size='sm'/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}