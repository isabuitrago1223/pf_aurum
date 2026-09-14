import PDFDocument from 'pdfkit';

export interface OrderReceiptItem {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  descuentoUnitario?: number;
  personalizacion?: unknown;
}

export interface OrderReceiptData {
  id: string;
  numeroPedido: string;
  estado: string;
  createdAt: Date;

  nombreContacto: string;
  cedulaContacto?: string | null;
  emailContacto: string;
  telefonoContacto: string;

  metodoEntrega: 'DOMICILIO' | 'TIENDA';
  direccionEntrega?: string | null;
  barrioEntrega?: string | null;
  ciudadEntrega?: string | null;
  departamentoEntrega?: string | null;
  notasEntrega?: string | null;

  direccionRecogida?: string | null;
  fechaRecogida?: Date | null;
  horaRecogida?: string | null;

  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;

  items: OrderReceiptItem[];

  pago?: {
    metodo: string;
    estado: string;
    monto: number;
    referencia?: string | null;
    proveedorTransaccion?: string | null;
    pagadoAt?: Date | null;
  } | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(value);
}

function formatOrderStatus(status: string) {
  const statuses: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_PREPARACION: 'En preparación',
    EN_CAMINO: 'En camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado'
  };

  return statuses[status] ?? status;
}

function formatPaymentStatus(status: string) {
  const statuses: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    REEMBOLSADO: 'Reembolsado'
  };

  return statuses[status] ?? status;
}

function formatPaymentMethod(method: string) {
  const methods: Record<string, string> = {
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    PSE: 'PSE',
    TRANSFERENCIA_BANCARIA: 'Transferencia bancaria',
    TARJETA: 'Tarjeta'
  };

  return methods[method] ?? method;
}

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

function formatPersonalizationValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatPersonalizationValue(item))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof value === 'object') {
    return Object.entries(
      value as Record<string, unknown>
    )
      .map(([key, item]) => {
        const formatted =
          formatPersonalizationValue(item);

        if (!formatted) {
          return '';
        }

        return `${humanizeKey(key)}: ${formatted}`;
      })
      .filter(Boolean)
      .join(' · ');
  }

  return String(value);
}

function getPersonalizationLines(
  personalizacion: unknown
): string[] {
  if (
    personalizacion === null ||
    personalizacion === undefined
  ) {
    return [];
  }

  if (typeof personalizacion === 'string') {
    const value = personalizacion.trim();
    return value ? [value] : [];
  }

  if (Array.isArray(personalizacion)) {
    return personalizacion
      .map((item) => formatPersonalizationValue(item))
      .filter(Boolean);
  }

  if (typeof personalizacion === 'object') {
    return Object.entries(
      personalizacion as Record<string, unknown>
    )
      .map(([key, value]) => {
        const formatted =
          formatPersonalizationValue(value);

        if (!formatted) {
          return '';
        }

        return `${humanizeKey(key)}: ${formatted}`;
      })
      .filter(Boolean);
  }

  return [String(personalizacion)];
}

function addDivider(doc: PDFKit.PDFDocument) {
  doc
    .strokeColor('#D6D6D6')
    .lineWidth(0.7)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(0.45);
}

function addSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string
) {
  doc
    .moveDown(0.6)
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#111111')
    .text(title);

  doc.moveDown(0.25);
  addDivider(doc);
}

function addLabelValue(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string
) {
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#111111')
    .text(`${label}: `, {
      continued: true
    });

  doc
    .font('Helvetica')
    .fillColor('#222222')
    .text(value);
}

function addSummaryRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  bold = false
) {
  const y = doc.y;

  doc
    .font(
      bold
        ? 'Helvetica-Bold'
        : 'Helvetica'
    )
    .fontSize(bold ? 12 : 9.5)
    .fillColor('#111111')
    .text(label, 50, y, {
      width: 300
    });

  doc
    .font(
      bold
        ? 'Helvetica-Bold'
        : 'Helvetica'
    )
    .text(value, 390, y, {
      width: 155,
      align: 'right'
    });

  doc.y = y + (bold ? 22 : 16);
}

export function createOrderReceiptPdf(
  data: OrderReceiptData
) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 42,
      bottom: 42,
      left: 50,
      right: 50
    },
    info: {
      Title: `Comprobante ${data.numeroPedido}`,
      Author: 'Aurum'
    }
  });

  doc
    .font('Helvetica-Bold')
    .fontSize(23)
    .fillColor('#111111')
    .text('AURUM', {
      align: 'center'
    });

  doc
    .moveDown(0.2)
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#333333')
    .text('Comprobante de compra', {
      align: 'center'
    });

  doc.moveDown(1.15);

  addLabelValue(
    doc,
    'Número de pedido',
    data.numeroPedido
  );

  addLabelValue(
    doc,
    'Fecha',
    formatDate(data.createdAt)
  );

  addLabelValue(
    doc,
    'Estado del pedido',
    formatOrderStatus(data.estado)
  );

  addLabelValue(
    doc,
    'ID interno',
    data.id
  );

  addSectionTitle(
    doc,
    'Datos del cliente'
  );

  addLabelValue(
    doc,
    'Nombre',
    data.nombreContacto
  );

  if (data.cedulaContacto) {
    addLabelValue(
      doc,
      'Documento',
      data.cedulaContacto
    );
  }

  addLabelValue(
    doc,
    'Correo',
    data.emailContacto
  );

  addLabelValue(
    doc,
    'Teléfono',
    data.telefonoContacto
  );

  addSectionTitle(
    doc,
    'Entrega'
  );

  addLabelValue(
    doc,
    'Método',
    data.metodoEntrega === 'DOMICILIO'
      ? 'Entrega a domicilio'
      : 'Recogida en tienda'
  );

  if (data.metodoEntrega === 'DOMICILIO') {
    if (data.direccionEntrega) {
      addLabelValue(
        doc,
        'Dirección',
        data.direccionEntrega
      );
    }

    if (data.barrioEntrega) {
      addLabelValue(
        doc,
        'Barrio',
        data.barrioEntrega
      );
    }

    if (data.ciudadEntrega) {
      addLabelValue(
        doc,
        'Ciudad',
        data.ciudadEntrega
      );
    }

    if (data.departamentoEntrega) {
      addLabelValue(
        doc,
        'Departamento',
        data.departamentoEntrega
      );
    }

    addLabelValue(
      doc,
      'Valor del domicilio',
      formatCurrency(data.costoEnvio)
    );
  }

  if (data.metodoEntrega === 'TIENDA') {
    if (data.direccionRecogida) {
      addLabelValue(
        doc,
        'Punto de recogida',
        data.direccionRecogida
      );
    }

    if (data.fechaRecogida) {
      addLabelValue(
        doc,
        'Fecha de recogida',
        formatDate(data.fechaRecogida)
      );
    }

    if (data.horaRecogida) {
      addLabelValue(
        doc,
        'Hora de recogida',
        data.horaRecogida
      );
    }
  }

  if (data.notasEntrega) {
    addLabelValue(
      doc,
      'Notas de entrega',
      data.notasEntrega
    );
  }

  addSectionTitle(
    doc,
    'Productos'
  );

  const tableTop = doc.y;

  doc
    .rect(50, tableTop, 495, 23)
    .fill('#F3F3F3');

  doc
    .fillColor('#111111')
    .font('Helvetica-Bold')
    .fontSize(8.5);

  doc.text(
    '#',
    60,
    tableTop + 7,
    { width: 20 }
  );

  doc.text(
    'Producto',
    90,
    tableTop + 7,
    { width: 240 }
  );

  doc.text(
    'Cantidad',
    340,
    tableTop + 7,
    {
      width: 55,
      align: 'center'
    }
  );

  doc.text(
    'Precio unitario',
    397,
    tableTop + 7,
    {
      width: 75,
      align: 'right'
    }
  );

  doc.text(
    'Total',
    475,
    tableTop + 7,
    {
      width: 60,
      align: 'right'
    }
  );

  doc.y = tableTop + 32;

  data.items.forEach(
    (item, index) => {
      const descuentoUnitario =
        item.descuentoUnitario ?? 0;

      const precioFinal =
        item.precioUnitario -
        descuentoUnitario;

      const totalItem =
        precioFinal *
        item.cantidad;

      const rowTop = doc.y;

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#222222');

      doc.text(
        String(index + 1),
        60,
        rowTop,
        {
          width: 20
        }
      );

      doc
        .font('Helvetica-Bold')
        .text(
          item.nombreProducto,
          90,
          rowTop,
          {
            width: 235
          }
        );

      doc
        .font('Helvetica')
        .text(
          String(item.cantidad),
          340,
          rowTop,
          {
            width: 55,
            align: 'center'
          }
        );

      doc.text(
        formatCurrency(
          item.precioUnitario
        ),
        397,
        rowTop,
        {
          width: 75,
          align: 'right'
        }
      );

      doc
        .font('Helvetica-Bold')
        .text(
          formatCurrency(totalItem),
          475,
          rowTop,
          {
            width: 60,
            align: 'right'
          }
        );

      let detailY =
        rowTop + 18;

      const personalizationLines =
        getPersonalizationLines(
          item.personalizacion
        );

      if (
        personalizationLines.length > 0
      ) {
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#333333')
          .text(
            'Características:',
            90,
            detailY,
            {
              width: 340
            }
          );

        detailY = doc.y + 1;

        personalizationLines.forEach(
          (line) => {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#333333')
              .text(
                `• ${line}`,
                100,
                detailY,
                {
                  width: 335
                }
              );

            detailY = doc.y + 1;
          }
        );
      }

      if (descuentoUnitario > 0) {
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#555555')
          .text(
            `• Descuento unitario: ${formatCurrency(
              descuentoUnitario
            )}`,
            100,
            detailY,
            {
              width: 335
            }
          );

        detailY = doc.y + 1;
      }

      doc.y =
        Math.max(
          detailY + 8,
          rowTop + 28
        );

      doc
        .strokeColor('#DDDDDD')
        .lineWidth(0.6)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.55);
    }
  );

  addSectionTitle(
    doc,
    'Resumen'
  );

  addSummaryRow(
    doc,
    'Subtotal:',
    formatCurrency(data.subtotal)
  );

  addSummaryRow(
    doc,
    data.metodoEntrega === 'DOMICILIO'
      ? 'Envío (domicilio):'
      : 'Envío:',
    formatCurrency(data.costoEnvio)
  );

  addSummaryRow(
    doc,
    'Descuento:',
    data.descuento > 0
      ? `- ${formatCurrency(
          data.descuento
        )}`
      : formatCurrency(0)
  );

  doc.moveDown(0.3);

  addSummaryRow(
    doc,
    'TOTAL:',
    formatCurrency(data.total),
    true
  );

  addSectionTitle(
    doc,
    'Pago'
  );

  if (data.pago) {
    addLabelValue(
      doc,
      'Método',
      formatPaymentMethod(
        data.pago.metodo
      )
    );

    addLabelValue(
      doc,
      'Estado',
      formatPaymentStatus(
        data.pago.estado
      )
    );

    addLabelValue(
      doc,
      'Monto',
      formatCurrency(
        data.pago.monto
      )
    );

    if (data.pago.referencia) {
      addLabelValue(
        doc,
        'Referencia',
        data.pago.referencia
      );
    }

    if (data.pago.pagadoAt) {
      addLabelValue(
        doc,
        'Fecha de pago',
        formatDate(
          data.pago.pagadoAt
        )
      );
    }
  } else {
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor('#444444')
      .text(
        'Este pedido todavía no tiene información de pago registrada.'
      );
  }

  doc
    .moveDown(1.5)
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#444444')
    .text(
      'Gracias por tu compra en Aurum.',
      {
        align: 'center'
      }
    );

  doc
    .moveDown(0.25)
    .fontSize(7)
    .fillColor('#666666')
    .text(
      'Este documento es un comprobante de compra generado por Aurum. No corresponde a una factura electrónica.',
      {
        align: 'center'
      }
    );

  return doc;
}
