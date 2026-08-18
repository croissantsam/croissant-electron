import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Versions from "@/components/Versions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-4">
      <h3 className="p-2">Welcome Home!</h3>
      <Versions />
      <Badge>Default</Badge>
    </div>
  );
}
