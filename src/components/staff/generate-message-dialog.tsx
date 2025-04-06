import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Share2,
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("options");

  const messageTypeOptions = [
    {
      value: "confirmation",
      label: "Order Confirmation",
      description: "Confirm that the order has been received",
    },
    {
      value: "notification",
      label: "Shipping Notification",
      description: "Notify that the package has been shipped",
    },
    {
      value: "delivery",
      label: "Delivery Update",
      description: "Update about the delivery status or arrival",
    },
    {
      value: "sender_notification",
      label: "Sender Notification",
      description: "Message specifically for the sender",
    },
    {
      value: "custom",
      label: "Custom Message",
      description: "Create a fully customized message",
    },
  ];

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
      setActiveTab("message");
      toast({
        title: "Success",
        description: "Message generated successfully",
        variant: "default",
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
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const handleRegenerate = () => {
    setActiveTab("options");
    setIsMessageGenerated(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            Generate Shipment Message
          </DialogTitle>
          <DialogDescription>
            Create customized messages for your shipment communications.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="options" disabled={isLoading}>
              Options
            </TabsTrigger>
            <TabsTrigger
              value="message"
              disabled={!isMessageGenerated || isLoading}
            >
              Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Message Type</CardTitle>
                <CardDescription>
                  Select the type of message you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Content Options</CardTitle>
                <CardDescription>
                  Customize what information to include in the message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="includeTracking"
                        className="flex items-center gap-2"
                      >
                        Include Tracking Details
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Include tracking number and tracking link</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                    </div>
                    <Switch
                      id="includeTracking"
                      checked={includeTracking}
                      onCheckedChange={setIncludeTracking}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="includeSenderDetails"
                        className="flex items-center gap-2"
                      >
                        Include Sender Details
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Include sender's name, contact and address</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                    </div>
                    <Switch
                      id="includeSenderDetails"
                      checked={includeSenderDetails}
                      onCheckedChange={setIncludeSenderDetails}
                    />
                  </div>

                  {messageType === "sender_notification" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="includeCredentials"
                          className="flex items-center gap-2"
                        >
                          Include Account Credentials
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Include login details for tracking</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                      </div>
                      <Switch
                        id="includeCredentials"
                        checked={includeCredentials}
                        onCheckedChange={setIncludeCredentials}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Additional Notes</CardTitle>
                <CardDescription>
                  Add any specific details or instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="additionalNotes"
                  placeholder="Enter any additional notes or special instructions..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateMessage}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Generate Message
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="message" className="space-y-4">
            {isMessageGenerated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Generated Message
                      </CardTitle>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRegenerate}
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:inline">
                                  Edit
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit message options</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyMessage}
                                className="flex items-center gap-1"
                              >
                                <Copy className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:inline">
                                  Copy
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <CardDescription>
                      Ready to copy or share with customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Textarea
                        className="min-h-[250px] p-4 font-mono text-base leading-relaxed tracking-wide whitespace-pre-wrap border-2 focus:border-primary bg-white dark:bg-zinc-950"
                        value={generatedMessage}
                        onChange={(e) => setGeneratedMessage(e.target.value)}
                        placeholder="Generated message will appear here..."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t px-6 py-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      You can edit this message before copying
                    </div>
                    <Button
                      onClick={handleCopyMessage}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Copy Message
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
