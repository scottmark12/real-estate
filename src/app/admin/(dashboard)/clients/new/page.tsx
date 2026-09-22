import ClientForm from "@/components/admin/client-form";

export default function NewClientPage() {
  return (
    <div>
      <p className="eyebrow text-gold">Clients</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        New Client
      </h1>
      <div className="mt-8">
        <ClientForm />
      </div>
    </div>
  );
}
