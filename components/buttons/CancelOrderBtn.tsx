"use client";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { UpdateOrderStatus } from "@/lib/server actions/order.action";
import { X, AlertTriangle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
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

export default function CancelOrderBtn({ id }: { id: string }) {
  const [pending, start] = useTransition();

  const handleCancel = (orderId: string) => {
    start(async () => {
      const { success, error } = await UpdateOrderStatus({
        orderId,
        status: "cancelled",
      });

      if (!success) toast.error(getFriendlyErrorMessage(error));
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="w-full sm:w-auto body-medium disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 font-medium rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-all duration-300 flex-center gap-2 shadow-md hover:shadow-lg disabled:hover:shadow-md"
          disabled={pending}
        >
          <X className="w-5 h-5" />
          {pending ? "Cancelling..." : "Cancel Order"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Cancel This Order?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-slate-600 leading-relaxed">
            Are you sure you want to cancel this order? This action cannot be
            undone, and you&apos;ll need to place a new order if you change your
            mind.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="font-medium hover:bg-slate-100">
            Keep Order
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleCancel(id)}
            disabled={pending}
            className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {pending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Yes, Cancel Order
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
