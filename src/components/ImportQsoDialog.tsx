import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import {
  Upload,
  FileCode,
  CheckCircle,
  AlertTriangle,
  ArrowDownUp,
  FilePlus,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseAdif, type AdifParseResult } from "@/lib/importers/adifParser";
import { sortQsoContacts } from "@/lib/importers/qsoSorter";
import type { ApplicationFormData } from "@/schemas/applicationSchema";

interface ImportQsoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportQsoDialog({ open, onOpenChange }: ImportQsoDialogProps) {
  const { t } = useTranslation();
  const form = useFormContext<ApplicationFormData>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<AdifParseResult | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "append">("replace");
  const [autoSort, setAutoSort] = useState(true);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result = parseAdif(text);
        setParseResult(result);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".adi") || file.name.toLowerCase().endsWith(".adif") || file.type.includes("text")) {
        handleFileProcess(file);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleApplyImport = () => {
    if (!parseResult || parseResult.contacts.length === 0) return;

    const existingContacts = form.getValues("contacts") || [];
    let combined = importMode === "replace"
      ? parseResult.contacts
      : [...existingContacts, ...parseResult.contacts];

    if (autoSort) {
      combined = sortQsoContacts(combined);
    }

    form.setValue("contacts", combined, { shouldValidate: true, shouldDirty: true });
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setFileName(null);
    setParseResult(null);
    setShowErrorDetails(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentContactsCount = form.watch("contacts")?.length || 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetState();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            {t("adifImport.title")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("adifImport.dropzoneText")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Drag & Drop Area */}
          {!parseResult && (
            <>
              <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".adi,.adif,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <FileCode className="h-8 w-8" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {t("adifImport.dropzoneText")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("adifImport.supportedFormats")} (.adi, .adif)
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-1">
                {t("adifImport.selectFile")}
              </Button>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span>{t("adifImport.voivodeshipNotice")}</span>
            </div>
            </>
          )}

          {/* Parsed Results Overview */}
          {parseResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCode className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-mono text-xs sm:text-sm truncate">{fileName}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="text-xs shrink-0 gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("adifImport.changeFile")}
                </Button>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-3 border rounded-lg bg-card flex flex-col">
                  <span className="text-xs text-muted-foreground">{t("adifImport.totalFound")}</span>
                  <span className="text-lg font-bold">{parseResult.totalParsed}</span>
                </div>
                <div className="p-3 border rounded-lg bg-card flex flex-col border-green-500/30 bg-green-500/5">
                  <span className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t("adifImport.validQSOs")}
                  </span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    {parseResult.validCount}
                  </span>
                </div>
                {parseResult.skippedCount > 0 && (
                  <div className="p-3 border rounded-lg bg-card flex flex-col border-amber-500/30 bg-amber-500/5 col-span-2 sm:col-span-1">
                    <span className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t("adifImport.skipped")}
                    </span>
                    <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                      {parseResult.skippedCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Voivodeship helper notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-xs text-muted-foreground">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{t("adifImport.voivodeshipNotice")}</span>
              </div>

              {/* Errors Accordion */}
              {parseResult.errors.length > 0 && (
                <div className="border border-destructive/30 rounded-lg p-3 bg-destructive/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                    className="font-medium text-destructive hover:underline flex items-center justify-between w-full"
                  >
                    <span>
                      {t("adifImport.showSkippedDetails")} ({parseResult.errors.length})
                    </span>
                    <span>{showErrorDetails ? "▲" : "▼"}</span>
                  </button>
                  {showErrorDetails && (
                    <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-muted-foreground font-mono">
                      {parseResult.errors.map((err, idx) => (
                        <li key={idx}>• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Import mode options */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("adifImport.importMode")}
                </Label>
                <RadioGroup
                  value={importMode}
                  onValueChange={(v) => setImportMode(v as "replace" | "append")}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <label
                    htmlFor="mode-replace"
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      importMode === "replace"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value="replace" id="mode-replace" className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("adifImport.replaceExisting")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("adifImport.replaceExistingDesc", { count: parseResult.validCount })}
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="mode-append"
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      importMode === "append"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value="append" id="mode-append" className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("adifImport.appendExisting")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("adifImport.appendExistingDesc", {
                          existing: currentContactsCount,
                          added: parseResult.validCount,
                        })}
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Auto sort checkbox */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-muted/20">
                <Checkbox
                  id="auto-sort-adif"
                  checked={autoSort}
                  onCheckedChange={(c) => setAutoSort(!!c)}
                  className="mt-0.5"
                />
                <div className="grid gap-0.5 leading-none">
                  <label
                    htmlFor="auto-sort-adif"
                    className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowDownUp className="h-3.5 w-3.5 text-primary" />
                    {t("adifImport.autoSortLabel")}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("adifImport.autoSortDesc")}
                  </p>
                </div>
              </div>

              {/* Preview table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("adifImport.previewTitle")} ({Math.min(parseResult.contacts.length, 5)} / {parseResult.contacts.length})
                  </span>
                </div>
                <div className="border rounded-md overflow-x-auto max-h-44">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="py-1.5">{t("recordSheet.columns.callsign")}</TableHead>
                        <TableHead className="py-1.5">{t("recordSheet.columns.date")}</TableHead>
                        <TableHead className="py-1.5">{t("recordSheet.columns.band")}</TableHead>
                        <TableHead className="py-1.5">{t("recordSheet.columns.mode")}</TableHead>
                        <TableHead className="py-1.5">{t("recordSheet.columns.voivodeship")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseResult.contacts.slice(0, 5).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono font-medium py-1.5">{row.callsign}</TableCell>
                          <TableCell className="font-mono py-1.5">{row.date}</TableCell>
                          <TableCell className="py-1.5">{row.band}</TableCell>
                          <TableCell className="py-1.5">{row.mode}</TableCell>
                          <TableCell className="font-mono py-1.5">
                            {row.voivodeship ? (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
                                {row.voivodeship}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          {parseResult && (
            <Button
              type="button"
              onClick={handleApplyImport}
              disabled={parseResult.validCount === 0}
              className="gap-1.5"
            >
              <FilePlus className="h-4 w-4" />
              {t("adifImport.confirmButton", { count: parseResult.validCount })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
