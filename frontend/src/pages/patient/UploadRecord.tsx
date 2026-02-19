import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useUploadRecord } from "@/hooks/useRecords";
import { useProfileStore } from "@/stores/useProfileStore";
import { toast } from "sonner";

const recordTypes = [
  { value: "lab", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "radiology", label: "Radiology (X-Ray, MRI, CT)" },
  { value: "cardiology", label: "Cardiology" },
  { value: "general", label: "General Checkup" },
  { value: "vaccination", label: "Vaccination Record" },
  { value: "surgery", label: "Surgery Report" },
  { value: "other", label: "Other" },
];

export default function UploadRecord() {
  const navigate = useNavigate();
  const { mutateAsync: uploadRecord, isPending } = useUploadRecord();
  const currentProfile = useProfileStore((s) => s.currentProfile);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProfile) {
      toast.error("No active profile selected. Please select a profile first.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    try {
      // Upload each file sequentially
      for (const file of files) {
        await uploadRecord({
          patientId: currentProfile.patient_id,
          data: {
            file,
            title,
            recordType,
            recordDate,
            doctorName: doctorName || undefined,
            hospitalName: hospitalName || undefined,
            description: notes || undefined,
          },
        });
      }

      setUploadSuccess(true);
      setTimeout(() => navigate("/patient/records"), 1500);
    } catch (error) {
      // Error toast is handled by the hook's onError callback
    }
  };

  if (uploadSuccess) {
    return (
      <DashboardLayout userType="patient">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
            <p className="text-muted-foreground">Your medical record has been securely uploaded.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="patient">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Upload Record</h1>
          <p className="text-muted-foreground">
            Add a new medical record for{" "}
            <span className="text-foreground font-medium">
              {currentProfile?.full_name || "your profile"}
            </span>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File uploading */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop files or click to browse. Supports PDF, JPG, PNG (max 10MB each).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="icon-container-lg mx-auto mb-4">
                    <Upload className="h-7 w-7" />
                  </div>
                  <p className="text-lg font-medium mb-1">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                </label>
              </div>

              {/* List of files */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Record details */}
          <Card>
            <CardHeader>
              <CardTitle>Record Details</CardTitle>
              <CardDescription>
                Provide information about this medical record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Record Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Blood Test Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Record Type *</Label>
                  <Select value={recordType} onValueChange={setRecordType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Record Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital / Clinic</Label>
                <Input
                  id="hospital"
                  placeholder="e.g., City General Hospital"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor Name</Label>
                <Input
                  id="doctor"
                  placeholder="e.g., Dr. Sarah Wilson"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this record..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/patient/records")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={files.length === 0 || isPending || !recordType}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Record
                </>
              )}
            </Button>
          </div>

          {/* security note */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary">Your data is secure</p>
              <p className="text-muted-foreground">
                All files are encrypted with AES-256 encryption and stored securely. Only you control who can access your records.
              </p>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
