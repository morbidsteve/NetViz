"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import * as go from "gojs"
import { initDiagram, processNetworkData, NetworkTopologyLayout } from "./helpers"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface NetworkDiagramProps {
    data: any[]
    onNodeSelect?: (nodeData: any) => void
    filter: string
    onFilterChange: (filter: string) => void
    onNodeUpdate?: (nodeData: any) => void
    onNodePositionUpdate?: (nodeData: any) => void
}

const NetworkDiagram: React.FC<NetworkDiagramProps> = ({
                                                           data,
                                                           onNodeSelect,
                                                           filter,
                                                           onFilterChange,
                                                           onNodeUpdate,
                                                           onNodePositionUpdate,
                                                       }) => {
    const diagramRef = useRef<HTMLDivElement>(null)
    const [diagram, setDiagram] = useState<go.Diagram | null>(null)
    const [zoomLevel, setZoomLevel] = useState(1)
    const [filteredData, setFilteredData] = useState(data)

    const filterData = useCallback((data: any[], filter: string) => {
        if (filter === "all") return data
        return data.filter((node) => node.device.device_type?.toLowerCase() === filter.toLowerCase())
    }, [])

    useEffect(() => {
        setFilteredData(filterData(data, filter))
    }, [data, filter, filterData])

    useEffect(() => {
        if (!diagramRef.current) return

        const newDiagram = initDiagram()
        newDiagram.div = diagramRef.current

        newDiagram.addDiagramListener("ObjectSingleClicked", (e) => {
            const part = e.subject.part
            if (part instanceof go.Node) {
                console.log("Node selected:", part.data)
                const selectedNodeData = {
                    device: {
                        hostname: part.data.hostname,
                        ip_address: part.data.ip,
                        device_type: part.data.type,
                        os_version: part.data.os_version,
                        mac_address: part.data.mac_address,
                        subnet_mask: part.data.subnet_mask,
                    },
                    network: {
                        gateway: part.data.network?.gateway,
                        dns_servers: part.data.network?.dns_servers,
                        domain: part.data.network?.domain,
                    },
                }
                onNodeSelect?.(selectedNodeData)
            }
        })

        newDiagram.addDiagramListener("SelectionMoved", (e) => {
            const node = e.subject.first()
            if (node instanceof go.Node) {
                onNodePositionUpdate?.({
                    hostname: node.data.hostname,
                    position: node.location.toString(),
                })
            }
        })

        setDiagram(newDiagram)

        return () => {
            newDiagram.div = null
        }
    }, [onNodeSelect, onNodePositionUpdate])

    useEffect(() => {
        if (!diagram || filteredData.length === 0) return

        const { nodes, links } = processNetworkData(filteredData)

        diagram.startTransaction("update data")

        if (diagram.model instanceof go.GraphLinksModel) {
            diagram.model.nodeDataArray = nodes
            diagram.model.linkDataArray = links
        } else {
            diagram.model = new go.GraphLinksModel(nodes, links)
        }

        diagram.layout = new NetworkTopologyLayout()

        diagram.commitTransaction("update data")

        diagram.zoomToFit()
        setZoomLevel(diagram.scale)
    }, [diagram, filteredData])

    const handleZoomIn = useCallback(() => {
        if (diagram) {
            diagram.commandHandler.increaseZoom()
            setZoomLevel(diagram.scale)
        }
    }, [diagram])

    const handleZoomOut = useCallback(() => {
        if (diagram) {
            diagram.commandHandler.decreaseZoom()
            setZoomLevel(diagram.scale)
        }
    }, [diagram])

    const handleResetZoom = useCallback(() => {
        if (diagram) {
            diagram.zoomToFit()
            setZoomLevel(diagram.scale)
        }
    }, [diagram])

    const handleZoomChange = useCallback(
        (value: number[]) => {
            if (diagram) {
                diagram.scale = value[0]
                setZoomLevel(value[0])
            }
        },
        [diagram],
    )

    const handleExport = useCallback(() => {
        if (diagram) {
            const imgData = diagram.makeImageData({
                scale: 1,
                background: "white",
            })
            const link = document.createElement("a")
            link.download = "network-diagram.png"
            link.href = imgData
            link.click()
        }
    }, [diagram])

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center space-x-2 mb-4">
                <Select value={filter} onValueChange={onFilterChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by device type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Devices</SelectItem>
                        <SelectItem value="router">Routers</SelectItem>
                        <SelectItem value="switch">Switches</SelectItem>
                        <SelectItem value="firewall">Firewalls</SelectItem>
                        <SelectItem value="server">Servers</SelectItem>
                        <SelectItem value="client">Clients</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                    <Slider value={[zoomLevel]} min={0.1} max={2} step={0.1} onValueChange={handleZoomChange} className="w-32" />
                    <Button onClick={handleZoomIn} size="icon" variant="outline">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleZoomOut} size="icon" variant="outline">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleResetZoom} size="icon" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>
            <div className="flex-1 w-full border border-gray-200 rounded-lg bg-white overflow-auto">
                <div
                    ref={diagramRef}
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                    }}
                />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-[#4CAF50] text-white">
                    Router
                </Badge>
                <Badge variant="outline" className="bg-[#F44336] text-white">
                    Firewall
                </Badge>
                <Badge variant="outline" className="bg-[#2196F3] text-white">
                    Switch
                </Badge>
                <Badge variant="outline" className="bg-[#FFC107] text-white">
                    Server
                </Badge>
                <Badge variant="outline" className="bg-[#9C27B0] text-white">
                    Client
                </Badge>
            </div>
        </div>
    )
}

export default React.memo(NetworkDiagram)

