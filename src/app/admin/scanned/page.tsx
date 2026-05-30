import QueueTable from "@/components/admin/QueueTable";

export default function AdminScannedPage() {
  return (
    <QueueTable
      status="SCANNED"
      title="Taranan Haberler"
      description="Kaynak sitelerden yeni tespit edilen haberler"
    />
  );
}
