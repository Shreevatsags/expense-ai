import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { parseCSV, ParsedTransaction } from "@/lib/csv-parser";
import { useUploadTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";

export function CSVUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const uploadMutation = useUploadTransactions();

  const handleFile = useCallback((file: File) => {
    setError(null);
    setParsedData(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const transactions = parseCSV(content);
        
        if (transactions.length === 0) {
          setError("No valid transactions found in the file. Please check the format.");
          return;
        }
        
        setParsedData(transactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV file");
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      handleFile(file);
    } else {
      setError("Please upload a CSV file");
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleUpload = async () => {
    if (parsedData) {
      await uploadMutation.mutateAsync(parsedData);
      setParsedData(null);
      setFileName(null);
    }
  };

  const handleCancel = () => {
    setParsedData(null);
    setFileName(null);
    setError(null);
  };

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Bank Statement
        </CardTitle>
        <CardDescription>
          Upload a CSV file to automatically import and categorize your transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!parsedData ? (
          <div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center transition-all",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              error && "border-destructive/50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                isDragging ? "bg-primary/20" : "bg-secondary"
              )}>
                <FileText className={cn(
                  "h-8 w-8",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isDragging ? "Drop your file here" : "Drag & drop your CSV file"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {parsedData.length} transactions found
                </p>
              </div>
            </div>
            
            {/* Preview */}
            <div className="max-h-48 overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((t, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="p-2 text-muted-foreground">{t.date}</td>
                      <td className="p-2 truncate max-w-[200px]">{t.description}</td>
                      <td className="p-2 text-muted-foreground">{t.category}</td>
                      <td className={cn(
                        "p-2 text-right font-medium",
                        t.type === "credit" ? "text-primary" : "text-destructive"
                      )}>
                        {t.type === "credit" ? "+" : "-"}${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {parsedData.length > 5 && (
                    <tr className="border-t border-border/50">
                      <td colSpan={4} className="p-2 text-center text-muted-foreground">
                        ... and {parsedData.length - 5} more transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                {uploadMutation.isPending ? "Uploading..." : "Import Transactions"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
