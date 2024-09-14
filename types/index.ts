import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface MesaContextType {
  mesaSeleccionada: number;
  setMesaSeleccionada: React.Dispatch<React.SetStateAction<number>>;
}

export type ProductosCarrito = {
  id: number;
  Referencia: string;
  Descripcion: string;
  VrVenta: number;
  Cantidad: number;
  Mesa: string;
};

export type Factura = {
  ResoFacturas: string;
  FACTURA: string;
  Item: number;
  Referencia: string;
  DESCRIPCION: string;
  Observacion: string;
  CANTIDAD: number;
  VALUNITARIO: number;
  Descuento: number;
  VrFinal: string;
  SUBTOTAL: number;
  IVA: number;
  TOTAL: number;
  FECHA: Date;
  CLIENTE: string;
  Usuario: string;
  Mesa: string;
  CodEmpleado: string;
  Nombre: string;
  Propina: number;
};
