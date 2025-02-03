import fs from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), "src", "data", "network-configs.json")

export interface NetworkConfig {
    id: string
    name: string
    data: any[]
    timestamp: string
}

export function readConfigs(): NetworkConfig[] {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([]))
        return []
    }
    const data = fs.readFileSync(DB_PATH, "utf-8")
    return JSON.parse(data)
}

export function writeConfigs(configs: NetworkConfig[]): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(configs, null, 2))
}

