"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { Buy4MeItem } from "@/lib/types/index";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

interface RequestListProps {
  onCheckout: () => void;
}

export function RequestList({ onCheckout }: RequestListProps) {
  const { activeRequest, updateItem, removeItem, loading } = useBuy4Me();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    quantity: "",
    color: "",
    size: "",
    notes: "",
  });

  const handleEdit = (item: Buy4MeItem) => {
    setEditingId(item.id || null);
    setEditForm({
      quantity: item.quantity.toString(),
      color: item.color || "",
      size: item.size || "",
      notes: item.notes || "",
    });
  };

  const handleSave = async (itemId: string) => {
    await updateItem(itemId, {
      quantity: parseInt(editForm.quantity),
      color: editForm.color,
      size: editForm.size,
      notes: editForm.notes,
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!activeRequest?.items || activeRequest.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">
          Your request list is empty
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Specifications</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRequest.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <a
                        href={item.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Source
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      min="1"
                      value={editForm.quantity}
                      onChange={(e) =>
                        setEditForm({ ...editForm, quantity: e.target.value })
                      }
                      className="w-20"
                    />
                  ) : (
                    item.quantity
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.color}
                        onChange={(e) =>
                          setEditForm({ ...editForm, color: e.target.value })
                        }
                        placeholder="Color"
                        className="mb-2"
                      />
                      <Input
                        value={editForm.size}
                        onChange={(e) =>
                          setEditForm({ ...editForm, size: e.target.value })
                        }
                        placeholder="Size"
                      />
                    </div>
                  ) : (
                    <div>
                      {item.color && <div>Color: {item.color}</div>}
                      {item.size && <div>Size: {item.size}</div>}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      placeholder="Additional notes"
                    />
                  ) : (
                    item.notes || "-"
                  )}
                </TableCell>
                <TableCell>
                  {formatCurrency(parseFloat(item.unit_price) * item.quantity)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {editingId === item.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSave(item.id!)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          Total: {formatCurrency(parseFloat(activeRequest.total_cost))}
        </div>
        <Button onClick={onCheckout}>Proceed to Checkout</Button>
      </div>
    </div>
  );
}
