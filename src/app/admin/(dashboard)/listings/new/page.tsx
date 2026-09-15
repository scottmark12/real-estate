import ListingForm from "@/components/admin/listing-form";

export default function NewListingPage() {
  return (
    <div>
      <p className="eyebrow text-gold">Listings</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        New Listing
      </h1>
      <div className="mt-8">
        <ListingForm />
      </div>
    </div>
  );
}
