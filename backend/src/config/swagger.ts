import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RentItRight API",
      version: "1.0.0",
      description: "Backend API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // where swagger comments live
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
