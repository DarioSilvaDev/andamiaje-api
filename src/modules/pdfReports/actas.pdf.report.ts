import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

const logo: Content = {
  image: "./icon/andamiaje.png",
};

export const getActasPdfReport = (): TDocumentDefinitions => {
  const docDefinition: TDocumentDefinitions = {
    header: {
      style: "header",
      alignment: "center",
      margin: [0, 10, 0, 0], // [left, top, right, bottom]
      //   fontSize: 22,
      bold: true,
      columns: [
        { image: "./icon/andamiaje.png", width: 100, alignment: "left" },
        { text: "Andamiaje", alignment: "center", fontSize: 22, bold: true },
      ],
    },
    content: [
      {
        text: "Acta de Terapia",
        style: "header",
      },
      {
        text: "Fecha: 18/08/2025",
        style: "subheader",
      },
      {
        text: "Terapeuta:",
        style: "subheader",
      },
      {
        ul: ["Cosme Fulanito"],
      },
      {
        text: "Puntos tratados:",
        style: "subheader",
      },
      {
        ol: ["[Punto 1]", "[Punto 2]", "[Punto 3]"],
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  return docDefinition;
};
