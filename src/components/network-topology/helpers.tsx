import * as go from "gojs"

const $ = go.GraphObject.make

// Enhanced color palette
const colorPalette = {
    router: "#4CAF50",
    firewall: "#F44336",
    switch: "#2196F3",
    server: "#FFC107",
    client: "#9C27B0",
    unknown: "#607D8B",
    segment: "#ECEFF1",
}

// Function to get node color based on device type and status
const getNodeColor = (deviceType: string, status = "active"): string => {
    const baseColor = colorPalette[deviceType.toLowerCase()] || colorPalette.unknown
    switch (status.toLowerCase()) {
        case "active":
            return baseColor
        case "inactive":
            return lightenColor(baseColor, 0.5)
        case "warning":
            return "#FFC107"
        case "error":
            return "#FF5252"
        default:
            return baseColor
    }
}

// Function to lighten a color
const lightenColor = (color: string, factor: number): string => {
    const hex = color.replace("#", "")
    const rgb = Number.parseInt(hex, 16)
    const r = Math.min(255, ((rgb >> 16) & 0xff) + (255 - ((rgb >> 16) & 0xff)) * factor)
    const g = Math.min(255, ((rgb >> 8) & 0xff) + (255 - ((rgb >> 8) & 0xff)) * factor)
    const b = Math.min(255, (rgb & 0xff) + (255 - (rgb & 0xff)) * factor)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

// Enhanced tooltip content
const generateTooltip = (data: any): string => {
    return `
    <div class="bg-white p-4 rounded shadow-lg max-w-sm">
      <h3 class="font-bold text-lg mb-2">${data.hostname}</h3>
      <p class="mb-1"><span class="font-semibold">IP:</span> ${data.ip_address || data.ip || "N/A"}</p>
      <p class="mb-1"><span class="font-semibold">Type:</span> ${data.device_type || data.type || "Unknown"}</p>
      <p class="mb-1"><span class="font-semibold">Status:</span> ${data.status || "Active"}</p>
      ${data.os_version ? `<p class="mb-1"><span class="font-semibold">OS:</span> ${data.os_version}</p>` : ""}
      ${data.mac_address ? `<p class="mb-1"><span class="font-semibold">MAC:</span> ${data.mac_address}</p>` : ""}
      ${
        data.network && data.network.gateway
            ? `<p class="mb-1"><span class="font-semibold">Gateway:</span> ${data.network.gateway}</p>`
            : ""
    }
      ${
        data.network && data.network.dns_servers
            ? `<p class="mb-1"><span class="font-semibold">DNS:</span> ${data.network.dns_servers.join(", ")}</p>`
            : ""
    }
    </div>
  `
}

// Optimized node template
export const createNodeTemplate = () => {
    return $(
        go.Node,
        "Auto",
        {
            selectionAdorned: true,
            resizable: false,
            layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        },
        $(go.Shape, "Rectangle", {
            fill: "white",
            stroke: "gray",
            strokeWidth: 2,
        }),
        $(
            go.Panel,
            "Vertical",
            $(go.Picture, { width: 50, height: 50, background: "transparent" }, new go.Binding("source", "icon")),
            $(go.TextBlock, { font: "bold 12px sans-serif", textAlign: "center" }, new go.Binding("text", "hostname")),
        ),
    )
}

// Optimized link template
export const createLinkTemplate = () => {
    return $(go.Link, { routing: go.Link.Normal, corner: 5 }, $(go.Shape, { strokeWidth: 1.5, stroke: "#555" }))
}

// Custom NetworkTopologyLayout
class NetworkTopologyLayout extends go.LayeredDigraphLayout {
    constructor() {
        super()
        this.direction = 90
        this.layerSpacing = 100
        this.columnSpacing = 50
    }

    doLayout(coll: go.Diagram | go.Group | go.Iterable<go.Part>) {
        const diagram = this.diagram
        if (diagram === null) return
        diagram.startTransaction("NetworkTopologyLayout")

        const subnets: { [key: string]: go.Set<go.Node> } = {}
        const routers: go.Set<go.Node> = new go.Set<go.Node>()
        const firewalls: go.Set<go.Node> = new go.Set<go.Node>()
        const switches: go.Set<go.Node> = new go.Set<go.Node>()
        const others: go.Set<go.Node> = new go.Set<go.Node>()

        // Categorize nodes
        diagram.nodes.each((node) => {
            if (node.data.type === "router") {
                routers.add(node)
            } else if (node.data.type === "firewall") {
                firewalls.add(node)
            } else if (node.data.type === "switch") {
                switches.add(node)
            } else {
                others.add(node)
                const ip = node.data.ip_address || node.data.ip || "0.0.0.0"
                const subnet = ip.split(".").slice(0, 3).join(".")
                if (!subnets[subnet]) subnets[subnet] = new go.Set<go.Node>()
                subnets[subnet].add(node)
            }
        })

        // Position routers and firewalls
        const topRow = new go.Set<go.Node>().addAll(routers).addAll(firewalls)
        const topRowWidth = topRow.count * 150
        let x = -topRowWidth / 2
        topRow.each((node) => {
            node.location = new go.Point(x, 0)
            x += 150
        })

        // Position switches
        const switchRowWidth = switches.count * 150
        x = -switchRowWidth / 2
        switches.each((node) => {
            node.location = new go.Point(x, 150)
            x += 150
        })

        // Position other devices by subnet
        let y = 300
        Object.values(subnets).forEach((subnet) => {
            const subnetWidth = subnet.count * 100
            x = -subnetWidth / 2
            subnet.each((node) => {
                node.location = new go.Point(x, y)
                x += 100
            })
            y += 150
        })

        super.doLayout(coll)
        diagram.commitTransaction("NetworkTopologyLayout")
    }
}

// Updated diagram initialization
export const initDiagram = () => {
    const diagram = $(go.Diagram, {
        initialAutoScale: go.Diagram.Uniform,
        contentAlignment: go.Spot.Center,
        layout: new NetworkTopologyLayout(),
        maxSelectionCount: 1,
        "undoManager.isEnabled": true,
        allowZoom: true,
        "toolManager.hoverDelay": 100,
        "toolManager.toolTipDuration": 10000,
    })

    diagram.nodeTemplate = createNodeTemplate()
    diagram.linkTemplate = createLinkTemplate()

    return diagram
}

// Function to get icon based on device type
const getDeviceIcon = (deviceType: string): string => {
    const iconMap: { [key: string]: string } = {
        router: "/icons/router.svg",
        firewall: "/icons/firewall.svg",
        switch: "/icons/switch.svg",
        server: "/icons/server.svg",
        client: "/icons/client.svg",
    }
    return iconMap[deviceType.toLowerCase()] || "/icons/unknown.svg"
}

// Enhanced data processing function
export const processNetworkData = (data: any[]) => {
    const nodes: any[] = []
    const links: any[] = []
    const segments: { [key: string]: string[] } = {}

    data.forEach((item) => {
        const node = {
            key: item.device.hostname,
            ...item.device,
            ...item.network,
            icon: getDeviceIcon(item.device.device_type),
        }
        nodes.push(node)

        // Group nodes into segments based on subnet
        const subnet = item.device.ip_address.split(".").slice(0, 3).join(".")
        if (!segments[subnet]) {
            segments[subnet] = []
        }
        segments[subnet].push(item.device.hostname)

        if (item.network && item.network.gateway) {
            links.push({
                from: item.device.hostname,
                to: data.find((d) => d.device.ip_address === item.network.gateway)?.device.hostname || "Unknown Gateway",
            })
        }
    })

    // Create groups for segments
    const groups = Object.entries(segments).map(([subnet, devices]) => ({
        key: `Subnet ${subnet}.0/24`,
        isGroup: true,
        memberKeys: devices,
    }))

    return { nodes, links, groups }
}

export { NetworkTopologyLayout }

