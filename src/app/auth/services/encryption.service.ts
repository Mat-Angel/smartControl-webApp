import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private key: CryptoKey | null = null;
  private readonly storage = sessionStorage;

  constructor() {
    this.generateKey();
  }

  /**
   * Genera una clave AES-GCM de 256 bits y la guarda en memoria
   */
  private async generateKey(): Promise<void> {
    this.key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Cifra y guarda un valor en sessionStorage
   */
  async setItem(key: string, value: string): Promise<void> {
    if (!this.key) await this.generateKey();

    const iv = crypto.getRandomValues(new Uint8Array(12)); // Vector de inicialización
    const encoder = new TextEncoder();
    const encoded = encoder.encode(value);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key!,
      encoded
    );

    // Guardamos como JSON string (cipher + iv en base64)
    const cipherArray = Array.from(new Uint8Array(cipherBuffer));
    const ivArray = Array.from(iv);

    this.storage.setItem(
      key,
      JSON.stringify({ cipher: cipherArray, iv: ivArray })
    );
  }

  /**
   * Recupera y descifra un valor de sessionStorage
   */
  async getItem(key: string): Promise<string | null> {
    if (!this.key) return null;

    const stored = this.storage.getItem(key);
    if (!stored) return null;

    const { cipher, iv } = JSON.parse(stored);
    const cipherUint8 = new Uint8Array(cipher);
    const ivUint8 = new Uint8Array(iv);

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivUint8 },
        this.key,
        cipherUint8
      );

      return new TextDecoder().decode(decrypted);
    } catch (err) {
      console.error('Error al descifrar:', err);
      return null;
    }
  }

  /**
   * Borra un valor de sessionStorage
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * Limpia todo el sessionStorage
   */
  clear(): void {
    this.storage.clear();
  }

}
