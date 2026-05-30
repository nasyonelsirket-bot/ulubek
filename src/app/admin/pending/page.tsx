import QueueTable from "@/components/admin/QueueTable";

export default function AdminPendingPage() {
  return (
    <QueueTable
      status="PENDING"
      title="Yayın Bekleyenler"
      description="AI işleme aşamasındaki haberler"
    />
  );
}
