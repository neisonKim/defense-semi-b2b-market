import AdminCMSClient from "./AdminCMSClient";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default function AdminPage() {
  return (
    <>
      <AdminLogoutButton />
      <AdminCMSClient />
    </>
  );
}
