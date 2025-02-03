import crypto from "crypto"

export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
    return `${hash}:${salt}`
}

export function verifyPassword(storedPassword: string, inputPassword: string): boolean {
    const [hashedPassword, salt] = storedPassword.split(":")
    const inputHash = crypto.pbkdf2Sync(inputPassword, salt, 1000, 64, "sha512").toString("hex")
    return hashedPassword === inputHash
}

