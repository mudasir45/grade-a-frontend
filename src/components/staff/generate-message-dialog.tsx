import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { useState } from "react";

interface GenerateMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  userId?: string;
}

export function GenerateMessageDialog({
  isOpen,
  onClose,
  shipmentId,
  userId,
}: GenerateMessageDialogProps) {
  const { toast } = useToast();
  const [messageType, setMessageType] = useState("confirmation");
  const [includeTracking, setIncludeTracking] = useState(true);
  const [includeSenderDetails, setIncludeSenderDetails] = useState(true);
  const [includeCredentials, setIncludeCredentials] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isMessageGenerated, setIsMessageGenerated] = useState(false);

  const handleGenerateMessage = async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        message_type: messageType,
        include_tracking: includeTracking,
        include_sender_details: includeSenderDetails,
        include_credentials: includeCredentials,
      };

      // Add user_id only for sender_notification type
      if (messageType === "sender_notification" && userId) {
        payload.user_id = userId;
      }

      // Add additional notes if provided
      if (additionalNotes) {
        payload.additional_notes = additionalNotes;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/message/${shipmentId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate message");
      }

      const data = await response.json();
      setGeneratedMessage(data.message);
      setIsMessageGenerated(true);
      toast({
        title: "Success",
        description: "Message generated successfully",
      });
    } catch (error) {
      console.error("Error generating message:", error);
      toast({
        title: "Error",
        description: "Failed to generate message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
      title: "Success",
      description: "Message copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Shipment Message</DialogTitle>
          <DialogDescription>
            Select the type of message and options to generate.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="messageType">Message Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmation">Confirmation</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="sender_notification">
                  Sender Notification
                </SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeTracking">Include Tracking</Label>
            <Switch
              id="includeTracking"
              checked={includeTracking}
              onCheckedChange={setIncludeTracking}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeSenderDetails">Include Sender Details</Label>
            <Switch
              id="includeSenderDetails"
              checked={includeSenderDetails}
              onCheckedChange={setIncludeSenderDetails}
            />
          </div>

          {messageType === "sender_notification" && (
            <div className="flex items-center justify-between">
              <Label htmlFor="includeCredentials">Include Credentials</Label>
              <Switch
                id="includeCredentials"
                checked={includeCredentials}
                onCheckedChange={setIncludeCredentials}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <textarea
              id="additionalNotes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter any additional notes..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>

          {isMessageGenerated && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Generated Message</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                placeholder="Generated message will appear here..."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleGenerateMessage} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
