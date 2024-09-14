"use client";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { Badge } from "@nextui-org/badge";
import { Button } from "@nextui-org/button";
import { Card, CardFooter, CardBody } from "@nextui-org/card";
import { Input, Textarea } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Pagination } from "@nextui-org/pagination";

import {
  AddCircleIcon,
  SearchIcon,
  ShoppingCart,
  TrashIcon,
  AddIcon,
  MinusIcon,
} from "@/components/icons";
import { MesaContext } from "@/providers/mesaProvider";
import { MesaContextType } from "@/types";

// Tipo para el hook [productosFromBD, setProductosFromBD]
interface Producto {
  idProducto: number;
  Referencia: string;
  Descripcion: string;
  VrVenta: number;
}

// Tipo para el hook [carrito, setCarrito]
interface ProductoCarrito extends Producto {
  Cantidad: number;
  Subtotal: number;
}

// Tipo para la funcion getProductsCart()
interface ProductCart {
  Referencia: string;
  Descripcion: string;
  VrVenta: number;
  Cantidad: number;
}

export default function Comanda() {
  const { mesaSeleccionada } = useContext(MesaContext) as MesaContextType;
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // State para abrir el carrito
  const [productosFromBD, setProductosFromBD] = useState<Producto[]>([]); // State para cargar los productos que vienen de la base de datos
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]); // State para guardar el producto seleccionado en una comanda
  const [filterValue, setFilterValue] = useState(""); // State para filtrar los productos
  const [rowsPerPage] = useState<number>(8); // State para establecer cuantos items se van a mostrar en cada pagina
  const [page, setPage] = useState<number>(1); // State para la paginacion de la tabla productos
  const [cantidadProducto, setCantidadProducto] = useState<number>(0); // State para establecer la cantidad de producto a agregar al carrito (el valor es global y cambia al ingresar otra cantidad)
  const hasSearchFilter = Boolean(filterValue);

  // Hook que monta los productos una vez se renderiza el componente
  useEffect(() => {
    const productos = JSON.parse(localStorage.getItem("ProductosBD") || "[]");

    setProductosFromBD(productos);
  }, []);

  // Funcion para evaluar el cambio en el input de busqueda
  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  // Funcion que filtra los productos segun el valor del campo de busqueda
  const filteredItems = React.useMemo<Producto[]>(() => {
    let filteredProducts = [...productosFromBD];

    if (hasSearchFilter) {
      filteredProducts = filteredProducts.filter((producto) =>
        producto.Descripcion.toLowerCase().includes(filterValue.toLowerCase()),
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
  const handleConfirmProductSelected = (
    idProducto: number,
    Referencia: string,
    Descripcion: string,
    VrVenta: number,
    Cantidad: number,
  ) => {
    setCarrito((prevCart) => [
      ...prevCart,
      {
        idProducto,
        Referencia,
        Descripcion,
        VrVenta,
        Mesa: mesaSeleccionada,
        Cantidad,
        Subtotal: cantidadProducto * VrVenta,
      },
    ]);
    currentIndex = currentIndex + 1;
  };

  // Funcion para buscar los productos seleccionados en el carrito en productosFromBD
  const getProductsCart = (): { [key: string]: ProductCart } => {
    const productsCart: { [key: string]: ProductCart } = {};

    carrito.forEach((item) => {
      const product = productosFromBD.find(
        (p) => p.Referencia === item.Referencia,
      );

      if (product) {
        productsCart[item.Referencia] = { ...product, Cantidad: item.Cantidad };
      }
    });

    return productsCart;
  };

  // Funcion para interactuar con la cantidad de producto de forma global y mutable
  const handleChangeCantidad = (value: number) => {
    setCantidadProducto(value);
  };

  // Funcion para remover productos del carrito
  const handleRemoveItemFromCart = (referencia: string) => {
    setCarrito((prevCarrito) =>
      prevCarrito.filter((item) => item.Referencia !== referencia),
    );
  };

  // Funcion para calcular el total a pagar del carrito
  const totalToPay = useMemo(() => {
    const arrayCarrito = Array.isArray(carrito) ? carrito : [];

    return arrayCarrito.reduce((acc, item) => acc + item.Subtotal, 0);
  }, [carrito]);

  // Funcion para incrementar la cantidad de un item dentro del carrito
  const incrementarCantidad = (referencia: string) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.Referencia === referencia
          ? {
              ...item,
              Cantidad: item.Cantidad + 1,
              Subtotal: (item.Cantidad + 1) * item.VrVenta,
            }
          : item,
      ),
    );
  };

  // Funcion para decrementar la cantidad de un item dentro del carrito
  const decrementarCantidad = (referencia: string) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.Referencia === referencia && item.Cantidad > 0
          ? {
              ...item,
              Cantidad: item.Cantidad - 1,
              Subtotal: (item.Cantidad - 1) * item.VrVenta,
            }
          : item,
      ),
    );
  };

  // Funcion para contar los item que estan en el carrito
  const carritoLength = useMemo(() => carrito.length, [carrito]);

  return (
    <>
      <div className="w-1/2 xxs:w-full">
        <div className="flex justify-between mb-2 px-4">
          <h1 className="text-primary font-semibold text-xl px-2">
            Comanda: [mesa {mesaSeleccionada}]
          </h1>
          <Badge color="primary" content={carritoLength}>
            <Button
              isIconOnly
              color="primary"
              size="sm"
              variant="light"
              onPress={onOpen}
            >
              <ShoppingCart />
              <Modal
                hideCloseButton
                isOpen={isOpen}
                onOpenChange={onOpenChange}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="mt-2">
                        Comanda de mesa: {mesaSeleccionada}
                      </ModalHeader>
                      <ModalBody>
                        <div>
                          <div>
                            <div>
                              {Object.values(getProductsCart()).map(
                                (producto, index) => (
                                  <Card key={index} className="mb-2">
                                    <CardBody className="flex flex-row px-4 justify-between items-center">
                                      <div className="flex flex-col gap-0 w-full">
                                        <p className="text-sm font-medium">
                                          {producto.Descripcion}
                                        </p>
                                        <p className="text-xs">
                                          {producto.VrVenta.toLocaleString(
                                            "es-CO",
                                            {
                                              style: "currency",
                                              currency: "COP",
                                              minimumFractionDigits: 0,
                                            },
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex flex-row gap-2 items-center">
                                        <Button
                                          isIconOnly
                                          color="primary"
                                          size="sm"
                                          variant="light"
                                          onPress={() =>
                                            decrementarCantidad(
                                              producto.Referencia,
                                            )
                                          }
                                        >
                                          <MinusIcon />
                                        </Button>
                                        <p className="mx-2">
                                          {producto.Cantidad}
                                        </p>
                                        <Button
                                          isIconOnly
                                          color="primary"
                                          size="sm"
                                          variant="light"
                                          onPress={() =>
                                            incrementarCantidad(
                                              producto.Referencia,
                                            )
                                          }
                                        >
                                          <AddIcon />
                                        </Button>
                                      </div>
                                      <div>
                                        <Button
                                          isIconOnly
                                          color="danger"
                                          size="sm"
                                          variant="light"
                                          onPress={() =>
                                            handleRemoveItemFromCart(
                                              producto.Referencia,
                                            )
                                          }
                                        >
                                          <TrashIcon />
                                        </Button>
                                      </div>
                                    </CardBody>
                                  </Card>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                        <Textarea
                          label="Observaciones"
                          maxRows={3}
                          placeholder="¿Salchipapa sin verduras? ¿Jugo sin azucar?"
                        />
                        <div className="flex px-4 text-center justify-between items-center align-middle">
                          <p className="text-xs font-bold">Total a pagar:</p>
                          <p className="text-md font-semibold ml-3">
                            {totalToPay.toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" size="sm" onPress={onClose}>
                          Confirmar pedido
                        </Button>
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
            <Input
              isClearable
              className="w-full mb-4"
              placeholder="Buscar por nombre de producto"
              startContent={<SearchIcon />}
              type="text"
              value={filterValue}
              onClear={() => {
                setFilterValue("");
                setPage(1);
              }}
              onValueChange={onSearchChange}
            />
          </div>
          <div>
            <div className="mb-4 w-1/2 xxs:w-full">
              <div className="grid grid-cols-4 xxs:grid-cols-2 gap-2">
                {items.map((item) => (
                  <Card key={item.idProducto} className="w-full">
                    <CardBody>
                      <div className="flex flex-col gap-0">
                        <p className="text-sm xxs:text-xs font-medium">
                          {item.Descripcion}
                        </p>
                      </div>
                    </CardBody>
                    <CardFooter className="flex flex-row items-center justify-between">
                      <p className="text-xs font-light">
                        {item.VrVenta.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        })}
                      </p>
                      <Input
                        className="w-1/3"
                        name={"cant" + item.idProducto}
                        size="sm"
                        type="number"
                        variant="bordered"
                        onChange={(e) =>
                          handleChangeCantidad(
                            parseInt(e.target.value, 10) || 0,
                          )
                        }
                      />
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        variant="light"
                        onPress={() =>
                          handleConfirmProductSelected(
                            item.idProducto,
                            item.Referencia,
                            item.Descripcion,
                            item.VrVenta,
                            cantidadProducto,
                          )
                        }
                      >
                        <AddCircleIcon />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="justify-center mt-4">
                <Pagination
                  showControls
                  color="primary"
                  size="sm"
                  total={pages}
                  variant="light"
                  onChange={(page) => setPage(page)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
