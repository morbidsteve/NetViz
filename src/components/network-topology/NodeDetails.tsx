import { useState } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

interface NodeDetailsProps {
    node: {
        device: {
            hostname: string
            ip_address: string
            device_type: string
            os_version: string
            mac_address: string
            subnet_mask: string
            [key: string]: string // Allow for custom fields
        }
        network: {
            gateway: string
            dns_servers: string[]
            domain: string
            [key: string]: string | string[] // Allow for custom fields
        }
    } | null
    onUpdate?: (nodeData: any) => void
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedNode, setEditedNode] = useState(node)
    const [newFieldName, setNewFieldName] = useState("")
    const [newFieldValue, setNewFieldValue] = useState("")
    const [newFieldCategory, setNewFieldCategory] = useState<"device" | "network">("device")

    if (!node) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Node Selected</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please select a node from the network diagram to view its details.</p>
                </CardContent>
            </Card>
        )
    }

    const handleSave = () => {
        onUpdate?.(editedNode)
        setIsEditing(false)
    }

    const handleAddField = () => {
        if (newFieldName && newFieldValue) {
            setEditedNode((prev) => ({
                ...prev,
                [newFieldCategory]: {
                    ...prev[newFieldCategory],
                    [newFieldName]: newFieldValue,
                },
            }))
            setNewFieldName("")
            setNewFieldValue("")
        }
    }

    const handleRemoveField = (category: "device" | "network", field: string) => {
        setEditedNode((prev) => {
            const updatedCategory = { ...prev[category] }
            delete updatedCategory[field]
            return { ...prev, [category]: updatedCategory }
        })
    }

    const renderFields = (category: "device" | "network") => {
        return Object.entries(editedNode[category]).map(([key, value]) => (
            <div key={key} className="mb-2">
                <label className="font-medium">{key}</label>
                {isEditing ? (
                    <div className="flex items-center">
                        <Input
                            value={value}
                            onChange={(e) =>
                                setEditedNode({
                                    ...editedNode,
                                    [category]: { ...editedNode[category], [key]: e.target.value },
                                })
                            }
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveField(category, key)} className="ml-2">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <p>{Array.isArray(value) ? value.join(", ") : value}</p>
                )}
            </div>
        ))
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{node.device.hostname}</CardTitle>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Device Information</h3>
                        {renderFields("device")}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Network Information</h3>
                        {renderFields("network")}
                    </div>
                    {isEditing && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Add New Field</h3>
                            <div className="flex items-center space-x-2">
                                <select
                                    value={newFieldCategory}
                                    onChange={(e) => setNewFieldCategory(e.target.value as "device" | "network")}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="device">Device</option>
                                    <option value="network">Network</option>
                                </select>
                                <Input
                                    placeholder="Field Name"
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                />
                                <Input
                                    placeholder="Field Value"
                                    value={newFieldValue}
                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                />
                                <Button onClick={handleAddField}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                    {isEditing && (
                        <Button onClick={handleSave} className="mt-4">
                            Save Changes
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default NodeDetails

