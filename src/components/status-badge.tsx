import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <Badge variant="outline" className={`capitalize ${style}`}>
      {status}
    </Badge>
  );
}
