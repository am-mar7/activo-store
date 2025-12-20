"use client";
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
} from "@/components/ui/alert-dialog";
import { deleteCategory } from "@/lib/server actions/category.action";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  type?: string;
  _id: string;
}

export default function DeleteBtn({ type , _id}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const onDeleteMap = {
    "category":deleteCategory,
  }   
  const handleDelete = async () => {
    startTransition(async () => {
      setIsOpen(false);
      const onDelete = onDeleteMap[type as keyof typeof onDeleteMap] || (() => Promise.resolve({ success: false, error: { message: "Invalid type" } }));
      const { success, error } = await onDelete(_id);
      console.log({ success, error });      
      if (!success) toast.error(error?.message || `Failed to delete ${type}`);
    });
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger>
        <Trash2 className={`hover:text-destructive cursor-pointer ${isPending ? "opacity-40":""}`} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this{" "}
            {type} and remove your data from the Database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-200">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="hover:text-destructive hover:bg-slate-200"
            disabled={isPending}
            onClick={handleDelete}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
