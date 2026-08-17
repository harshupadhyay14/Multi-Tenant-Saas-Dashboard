import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "../components/RoleBadge";
import { Check, Upload } from "lucide-react";
import api from "../api/axios";

const Settings = () => {
  const { user, org } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState(org?.logoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const orgId = org?._id || org?.id || org;

  const save = async () => {
    // In a real app: await api.patch("/users/me", { name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;

    setUploading(true);
    setUploadMsg("");
    try {
      // 1. Ask our API for a short-lived presigned S3 URL
      const { data } = await api.post(`/organizations/${orgId}/logo-upload-url`, {
        contentType: file.type,
      });

      // 2. Upload the file directly to S3 (never touches our backend)
      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // 3. Tell our API the upload finished, so it can save the URL
      await api.patch(`/organizations/${orgId}/logo`, { logoUrl: data.publicUrl });

      setLogoUrl(data.publicUrl);
      setUploadMsg("Logo uploaded!");
    } catch (err) {
      setUploadMsg(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(""), 3000);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ color: "#F2EFE9", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Settings</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 460 }}>
        <div style={{ background: "#1D1A15", border: "1px solid #2C2820", borderRadius: 14, padding: 28 }}>
          <div style={{ color: "#E8E3D8", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Profile</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ color: "#A89F8C", fontSize: 12, marginBottom: 6 }}>Full Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", background: "#201C14", border: "1px solid #3A3428", borderRadius: 10, padding: "10px 14px", color: "#F2EFE9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ color: "#A89F8C", fontSize: 12, marginBottom: 6 }}>Email</div>
              <input value={user?.email || ""} disabled
                style={{ width: "100%", background: "#201C14", border: "1px solid #2C2820", borderRadius: 10, padding: "10px 14px", color: "#8C8575", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ color: "#A89F8C", fontSize: 12, marginBottom: 8 }}>System Role</div>
              <RoleBadge role={user?.systemRole} />
            </div>
            <button onClick={save}
              style={{ background: saved ? "#5C8F6E" : "#C98A3E", color: "#F2EFE9", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 7 }}>
              {saved ? <><Check size={14} /> Saved!</> : "Save Changes"}
            </button>
          </div>
        </div>

        <div style={{ background: "#1D1A15", border: "1px solid #2C2820", borderRadius: 14, padding: 28 }}>
          <div style={{ color: "#E8E3D8", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Organization Logo</div>
          <div style={{ color: "#8C8575", fontSize: 12, marginBottom: 20 }}>
            Stored in S3 via a presigned upload URL — the file never passes through our server.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12, background: "#201C14",
              border: "1px solid #3A3428", display: "flex", alignItems: "center",
              justifyContent: "center", overflow: "hidden", flexShrink: 0,
            }}>
              {logoUrl
                ? <img src={logoUrl} alt="Org logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <Upload size={18} color="#8C8575" />}
            </div>

            <label style={{
              background: "#C98A3E", color: "#F2EFE9", border: "none", borderRadius: 10,
              padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: uploading ? "default" : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}>
              {uploading ? "Uploading..." : "Upload logo"}
              <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading}
                style={{ display: "none" }} />
            </label>

            {uploadMsg && (
              <span style={{ color: uploadMsg.includes("!") ? "#6FA287" : "#C4665A", fontSize: 13 }}>
                {uploadMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;