"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/rpc";
import { useState } from "react";

export default function TestButtonsPage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const testFollowedEndpoint = async () => {
    setLoading(true);
    try {
      const response = await client.api.tasks["test-followed"].$get();
      if (response.ok) {
        const data = await response.json();
        console.log("Test response:", data);
        setResult(data);
      } else {
        const error = await response.text();
        console.error("Test error:", error);
        setResult({ error });
      }
    } catch (error) {
      console.error("Test request failed:", error);
      setResult({ error: error instanceof Error ? error.message : "Unknown error" });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Debug Test Page</h1>
      
      <Button onClick={testFollowedEndpoint} disabled={loading}>
        {loading ? "Testing..." : "Test Followed Tasks Endpoint"}
      </Button>

      {result !== null && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}