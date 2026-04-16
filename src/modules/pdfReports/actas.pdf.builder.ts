import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

const logo: Content = {
  image: "./icon/LogotipoFinalWEBJPEG.jpg", // "./icon/andamiaje.png",
  width: 250,
  alignment: "center",
};

export const buildActa = (data, _configFromDB): TDocumentDefinitions => {
  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        image: logo.image,
        width: logo.width,
        alignment: logo.alignment,
        margin: [-20, -80, 0, 0], // [left, top, right, bottom]
      },
      {
        text: "Acta de reunion",
        style: "subheader",
        margin: [0, 16, 0, 10],
      },
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "Paciente", style: "label" },
              { text: data?.patient || "Sin dato", style: "normal" },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "Profesional", style: "label" },
              { text: data?.createdBy || "Sin dato", style: "normal" },
            ],
          },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        text: `Modalidad: ${data?.modality || "Sin dato"}`,
        style: "normal",
      },
      {
        text: `Fecha: ${data?.date ? new Date(data.date).toISOString().slice(0, 10) : "Sin dato"}`,
        style: "normal",
        margin: [0, 0, 0, 8],
      },
      {
        text: "Tema",
        style: "label",
      },
      {
        text: data?.subject || "Sin dato",
        style: "normal",
        alignment: "justify",
      },
    ],
    styles: {
      subheader: {
        fontSize: 18,
        bold: true,
        color: "#17324D",
      },
      label: {
        fontSize: 10,
        bold: true,
        color: "#3F4F63",
      },
      normal: {
        fontSize: 11,
        color: "#202833",
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  return docDefinition;
};
