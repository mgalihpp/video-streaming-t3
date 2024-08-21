const dataURLToBlob = (dataURL: string): Blob => {
  // Extract the base64 data from the data URL
  const [base64Header, base64Data] = dataURL.split(",");

  // Decode the base64 data
  const binaryString = window.atob(base64Data!);

  // Create an ArrayBuffer
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create a Blob from the ArrayBuffer
  return new Blob([bytes], { type: "image/png" });
};

export const dataURLToFile = (dataURL: string, filename: string): File => {
  const blob = dataURLToBlob(dataURL);
  return new File([blob], filename, { type: "image/png" });
};
