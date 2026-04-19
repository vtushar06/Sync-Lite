import { useAuth } from "../context/AuthContext";
import { UploadForm } from "../components/UploadForm";

export const UploadPage = () => {
  const { token } = useAuth();

  if (!token) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Upload Data</h1>
      </div>
      <UploadForm token={token} onUploaded={async () => {}} />
    </div>
  );
};
