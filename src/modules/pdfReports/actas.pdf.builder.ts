import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

const logo: Content = {
  image: "./icon/LogotipoFinalWEBJPEG.jpg", // "./icon/andamiaje.png",
  width: 250,
  alignment: "center",
};

export const buildActa = (data, configFromDB): TDocumentDefinitions => {
  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        image: logo.image,
        width: logo.width,
        alignment: logo.alignment,
        margin: [-20, -80, 0, 0], // [left, top, right, bottom]
      }, // Espacio entre columnas
      {
        text: "Este es el cuerpo del acta, donde se detallan los puntos tratados y observaciones.",
        style: "normal",
        alignment: "justify",
      },
    ],
    styles: {
      subheader: {
        fontSize: 16,
        bold: true,
      },
      normal: {
        fontSize: 12,
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  return docDefinition;
};
