import QueueTable from "@/components/admin/QueueTable";

export default function AdminPublishedQueuePage() {
  return (
    <QueueTable
      status="PUBLISHED"
      title="Yayınlananlar"
      description="AI tarafından işlenip yayına alınan haberler"
    />
  );
}
