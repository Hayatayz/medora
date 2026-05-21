import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className="animate-spin text-[#0F6E56]" size={24} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <Loader2 className="animate-spin text-[#0F6E56]" size={20} />
      </div>
    </div>
  );
}
