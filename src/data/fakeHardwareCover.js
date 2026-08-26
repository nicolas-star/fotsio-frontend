export function getFakeHardwareCover(command, options = {}) {
  return {
    success: true,
    command,
    ...options,
    message: "Comando eseguito",
  };
}
