import crypto from "crypto";

export function scrypt_verify(password: string, hash: string): Promise<boolean> {
    return new Promise((res, rej) => {
        const [salt, key] = hash.split(":")
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                rej(err)
            };
            res(crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey))
        });
    })
} 1