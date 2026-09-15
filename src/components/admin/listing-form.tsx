import {
  GalleryUploader,
  SingleImageUploader,
} from "@/components/admin/image-uploader";
import { upsertListing } from "@/app/admin/(dashboard)/listings/actions";
import type { Listing } from "@/lib/types";

export default function ListingForm({ listing }: { listing?: Listing }) {
  return (
    <form action={upsertListing} className="flex flex-col gap-6">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-navy">Title</label>
          <input
            name="title"
            defaultValue={listing?.title}
            required
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">
            Slug (auto-generated if left blank)
          </label>
          <input
            name="slug"
            defaultValue={listing?.slug}
            placeholder="leucadia-view-home"
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-navy">Status</label>
          <select
            name="status"
            defaultValue={listing?.status ?? "for_sale"}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="for_sale">For Sale</option>
            <option value="investment">Investment</option>
            <option value="off_market">Off Market</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Category</label>
          <select
            name="category"
            defaultValue={listing?.category ?? "residential"}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="residential">Residential</option>
            <option value="multifamily">Multifamily</option>
            <option value="development">Development</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Sort Order</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={listing?.sort_order ?? 0}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-navy">
            Price (USD, optional)
          </label>
          <input
            type="number"
            step="1"
            name="price_dollars"
            defaultValue={
              listing?.price_cents != null
                ? listing.price_cents / 100
                : undefined
            }
            placeholder="1250000"
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">
            Price Display Override
          </label>
          <input
            name="price_display"
            defaultValue={listing?.price_display ?? ""}
            placeholder="Contact for Details"
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <div>
          <label className="text-sm font-medium text-navy">Beds</label>
          <input
            type="number"
            step="0.5"
            name="beds"
            defaultValue={listing?.beds ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Baths</label>
          <input
            type="number"
            step="0.5"
            name="baths"
            defaultValue={listing?.baths ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Sqft</label>
          <input
            type="number"
            name="sqft"
            defaultValue={listing?.sqft ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Acres</label>
          <input
            type="number"
            step="0.01"
            name="acres"
            defaultValue={listing?.acres ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Units</label>
          <input
            type="number"
            name="units"
            defaultValue={listing?.units ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-navy">Location</label>
        <input
          name="location"
          defaultValue={listing?.location}
          required
          placeholder="Leucadia, San Diego"
          className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-navy">Description</label>
        <textarea
          name="description"
          defaultValue={listing?.description ?? ""}
          rows={5}
          className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
        />
      </div>

      <SingleImageUploader
        name="image_url"
        label="Primary Image"
        initialUrl={listing?.image_url}
      />

      <GalleryUploader
        name="gallery_urls"
        label="Gallery Images"
        initialUrls={listing?.gallery_urls ?? []}
      />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={listing?.featured}
          />
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

      <button
        type="submit"
        className="self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy-dark"
      >
        {listing ? "Save Changes" : "Create Listing"}
      </button>
    </form>
  );
}
