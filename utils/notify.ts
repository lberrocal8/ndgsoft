import { toast } from "sonner";

export default function notify(type: string, description: any) {
  switch (type) {
    case "success":
      toast.success(`${description}`);
      break;
    case "error":
      toast.error(`${description}`);
      break;
    case "warning":
      toast.warning(`${description}`);
      break;
    case "info":
      toast.info(`${description}`);
      break;
  }
}
