import CompanyForm from "@/components/admin/company-form";

export default function NewDealCompanyPage() {
  return (
    <div>
      <p className="eyebrow text-gold">Deals</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        New Company
      </h1>
      <div className="mt-8">
        <CompanyForm />
      </div>
    </div>
  );
}
