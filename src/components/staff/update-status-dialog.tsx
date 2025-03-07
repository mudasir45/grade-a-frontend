"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";


interface CreateCustomerDialogProps {
    shipmentId: any
    currentStatus: any
    setStatusDialogOpen:React.Dispatch<React.SetStateAction<boolean>>
}

interface availableStatusProps {
    "id": number,
    "status_type": string,
    "status_type_display": string,
    "location_name": string,
    "description": string,
    "display_order": number
}
export function UpdateStatusDialog({
    shipmentId,
    currentStatus,
    setStatusDialogOpen
}: CreateCustomerDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [avaliableStatus, setAvaliableStatus] = useState<availableStatusProps[]>([]); // State for selected status
    const token = localStorage.getItem('auth_token')
    const[selectedStatusId,setSelectedStatusId]=useState<number>()

    // Fetch shipment status on component mount
    useEffect(() => {
        const fetchShipmentStatus = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments/status-update/${shipmentId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch shipment avaliable status");

                const data = await res.json();
                setAvaliableStatus(data.available_status_locations);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to fetch shipment avaliable status',
                    variant: 'destructive'
                })
            }
        };

        if (shipmentId) {
            fetchShipmentStatus();
        }
    }, [shipmentId]);
     // Handle form submission
     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStatusId) {
            toast({ title: "Error", description: "Please select a status", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/shipments/status-update/${shipmentId}/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status_location_id: selectedStatusId }),
                }
            );

            if (!res.ok) throw new Error("Failed to update shipment status");

            toast({ title: "Success", description: "Shipment status updated successfully" });
            setStatusDialogOpen(false)
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update status",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-center">

                <Select onValueChange={(value) => setSelectedStatusId(Number(value))}>
                    <SelectTrigger className="flex-1 max-h-60">
                        <SelectValue placeholder={currentStatus} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                        {
                            avaliableStatus.map((status, index) => (
                                <SelectItem key={index} value={String(status.id)}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{status.status_type}</span>
                                    </span>
                                </SelectItem>
                            ))
                        }

                    </SelectContent>
                </Select>

                <Button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            Updating..."
                        </>
                    ) : (
                        <>
                            <LogIn className="mr-1 h-4 w-4" />
                            Update
                        </>
                    )}

                </Button>
            </form>
        </>
    );
} 