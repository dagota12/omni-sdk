import { useState, useRef, useEffect } from "react";
import { useHeatmap } from "@/api";
import { useHeatmapStore } from "@/store";
import { renderHeatmapToCanvas } from "@/utils/heatmapRenderer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeatmapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  const { selectedProjectId, setSelectedUrl, selectedUrl } = useHeatmapStore();
  const {
    data: heatmapData,
    isLoading,
    error,
  } = useHeatmap(selectedProjectId, selectedUrl);

  const handleFetchHeatmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setSelectedUrl(urlInput.trim());
    }
  };

  // Render heatmap to canvas when data changes
  useEffect(() => {
    if (canvasRef.current && heatmapData?.grid) {
      renderHeatmapToCanvas(
        canvasRef.current,
        heatmapData.grid,
        heatmapData.pageWidth,
        heatmapData.pageHeight,
        heatmapData.gridSize
      );
    }
  }, [heatmapData]);

  // Handle canvas hover for tooltips
  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!heatmapData?.grid || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find nearby grid points (within 30px radius)
    const nearby = heatmapData.grid.filter((point) => {
      const px = 60 + point.xNorm * heatmapData.pageWidth;
      const py = 60 + point.yNorm * heatmapData.pageHeight;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      return dist < 30;
    });

    setHoveredPoint(nearby.length > 0 ? nearby[0] : null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heatmap Visualization</CardTitle>
          <CardDescription>
            Enter a URL to fetch and visualize click heatmap data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input Form */}
          <form onSubmit={handleFetchHeatmap} className="flex gap-2">
            <Input
              type="url"
              placeholder="e.g., http://localhost:5174/products"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!urlInput.trim()}>
              Fetch Heatmap
            </Button>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading heatmap data...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-semibold">Failed to load heatmap</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          )}

          {/* Canvas Visualization */}
          {heatmapData && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <canvas
                  ref={canvasRef}
                  className="w-full border border-border rounded"
                  onMouseMove={handleCanvasHover}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </div>

              {/* Heatmap Info */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                  <p className="text-lg font-semibold">
                    {heatmapData.clickCount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Grid Points</p>
                  <p className="text-lg font-semibold">
                    {heatmapData.grid.length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Page Size</p>
                  <p className="text-sm font-mono">
                    {heatmapData.pageWidth} × {heatmapData.pageHeight}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Grid Size</p>
                  <p className="text-lg font-semibold">
                    {heatmapData.gridSize}px
                  </p>
                </div>
              </div>

              {/* Tooltip on hover */}
              {hoveredPoint && (
                <div className="rounded-lg border border-border bg-card p-3 text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Element:</span>{" "}
                    <span className="font-mono">{hoveredPoint.tagName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clicks:</span>{" "}
                    <span className="font-semibold">{hoveredPoint.count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Selector:</span>
                    <p className="text-xs font-mono text-gray-600 break-all">
                      {hoveredPoint.selector}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Text Hash:</span>{" "}
                    <span className="font-mono text-xs">
                      {hoveredPoint.elementTextHash}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!heatmapData && !isLoading && !error && (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-12">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Enter a URL above to visualize heatmap data
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
