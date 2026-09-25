export const GENIAL_GREEN = '\x1b[32m';
export const GENIAL_BRIGHT = '\x1b[92m';
export const RESET = '\x1b[0m';

export function renderBanner({ color = true } = {}) {
  const green = color ? GENIAL_BRIGHT : '';
  const reset = color ? RESET : '';
  return [
    `${green}  ██████╗ ███████╗███╗   ██╗██╗ █████╗ ██╗     ${reset}`,
    `${green} ██╔════╝ ██╔════╝████╗  ██║██║██╔══██╗██║     ${reset}`,
    `${green} ██║  ███╗█████╗  ██╔██╗ ██║██║███████║██║     ${reset}`,
    `${green} ██║   ██║██╔══╝  ██║╚██╗██║██║██╔══██║██║     ${reset}`,
    `${green} ╚██████╔╝███████╗██║ ╚████║██║██║  ██║███████╗${reset}`,
    `${green}  ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚══════╝${reset}`,
    ' Startup AI OS · by Bruno Costa · eusoubrunocosta.tech · eusoubrunocosta.ai'
  ].join('\n');
}
