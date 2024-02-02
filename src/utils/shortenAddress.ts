export const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(address.length - 6)}`.toUpperCase().replace('X', 'x');
