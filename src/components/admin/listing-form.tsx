import {
  GalleryUploader,
  SingleImageUploader,
} from "@/components/admin/image-uploader";
import { btnPrimary, input, label, select, textarea } from "@/components/admin/ui";
import { upsertListing } from "@/app/admin/(dashboard)/listings/actions";
import type { Listing } from "@/lib/types";

export default function ListingForm({ listing }: { listing?: Listing }) {
  return (
    <form action={upsertListing} className="flex flex-col gap-8">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Title</label>
          <input name="title" defaultValue={listing?.title} required className={input} />
        </div>
        <div>
          <label className={label}>Slug (auto-generated if left blank)</label>
          <input
            name="slug"
            defaultValue={listing?.slug}
            placeholder="leucadia-view-home"
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Status</label>
          <select name="status" defaultValue={listing?.status ?? "for_sale"} className={select}>
            <option value="for_sale">For Sale</option>
            <option value="investment">Investment</option>
            <option value="off_market">Off Market</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div>
          <label className={label}>Category</label>
          <select
            name="category"
            defaultValue={listing?.category ?? "residential"}
            className={select}
          >
            <option value="residential">Residential</option>
            <option value="multifamily">Multifamily</option>
            <option value="development">Development</option>
          </select>
        </div>
        <div>
          <label className={label}>Sort Order</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={listing?.sort_order ?? 0}
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Price (USD, optional)</label>
          <input
            type="number"
            step="1"
            name="price_dollars"
            defaultValue={
              listing?.price_cents != null ? listing.price_cents / 100 : undefined
            }
            placeholder="1250000"
            className={input}
          />
        </div>
        <div>
          <label className={label}>Price Display Override</label>
          <input
            name="price_display"
            defaultValue={listing?.price_display ?? ""}
            placeholder="Contact for Details"
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <div>
          <label className={label}>Beds</label>
          <input type="number" step="0.5" name="beds" defaultValue={listing?.beds ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Baths</label>
          <input type="number" step="0.5" name="baths" defaultValue={listing?.baths ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Sqft</label>
          <input type="number" name="sqft" defaultValue={listing?.sqft ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Acres</label>
          <input type="number" step="0.01" name="acres" defaultValue={listing?.acres ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Units</label>
          <input type="number" name="units" defaultValue={listing?.units ?? ""} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Location</label>
        <input
          name="location"
          defaultValue={listing?.location}
          required
          placeholder="Leucadia, San Diego"
          className={input}
        />
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea
          name="description"
          defaultValue={listing?.description ?? ""}
          rows={5}
          className={textarea}
        />
      </div>

      <SingleImageUploader name="image_url" label="Primary Image" initialUrl={listing?.image_url} />

      <GalleryUploader
        name="gallery_urls"
        label="Gallery Images"
        initialUrls={listing?.gallery_urls ?? []}
      />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" name="featured" defaultChecked={listing?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="published"
            defaultChecked={listing ? listing.published : true}
          />
          Published
        </label>
      </div>

      <div className="border-t border-sand pt-8">
        <p className="eyebrow text-gold">Homepage (/) — Elsewhere</p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              name="homepage_elsewhere"
              defaultChecked={listing?.homepage_elsewhere}
            />
            Show as a homepage cover line
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            Order
            <input
              type="number"
              name="homepage_elsewhere_order"
              defaultValue={listing?.homepage_elsewhere_order ?? 0}
              className="w-16 border border-navy/15 bg-white px-2 py-1 text-sm"
            />
          </label>
        </div>
      </div>

      <button type="submit" className={`self-start ${btnPrimary}`}>
        {listing ? "Save Changes" : "Create Listing"}
      </button>
    </form>
  );
}
