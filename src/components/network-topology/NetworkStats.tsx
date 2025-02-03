import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Server, Router, Shield, Network } from "lucide-react"

const NetworkStats = ({ data }) => {
    const stats = data.reduce((acc, node) => {
        const type = node.device.device_type.toLowerCase()
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {})

    const statCards = [
        { title: "Windows Devices", value: stats.windows || 0, icon: Laptop },
        { title: "Linux Servers", value: stats.linux || 0, icon: Server },
        { title: "Routers", value: stats.router || 0, icon: Router },
        { title: "Firewalls", value: stats.firewall || 0, icon: Shield },
        { title: "Switches", value: stats.switch || 0, icon: Network },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((stat, index) => (
                <Card key={index} className="bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default NetworkStats

