// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { TErrorSources, TGenericErrorResponse } from "../interface/error";

// const handleDuplicateError = (err: any): TGenericErrorResponse => {
//   // Extract value within double quotes using regex
//   const match = err.message.match(/"([^"]*)"/);
//   // The extracted value will be in the first capturing group
//   const extractedMessage = match && match[1];
//   const errorSources: TErrorSources = [
//     {
//       path: "",
//       message: `${extractedMessage} is already exists`,
//     },
//   ];

//   const statusCode = 400;

//   return {
//     statusCode,
//     message: `${extractedMessage} is already exists`,
//     errorSources,
//   };
// };

// export default handleDuplicateError;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

/**
 * Handles MongoDB duplicate key (E11000) errors
 * Produces clean, user-friendly messages
 */
const handleDuplicateError = (err: any): TGenericErrorResponse => {
  /**
   * MongoDB duplicate error structure:
   * err.code === 11000
   * err.keyValue = { fieldName: value }
   */
  const keyValue = err?.keyValue || {};
  const field = Object.keys(keyValue)[0] || "field";
  const value = keyValue[field];

  const readableValue =
    value === null || value === undefined ? "this value" : value;

  const message = `${field} '${readableValue}' already exists`;

  const errorSources: TErrorSources = [
    {
      path: field,
      message,
    },
  ];

  return {
    statusCode: 400,
    message,
    errorSources,
  };
};

export default handleDuplicateError;
