"use client";
import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
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
import { supabase } from "@/utils/supabase";
import notify from "@/utils/notify";
import GetUser from "@/utils/getuser";

// Tipo para el hook [productosFromBD, setProductosFromBD]
interface Producto {
  idproducto: number;
  referencia: number;
  descripcion: string;
  vrventa: number;
}

// Tipo para el hook [carrito, setCarrito]
interface ProductoCarrito extends Producto {
  mesa: string;
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
  const { mesaSeleccionada } = useContext(MesaContext) as MesaContextType;
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // State para abrir el carrito
  const [productosFromBD, setProductosFromBD] = useState<Producto[]>([]); // State para cargar los productos que vienen de la base de datos
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]); // State para guardar el producto seleccionado en una comanda
  const [filterValue, setFilterValue] = useState(""); // State para filtrar los productos
  const [rowsPerPage] = useState<number>(8); // State para establecer cuantos items se van a mostrar en cada pagina
  const [page, setPage] = useState<number>(1); // State para la paginacion de la tabla productos
  const [cantidadProducto, setCantidadProducto] = useState<number>(0); // State para establecer la cantidad de producto a agregar al carrito (el valor es global y cambia al ingresar otra cantidad)
  const [observacion, setObservacion] = useState<string>("");
  const [ultimaFacturaLocal, setUltimaFacturaLocal] = useState<number>(1);

  const hasSearchFilter = Boolean(filterValue);

  // Funcion para consultar el numero de la ultima factura de registrada en bd
  async function ultimaFactura() {
    GetUser;
    try {
      const { data: Comanda } = await supabase
        .from("Comanda")
        .select("idComanda")
        .order("idComanda", { ascending: false })
        .limit(1)
        .single();

      if (Comanda !== null) {
        localStorage.setItem(
          "ultimaComanda",
          JSON.stringify(Comanda.idComanda),
        );
      }
    } catch (error) {
      notify("error", `${error}`);
    }
  }

  // Hook que monta los productos una vez se renderiza el componente
  useEffect(() => {
    const productos = JSON.parse(localStorage.getItem("ProductosBD") || "[]");

    setProductosFromBD(productos);

    ultimaFactura();
    supabase
      .channel("comandas-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Comanda",
        },
        () => {
          ultimaFactura();
        },
      )
      .subscribe();
  }, []);

  // Funcion para evaluar el cambio en el input de busqueda
  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  // Funcion que filtra los productos segun el valor del campo de busqueda
  const filteredItems = useMemo<Producto[]>(() => {
    let filteredProducts = [...productosFromBD];

    if (hasSearchFilter) {
      filteredProducts = filteredProducts.filter((producto) =>
        producto.descripcion.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filteredProducts;
  }, [productosFromBD, filterValue]);

  // Funcion que muestra los productos segun el campo de busqueda
  const items = useMemo<Producto[]>(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  // Funcion que envia los productos seleccionados al carrito
  const handleConfirmProductSelected = (
    idproducto: number,
    referencia: number,
    descripcion: string,
    vrventa: number,
    cantidad: number,
  ) => {
    let currentIndex = 0;
    const isProductExist = carrito.find(
      (item) =>
        item.referencia === referencia && item.mesa === mesaSeleccionada,
    );

    if (!isProductExist) {
      setCarrito((prevCart) => [
        ...prevCart,
        {
          idproducto,
          referencia,
          descripcion,
          vrventa,
          mesa: mesaSeleccionada,
          cantidad,
          subtotal: cantidadProducto * vrventa,
        },
      ]);
    } else {
      notify("info", "El producto ya esta en el carrito");
    }
    currentIndex = currentIndex + 1;
  };

  // Funcion para buscar los productos seleccionados en el carrito en productosFromBD dependiendo de la mesa seleccionada
  const getProductsCart = (
    mesaNumber: number,
  ): { [key: string]: ProductCart } => {
    const productsCart: { [key: string]: ProductCart } = {};

    carrito.forEach((item) => {
      if (parseInt(item.mesa) === mesaNumber) {
        const product = productosFromBD.find(
          (p) => p.referencia === item.referencia,
        );

        if (product) {
          productsCart[item.referencia] = {
            ...product,
            cantidad: item.cantidad,
          };
        }
      }
    });

    return productsCart;
  };

  // Funcion para interactuar con la cantidad de producto de forma global y mutable
  const handleChangeCantidad = (value: string) => {
    if (value === "") {
      setCantidadProducto(1);
    } else {
      setCantidadProducto(parseInt(value, 10) || 1);
    }
  };

  // Funcion para remover productos del carrito
  const handleRemoveItemFromCart = (referencia: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito.filter((item) => item.referencia !== referencia),
    );
  };

  // Funcion para calcular el total a pagar del carrito dependiendo de la mesa seleccionada
  const totalToPay = useMemo(() => {
    const productsFromMesa = getProductsCart(parseInt(mesaSeleccionada));

    return Object.values(productsFromMesa).reduce(
      (acc, product) => acc + product.cantidad * product.vrventa,
      0,
    );
  }, [carrito, mesaSeleccionada]);

  // Funcion para incrementar la cantidad de un item dentro del carrito
  const incrementarCantidad = (referencia: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.referencia === referencia
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.vrventa,
            }
          : item,
      ),
    );
  };

  // Funcion para decrementar la cantidad de un item dentro del carrito
  const decrementarCantidad = (referencia: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.referencia === referencia && item.cantidad > 0
          ? {
              ...item,
              cantidad: item.cantidad - 1,
              subtotal: (item.cantidad - 1) * item.vrventa,
            }
          : item,
      ),
    );
  };

  // Manejador para el cambio del input de observacion de forma global y mutable
  const handleChangeObservacion = (value: string) => {
    setObservacion(value);
  };

  // Funcion para enviar el pedido a la API
  const enviarPedido = async () => {
    GetUser;
    const consecutivo = ultimaFacturaLocal;
    const productos = carrito.filter((item) => item.mesa === mesaSeleccionada);

    try {
      const total = totalToPay;
      const empleado = localStorage.getItem("activeUser");
      const fecha = new Date();
      const facturaToAPI = {
        productos,
        observacion,
        total,
        empleado,
        consecutivo,
        fecha,
      };

      await fetch("/api/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facturaToAPI }),
      }).then((response) => {
        if (response.ok) {
          notify("success", "Comanda registrada correctamente");
          ultimaFactura();

          setCarrito((prevCarrito) =>
            prevCarrito.filter((item) => item.mesa !== mesaSeleccionada),
          );
        }
      });
    } catch (error) {
      notify("error", `${error}`);
    }
  };

  // Manejador combinado
  const fetchAPI = () => {
    const cart = carrito.filter((item) => item.mesa === mesaSeleccionada);

    for (const item of cart) {
      if (item.cantidad === 0) {
        notify("error", "La cantidad de producto no puede ser cero");

        return;
      }
    }
    enviarPedido();
  };

  // Obtener la ultima factura registrada en bd del localStorage
  const handleUltimaFacturaLocal = () => {
    const ultima: number = JSON.parse(
      localStorage.getItem("ultimaComanda") || "[]",
    );

    if (ultima === 1) {
      setUltimaFacturaLocal(ultima);
    } else {
      setUltimaFacturaLocal(ultima + 1);
    }
  };

  // Funcion para contar los item que estan en el carrito dependiendo de la mesa seleccionada
  const carritoLength = useMemo(() => {
    return carrito.filter((item) => item.mesa === mesaSeleccionada).length;
  }, [carrito, mesaSeleccionada]);

  return (
    <>
      <div className="w-1/2 xxs:w-full">
        <div className="flex justify-between mb-4">
          <Input
            isClearable
            className="w-full pr-2"
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
          <Badge color="danger" content={carritoLength}>
            <Button
              isIconOnly
              color="primary"
              variant="light"
              onPress={() => {
                handleUltimaFacturaLocal();
                onOpen();
              }}
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
                      <ModalHeader className="flex flex-col mt-2 mx-1 align-middle">
                        <p>Comanda de la mesa {mesaSeleccionada}</p>
                        <p className="text-xs font-thin">
                          Factura Nro. {ultimaFacturaLocal}
                        </p>
                      </ModalHeader>
                      <ModalBody>
                        <div>
                          <div>
                            <div>
                              {Object.values(
                                getProductsCart(parseInt(mesaSeleccionada)),
                              ).map((producto, index) => (
                                <Card key={index} className="mb-2">
                                  <CardBody className="flex flex-row px-4 justify-between items-center">
                                    <div className="flex flex-col gap-0 w-full">
                                      <p className="text-sm font-medium">
                                        {producto.descripcion}
                                      </p>
                                      <p className="text-xs">
                                        {producto.vrventa.toLocaleString(
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
                                            producto.referencia,
                                          )
                                        }
                                      >
                                        <MinusIcon />
                                      </Button>
                                      <p className="mx-2">
                                        {producto.cantidad}
                                      </p>
                                      <Button
                                        isIconOnly
                                        color="primary"
                                        size="sm"
                                        variant="light"
                                        onPress={() =>
                                          incrementarCantidad(
                                            producto.referencia,
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
                                            producto.referencia,
                                          )
                                        }
                                      >
                                        <TrashIcon />
                                      </Button>
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Textarea
                          label="Observaciones"
                          maxRows={3}
                          placeholder="¿Salchipapa sin verduras? ¿Jugo sin azucar?"
                          onChange={(e) =>
                            handleChangeObservacion(e.target.value)
                          }
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
                        <Button
                          color="primary"
                          size="sm"
                          onPress={() => {
                            fetchAPI();
                            onClose();
                          }}
                        >
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
            <div className="mb-4 w-1/2 xxs:w-full">
              <div className="grid md:grid-cols-4 xxs:grid-cols-2 gap-2">
                {items.map((item) => (
                  <Card key={item.idproducto} className="w-full">
                    <CardBody>
                      <div className="flex flex-col gap-0">
                        <p className="text-sm xxs:text-xs font-medium">
                          {item.descripcion}
                        </p>
                      </div>
                    </CardBody>
                    <CardFooter className="flex flex-row items-center justify-between">
                      <p className="text-xs font-light">
                        {item.vrventa.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        })}
                      </p>
                      <Input
                        isRequired
                        className="w-1/3"
                        name={"cant" + item.idproducto}
                        size="sm"
                        type="number"
                        variant="bordered"
                        onChange={(e) => handleChangeCantidad(e.target.value)}
                      />
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        variant="light"
                        onPress={() =>
                          handleConfirmProductSelected(
                            item.idproducto,
                            item.referencia,
                            item.descripcion,
                            item.vrventa,
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
              <div className="flex mt-4 justify-center">
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
