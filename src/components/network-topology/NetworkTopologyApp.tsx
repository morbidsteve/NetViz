"use client"

import { useState, useCallback, useEffect } from "react"
import { useSocket } from "@/hooks/useSocket"
import FileUpload from "./FileUpload"
import NetworkDiagram from "./NetworkDiagram"
import NetworkStats from "./NetworkStats"
import SearchBar from "./SearchBar"
import NodeDetails from "./NodeDetails"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Save, Upload, Users } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import * as go from "gojs"

interface NetworkNode {
    device: {
        hostname: string
        ip_address: string
        device_type: string
        status?: string
        os_version?: string
        mac_address?: string
    }
    network: {
        gateway: string
        dns_servers: string[]
        domain: string
    }
}

const NetworkTopologyApp = () => {
    const { data: session, status } = useSession()
    const [networkData, setNetworkData] = useState<NetworkNode[]>([])
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")
    const [configName, setConfigName] = useState("")
    const [savedConfigs, setSavedConfigs] = useState([])
    const [activeUsers, setActiveUsers] = useState<any[]>([])
    const [currentConfigId, setCurrentConfigId] = useState<string>("")
    const { socket, emitNodeUpdate, emitNodePositionUpdate } = useSocket(currentConfigId)
    const { toast } = useToast()
    const router = useRouter()
    const [diagram, setDiagram] = useState<go.Diagram | null>(null)

    useEffect(() => {
        if (socket) {
            console.log("Socket connected successfully")

            socket.on("node-updated", (updatedNode: NetworkNode) => {
                setNetworkData((prevData) =>
                    prevData.map((node) => (node.device.hostname === updatedNode.device.hostname ? updatedNode : node)),
                )
            })

            socket.on("node-position-updated", (data: { hostname: string; position: string }) => {
                // Update the position in the NetworkDiagram component
                // This will be implemented in the NetworkDiagram component
            })

            socket.on("user-presence-update", (data: { userId: string; user: any; action: string }) => {
                if (data.action === "joined") {
                    setActiveUsers((prev) => [...prev, data.user])
                } else if (data.action === "left") {
                    setActiveUsers((prev) => prev.filter((user) => user.id !== data.userId))
                }
            })

            return () => {
                socket.off("node-updated")
                socket.off("node-position-updated")
                socket.off("user-presence-update")
            }
        }
    }, [socket])

    const handleNodeSelect = useCallback((nodeData: NetworkNode) => {
        console.log("Node selected in NetworkTopologyApp:", nodeData)
        setSelectedNode(nodeData)
    }, [])

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
    }, [])

    const fetchConfigurations = useCallback(async () => {
        try {
            const response = await fetch("/api/network-configs")
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (!data.configs) {
                throw new Error("Configs not found in response")
            }
            setSavedConfigs(data.configs)
        } catch (error) {
            console.error("Error fetching configurations:", error)
            toast({
                title: "Error",
                description: "Failed to fetch saved configurations. Please try again.",
                variant: "destructive",
            })
        }
    }, [toast])

    const saveConfiguration = useCallback(async () => {
        if (!configName || networkData.length === 0) {
            toast({
                title: "Error",
                description: "Please provide a configuration name and network data",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await fetch("/api/network-configs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: configName,
                    data: networkData,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to save configuration")
            }

            const { config } = await response.json()

            toast({
                title: "Success",
                description: `Configuration "${config.name}" saved successfully`,
            })

            setConfigName("")
            fetchConfigurations()
        } catch (error) {
            console.error("Error saving configuration:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save configuration",
                variant: "destructive",
            })
        }
    }, [configName, networkData, toast, fetchConfigurations])

    const loadConfiguration = useCallback(
        async (configId: string) => {
            try {
                const response = await fetch(`/api/network-configs/${configId}`)
                if (!response.ok) {
                    throw new Error("Failed to load configuration")
                }
                const config = await response.json()
                setNetworkData(config.data)
                setCurrentConfigId(configId)
                toast({
                    title: "Success",
                    description: `Configuration "${config.name}" loaded successfully.`,
                })
            } catch (error) {
                console.error("Error loading configuration:", error)
                toast({
                    title: "Error",
                    description: "Failed to load configuration. Please try again.",
                    variant: "destructive",
                })
            }
        },
        [toast],
    )

    useEffect(() => {
        if (status === "authenticated") {
            fetchConfigurations()
        }
    }, [status, fetchConfigurations])

    const handleNodeUpdate = useCallback(
        (updatedNode: NetworkNode) => {
            setNetworkData((prevData) =>
                prevData.map((node) => (node.device.hostname === updatedNode.device.hostname ? updatedNode : node)),
            )
            setSelectedNode(updatedNode)
            emitNodeUpdate(updatedNode)
        },
        [emitNodeUpdate],
    )

    const handleNodePositionUpdate = useCallback(
        (nodeData: { hostname: string; position: string }) => {
            emitNodePositionUpdate(nodeData)
        },
        [emitNodePositionUpdate],
    )

    useEffect(() => {
        if (diagram) {
            const { nodes, links } = processNetworkData(networkData)
            diagram.model = new go.GraphLinksModel(nodes, links)
        }
    }, [diagram, networkData])

    const processNetworkData = (data: NetworkNode[]) => {
        //Implementation to process network data for go.js
        const nodes = data.map((node) => ({ key: node.device.hostname, ...node.device }))
        const links = [] // Add link processing logic here if needed

        return { nodes, links }
    }

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (status === "unauthenticated") {
        router.push("/auth/signin")
        return null
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="flex flex-col gap-4 p-4 lg:p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Network Topology Visualizer</h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{activeUsers.length} active users</span>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Config
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Save Configuration</AlertDialogTitle>
                                    <AlertDialogDescription>Enter a name for this network configuration.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <Input
                                    value={configName}
                                    onChange={(e) => setConfigName(e.target.value)}
                                    placeholder="Configuration Name"
                                />
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={saveConfiguration}>Save</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Load Config
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Load Configuration</AlertDialogTitle>
                                    <AlertDialogDescription>Select a saved network configuration to load.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {savedConfigs.map((config) => (
                                        <Button
                                            key={config.id}
                                            onClick={() => loadConfiguration(config.id)}
                                            variant="outline"
                                            className="w-full mb-2"
                                        >
                                            {config.name} - {new Date(config.createdAt).toLocaleString()}
                                        </Button>
                                    ))}
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" onClick={() => signOut()}>
                            Sign Out
                        </Button>
                    </div>
                </div>
                <FileUpload onDataProcessed={setNetworkData} />
            </header>

            {networkData.length > 0 && (
                <div className="flex-1 overflow-hidden">
                    <div className="h-full flex flex-col lg:flex-row">
                        <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
                            <div className="mb-4">
                                <NetworkStats data={networkData} />
                            </div>
                            <div className="mb-4">
                                <SearchBar onSearch={handleSearch} />
                            </div>
                            <div className="flex-1 min-h-0">
                                <NetworkDiagram
                                    data={networkData}
                                    onNodeSelect={handleNodeSelect}
                                    filter={filter}
                                    onFilterChange={setFilter}
                                    onNodeUpdate={handleNodeUpdate}
                                    onNodePositionUpdate={handleNodePositionUpdate}
                                    setDiagram={setDiagram}
                                />
                            </div>
                        </div>

                        {selectedNode && (
                            <div className="hidden lg:block w-96 border-l bg-gray-50 p-6 overflow-y-auto">
                                <NodeDetails node={selectedNode} onUpdate={handleNodeUpdate} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedNode && (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden fixed bottom-4 right-4">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <NodeDetails node={selectedNode} onUpdate={handleNodeUpdate} />
                    </SheetContent>
                </Sheet>
            )}
        </div>
    )
}

export default NetworkTopologyApp

