import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientRecords from "./pages/patient/PatientRecords";
import UploadRecord from "./pages/patient/UploadRecord";
import SharedAccess from "./pages/patient/SharedAccess";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientSettings from "./pages/patient/PatientSettings";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalDocuments from "./pages/hospital/HospitalDocuments";
import HospitalAcknowledgements from "./pages/hospital/HospitalAcknowledgements";
import HospitalAlerts from "./pages/hospital/HospitalAlerts";
import HospitalSettings from "./pages/hospital/HospitalSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/install" element={<Install />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/records" element={<PatientRecords />} />
          <Route path="/patient/upload" element={<UploadRecord />} />
          <Route path="/patient/shared" element={<SharedAccess />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/settings" element={<PatientSettings />} />

          {/* Hospital Routes */}
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/documents" element={<HospitalDocuments />} />
          <Route path="/hospital/acknowledgements" element={<HospitalAcknowledgements />} />
          <Route path="/hospital/alerts" element={<HospitalAlerts />} />
          <Route path="/hospital/settings" element={<HospitalSettings />} />
          <Route path="/hospital/register" element={<Register />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;