// lib/ssrf.ts
// Comprehensive SSRF Defense per Enterprise Security Blueprint

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "::",
  "169.254.169.254", // Cloud Metadata IP (AWS / GCP / Azure)
  "metadata.google.internal",
  "instance-data"
]);

export function isDisallowedOrPrivateIP(ip: string): boolean {
  if (BLOCKED_HOSTNAMES.has(ip.toLowerCase())) return true;

  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (match) {
    const o1 = parseInt(match[1], 10);
    const o2 = parseInt(match[2], 10);
    
    if (o1 === 0 || o1 === 127) return true; // Loopback
    if (o1 === 10) return true;              // 10.0.0.0/8 Private
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true; // 172.16.0.0/12 Private
    if (o1 === 192 && o2 === 168) return true;          // 192.168.0.0/16 Private
    if (o1 === 169 && o2 === 254) return true;          // 169.254.0.0/16 Link-Local / AWS Metadata
    if (o1 >= 224) return true;                          // Multicast & Reserved
  }
  return false;
}
