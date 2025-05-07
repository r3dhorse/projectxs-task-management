

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



export default function Home() {
 

  return (
    <div>
      <Input />
      <Button variant="primary">
        default
      </Button>
      <Button variant="destructive">
        destructive
      </Button>
      <Button variant="ghost">
        ghost
      </Button>
      <Button variant="tertiary">
        link
      </Button>
      <Button variant="outline">
        outline
      </Button>
      <Button variant="secondary">
        secondary
      </Button>

    </div>
  );
}
