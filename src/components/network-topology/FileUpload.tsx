"use client"

import { useState } from "react"
import { Upload, Loader } from "lucide-react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type React from "react" // Added import for React

interface FileUploadProps {
    onDataProcessed: (data: any[]) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataProcessed }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const processFile = async (file: File) => {
        if (!file || (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx"))) {
            toast({
                title: "Invalid file",
                description: "Please upload a CSV or Excel file",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const processedData = results.data.map((row: any) => ({
                    device: {
                        hostname: row.hostname || row.HOSTNAME || row.host_name || "Unknown",
                        ip_address: row.ip_address || row.IP || row.ipaddress || "",
                        subnet_mask: row.subnet_mask || row.SUBNET || row.netmask || "",
                        device_type: row.device_type || row.type || "unknown",
                        os_version: row.os_version || row.OS || "",
                        mac_address: row.mac_address || row.MAC || "",
                    },
                    network: {
                        gateway: row.gateway || row.GATEWAY || "",
                        dns_servers: row.dns_servers ? row.dns_servers.split(",") : [],
                        domain: row.domain || "",
                    },
                }))
                onDataProcessed(processedData)
                setIsLoading(false)
                toast({
                    title: "File processed successfully",
                    description: `Loaded ${processedData.length} devices`,
                })
            },
            error: (error: any) => {
                console.error("Error parsing CSV:", error)
                setIsLoading(false)
                toast({
                    title: "Error parsing file",
                    description: "Please make sure it's a valid CSV",
                    variant: "destructive",
                })
            },
        })
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files && files[0]) {
            processFile(files[0])
        }
    }

    return (
        <div
            className={`w-full p-8 border-2 border-dashed rounded-lg transition-colors ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <label className="flex flex-col items-center cursor-pointer">
                {isLoading ? (
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                ) : (
                    <Upload className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-gray-500"}`} />
                )}
                <span className="mt-2 text-sm text-gray-600">
          {isLoading ? "Processing file..." : "Drop your network data file here or click to upload"}
        </span>
                <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) processFile(file)
                    }}
                    disabled={isLoading}
                />
            </label>
            {!isLoading && (
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                >
                    Select File
                </Button>
            )}
        </div>
    )
}

export default FileUpload

