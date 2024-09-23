"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { DatePicker } from "@nextui-org/date-picker";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/modal";
import { Pagination } from "@nextui-org/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { DateValue } from "@internationalized/date";

import DefaultLayout from "@/layouts/default";
import { supabase } from "@/utils/supabase";
import notify from "@/utils/notify";
import GetUser from "@/utils/getuser";

interface DetallesComanda {
  ReferenciaComanda: number;
  ReferenciaProducto: number;
  Descripcion: string;
  Cantidad: number;
  VrVenta: number;
  Subtotal: number;
}

type Comanda = {
  idComanda: number;
  Mesa: string;
  Observacion?: string;
  Total: number;
  Empleado: string;
  Fecha: Date;
};

export default function Pedidos() {
  const [comandasFromBD, setComandasFromBD] = useState<Comanda[]>([]);
  const [detallesComandaFromBD, setDetallesComandaFromBD] = useState<
    DetallesComanda[]
  >([]);
  const [page, setPage] = useState<number>(1); // State para la paginacion de la tabla productos
  const [rowsPerPage] = useState<number>(6); // State para establecer cuantos items se van a mostrar en cada pagina
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [comandaSeleccionada, setComandaSeleccionada] = useState<number>(1);
  const [valueDate1, setValueDate1] = useState<DateValue>();
  const [valueDate2, setValueDate2] = useState<DateValue>();

  const fetchComandas = async () => {
    try {
      const { data: Comanda } = await supabase
        .from("Comanda")
        .select()
        .order("idComanda", { ascending: false });

      if (Comanda) {
        setComandasFromBD(Comanda);
      }
    } catch (error) {
      notify("error", "Error al cargar las comandas. Actualice la página");
    }
  };

  const fetchDetallesComandas = async (idComanda?: number) => {
    try {
      const { data: detalles_comanda } = await supabase
        .from("detalles_comanda")
        .select()
        .eq("ReferenciaComanda", idComanda);

      if (detalles_comanda) {
        setDetallesComandaFromBD(detalles_comanda);
      }
    } catch (error) {
      notify("error", "Error al solicitar los productos de la base de datos");
    }
  };

  useEffect(() => {
    GetUser;
    fetchComandas();
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
          fetchComandas();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "detalles_comanda",
        },
        () => {
          fetchDetallesComandas();
        },
      )
      .subscribe();
  }, []);

  // Funcion que formatea la fecha extraida de la base de datos en DD-MM-YYYY HH:MM
  const formatDate = (date: Date): string => {
    const newDate = new Date(date);

    const day = String(newDate.getUTCDate()).padStart(2, "0");
    const month = String(newDate.getUTCMonth() + 1).padStart(2, "0");
    const year = newDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  // Funcion que filtra los items de acuerdo a las fechas seleccionadas en DatePicker1 y DatePicker2
  const filteredItems = useMemo<Comanda[]>(() => {
    let filteredProducts = [...comandasFromBD];

    if (valueDate1 && valueDate2) {
      const startDate = new Date(
        valueDate1.year,
        valueDate1.month - 1,
        valueDate1.day,
      );
      const endDate = new Date(
        valueDate2.year,
        valueDate2.month - 1,
        valueDate2.day,
      );
      const startDateFilter = formatDate(startDate);
      const endDateFilter = formatDate(endDate);

      filteredProducts = filteredProducts.filter(
        (comanda) =>
          formatDate(comanda.Fecha) >= startDateFilter &&
          formatDate(comanda.Fecha) <= endDateFilter,
      );
    } else if (valueDate1) {
      const startDate = new Date(
        valueDate1.year,
        valueDate1.month - 1,
        valueDate1.day,
      );
      const startDateFilter = formatDate(startDate);

      filteredProducts = filteredProducts.filter(
        (comanda) => formatDate(comanda.Fecha) >= startDateFilter,
      );
    } else if (valueDate2) {
      const endDate = new Date(
        valueDate2.year,
        valueDate2.month - 1,
        valueDate2.day,
      );
      const endDateFilter = formatDate(endDate);

      filteredProducts = filteredProducts.filter(
        (comanda) => formatDate(comanda.Fecha) <= endDateFilter,
      );
    }

    return filteredProducts;
  }, [comandasFromBD, valueDate1, valueDate2]);

  // Funcion que muestra los productos segun el campo de busqueda
  const items = React.useMemo<Comanda[]>(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  // Funcion que retorna los items de una comanda desde la base de datos
  const getProductsToComanda = async (idComanda: number) => {
    GetUser;
    fetchDetallesComandas(idComanda);
  };

  // Manejador mixto para abril el modal, hacer consultas a la base de datos y establecer la comanda seleccionada
  const handleChangeComandaSeleccionada = (idComanda: number) => {
    setComandaSeleccionada(idComanda);
    getProductsToComanda(idComanda);
    onOpen();
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col justify-center mb-6">
        <div className="flex flex-row gap-2 items-end justify-between mb-4">
          <DatePicker
            color="primary"
            hourCycle={12}
            label="Fecha inicial"
            labelPlacement="outside"
            value={valueDate1}
            onChange={setValueDate1}
          />
          <DatePicker
            color="primary"
            hourCycle={12}
            label="Fecha final"
            labelPlacement="outside"
            value={valueDate2}
            onChange={setValueDate2}
          />
        </div>
        <div>
          {items.map((item) => (
            <Card
              key={item.idComanda}
              isPressable
              className="w-full mb-2"
              onPress={() => handleChangeComandaSeleccionada(item.idComanda)}
            >
              <CardBody className="flex flex-row justify-between items-center">
                <div>
                  <p className="font-medium text-xs mx-2">
                    Comanda Nro. {item.idComanda}
                  </p>
                  <p className="font-light text-xs mx-2">
                    Total pagado:{" "}
                    {item.Total.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    })}
                  </p>
                  <p className="font-light text-xs mx-2">
                    Mesero: {item.Empleado}
                  </p>
                  <p className="font-light text-xs mx-2">
                    Fecha: {formatDate(item.Fecha)}
                  </p>
                </div>
                <div>
                  <Modal
                    hideCloseButton
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                  >
                    <ModalContent>
                      {(onClose) => (
                        <>
                          <ModalHeader>
                            Carrito de la comanda {comandaSeleccionada}
                          </ModalHeader>
                          <ModalBody>
                            <Table aria-label="Tabla de productos vendidos en una comanda">
                              <TableHeader>
                                <TableColumn>Producto</TableColumn>
                                <TableColumn>Cantidad</TableColumn>
                                <TableColumn>Subtotal</TableColumn>
                              </TableHeader>
                              <TableBody items={detallesComandaFromBD}>
                                {(item) => (
                                  <TableRow key={item.ReferenciaComanda}>
                                    <TableCell className="text-xs w-full">
                                      {item.Descripcion}
                                    </TableCell>
                                    <TableCell className="text-xs text-center">
                                      {item.Cantidad}
                                    </TableCell>
                                    <TableCell className="text-xs text-right">
                                      {item.Subtotal.toLocaleString("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        minimumFractionDigits: 0,
                                      })}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </ModalBody>
                          <ModalFooter>
                            <Button color="primary" size="sm" onPress={onClose}>
                              Aceptar
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                </div>
              </CardBody>
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
      </section>
    </DefaultLayout>
  );
}
