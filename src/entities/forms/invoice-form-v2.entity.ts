import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE } from "@/commons/enums";
import { BadRequestException } from "@nestjs/common";

@Entity("invoice_forms_v2")
@Index(["invoiceNumber"], { unique: true })
@Index(["invoiceDate", "createdAt"])
export class InvoiceFormV2 extends BaseForm {
  @Column({ type: "varchar", length: 50, unique: true })
  invoiceNumber: string;

  @Column({ type: "date" })
  invoiceDate: Date;

  @Column({ type: "date", nullable: true })
  dueDate?: Date;

  // Datos del cliente
  @Column({ type: "jsonb" })
  clientInfo: {
    name: string;
    documentNumber: string;
    address: string;
    phone: string;
    email: string;
  };

  // Datos del emisor
  @Column({ type: "jsonb", nullable: true })
  issuerInfo: {
    name: string;
    documentNumber: string;
    address: string;
    phone: string;
    email: string;
  };

  // Líneas de factura
  @Column({ type: "jsonb" })
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    subtotal: number;
    total: number;
  }>;

  // Totales
  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discountTotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;

  // Información de pago
  @Column({ type: "jsonb", nullable: true })
  paymentInfo: {
    method: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO";
    reference: string;
    status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
    paidDate?: Date;
    paidAmount?: number;
  };

  // Observaciones
  @Column({ type: "text", nullable: true })
  invoiceNotes?: string;

  @Column({ type: "text", nullable: true })
  terms?: string;

  // Relación con paciente (opcional)
  @Column({ type: "varchar", length: 100, nullable: true })
  serviceType?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  servicePeriod?: string;

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.FACTURA;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    // Validar número de factura
    if (!this.invoiceNumber || this.invoiceNumber.trim().length === 0) {
      throw new BadRequestException("El número de factura es obligatorio");
    }

    // Validar fecha de factura
    if (!this.invoiceDate) {
      throw new BadRequestException("La fecha de factura es obligatoria");
    }

    // Validar información del cliente
    if (
      !this.clientInfo ||
      !this.clientInfo.name ||
      !this.clientInfo.documentNumber
    ) {
      throw new BadRequestException(
        "La información completa del cliente es obligatoria"
      );
    }

    // Validar items
    if (!this.items || this.items.length === 0) {
      throw new BadRequestException("Debe haber al menos una línea de factura");
    }

    // Validar totales
    if (this.total < 0) {
      throw new BadRequestException("El total no puede ser negativo");
    }

    // Validar cálculo de totales
    const calculatedSubtotal = this.items.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    const calculatedTotal =
      calculatedSubtotal - this.discountTotal + this.taxTotal;

    if (Math.abs(this.total - calculatedTotal) > 0.01) {
      throw new BadRequestException(
        "Los totales no coinciden con la suma de los items"
      );
    }

    return true;
  }

  getFormData(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      invoiceNumber: this.invoiceNumber,
      invoiceDate: this.invoiceDate,
      dueDate: this.dueDate,
      clientInfo: this.clientInfo,
      issuerInfo: this.issuerInfo,
      items: this.items,
      subtotal: this.subtotal,
      discountTotal: this.discountTotal,
      taxTotal: this.taxTotal,
      total: this.total,
      paymentInfo: this.paymentInfo,
      notes: this.invoiceNotes,
      terms: this.terms,
      serviceType: this.serviceType,
      servicePeriod: this.servicePeriod,
      patient: this.getPatientInfo(),
    };
  }

  setFormData(data: Record<string, any>): void {
    this.invoiceNumber = data.invoiceNumber || this.generateInvoiceNumber();
    this.invoiceDate = data.invoiceDate
      ? new Date(data.invoiceDate)
      : new Date();
    this.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    this.clientInfo = data.clientInfo;
    this.issuerInfo = data.issuerInfo;
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.discountTotal = data.discountTotal || 0;
    this.taxTotal = data.taxTotal || 0;
    this.total = data.total || 0;
    this.paymentInfo = data.paymentInfo;
    this.invoiceNotes = data.notes;
    this.terms = data.terms;
    this.serviceType = data.serviceType;
    this.servicePeriod = data.servicePeriod;

    // Recalcular totales si es necesario
    if (this.items.length > 0 && this.total === 0) {
      this.calculateTotals();
    }

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos de Factura
  generateTitle(): string {
    const clientName = this.clientInfo?.name || "Cliente";
    return `Factura ${this.invoiceNumber} - ${clientName}`;
  }

  generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `INV-${year}${month}-${random}`;
  }

  addItem(item: {
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }): void {
    const discount = item.discount || 0;
    const tax = item.tax || 0;
    const subtotal = item.quantity * item.unitPrice;
    const total = subtotal - discount + tax;

    if (!this.items) {
      this.items = [];
    }

    this.items.push({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount,
      tax,
      subtotal,
      total,
    });

    this.calculateTotals();
  }

  removeItem(index: number): void {
    if (!this.items || index < 0 || index >= this.items.length) return;
    this.items.splice(index, 1);
    this.calculateTotals();
  }

  calculateTotals(): void {
    if (!this.items || this.items.length === 0) {
      this.subtotal = 0;
      this.discountTotal = 0;
      this.taxTotal = 0;
      this.total = 0;
      return;
    }

    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.discountTotal = this.items.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    this.taxTotal = this.items.reduce((sum, item) => sum + (item.tax || 0), 0);
    this.total = this.subtotal - this.discountTotal + this.taxTotal;
  }

  markAsPaid(paidDate: Date, paidAmount: number): void {
    if (!this.paymentInfo) {
      this.paymentInfo = {
        method: "EFECTIVO",
        reference: "",
        status: "PAID",
      };
    }

    this.paymentInfo.status = "PAID";
    this.paymentInfo.paidDate = paidDate;
    this.paymentInfo.paidAmount = paidAmount;
  }

  markAsOverdue(): void {
    if (!this.paymentInfo) {
      this.paymentInfo = {
        method: "EFECTIVO",
        reference: "",
        status: "OVERDUE",
      };
    }
    this.paymentInfo.status = "OVERDUE";
  }

  isPaid(): boolean {
    return this.paymentInfo?.status === "PAID";
  }

  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && !this.isPaid();
  }

  getDaysUntilDue(): number {
    if (!this.dueDate) return 0;
    const today = new Date();
    const diffTime = this.dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getBalance(): number {
    if (!this.paymentInfo || !this.paymentInfo.paidAmount) {
      return this.total;
    }
    return this.total - this.paymentInfo.paidAmount;
  }

  // Método para generar resumen
  getSummary(): string {
    const isPaid = this.isPaid();
    const balance = this.getBalance();

    return `
      FACTURA ${this.invoiceNumber}
      
      CLIENTE: ${this.clientInfo?.name}
      DOCUMENTO: ${this.clientInfo?.documentNumber}
      
      FECHA DE EMISIÓN: ${this.invoiceDate.toLocaleDateString("es-ES")}
      ${this.dueDate ? `FECHA DE VENCIMIENTO: ${this.dueDate.toLocaleDateString("es-ES")}` : ""}
      
      DETALLE:
      Subtotal: $${this.subtotal.toFixed(2)}
      Descuentos: -$${this.discountTotal.toFixed(2)}
      Impuestos: +$${this.taxTotal.toFixed(2)}
      
      TOTAL: $${this.total.toFixed(2)}
      
      ESTADO DE PAGO: ${this.paymentInfo?.status || "PENDING"}
      ${!isPaid ? `SALDO PENDIENTE: $${balance.toFixed(2)}` : "PAGADO COMPLETAMENTE"}
      
      ${this.serviceType ? `SERVICIO: ${this.serviceType}` : ""}
      ${this.servicePeriod ? `PERIODO: ${this.servicePeriod}` : ""}
    `.trim();
  }
}
