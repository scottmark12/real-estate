import { SingleImageUploader } from "@/components/admin/image-uploader";
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_MARKET_CHART,
  DEFAULT_NEWSLETTER,
  DEFAULT_SERVICES,
  getSetting,
} from "@/lib/settings";
import type {
  AboutSettings,
  ContactSettings,
  HeroSettings,
  MarketChartSettings,
  NewsletterSettings,
  ServiceItem,
} from "@/lib/types";
import {
  updateAbout,
  updateContact,
  updateHero,
  updateMarketChart,
  updateNewsletter,
  updateServices,
} from "./actions";

export const revalidate = 0;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sand bg-white/70 p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-navy">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-navy">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}

function SaveButton() {
  return (
    <button
      type="submit"
      className="mt-5 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-dark"
    >
      Save
    </button>
  );
}

export default async function AdminSettingsPage() {
  const [hero, marketChart, services, about, newsletter, contact] =
    await Promise.all([
      getSetting<HeroSettings>("hero", DEFAULT_HERO),
      getSetting<MarketChartSettings>("market_chart", DEFAULT_MARKET_CHART),
      getSetting<ServiceItem[]>("services", DEFAULT_SERVICES),
      getSetting<AboutSettings>("about", DEFAULT_ABOUT),
      getSetting<NewsletterSettings>("newsletter", DEFAULT_NEWSLETTER),
      getSetting<ContactSettings>("contact", DEFAULT_CONTACT),
    ]);

  const servicesPadded = [...services];
  while (servicesPadded.length < 3) {
    servicesPadded.push({ title: "", description: "", href: "", icon: "" });
  }

  return (
    <div>
      <p className="eyebrow text-gold">Settings</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Site Settings
      </h1>
      <p className="mt-2 text-navy/60">
        These sections control the homepage and site-wide copy. Changes go
        live immediately.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        <Section title="Hero">
          <form action={updateHero} className="flex flex-col gap-4">
            <Field label="Headline" name="headline" defaultValue={hero.headline} />
            <Field
              label="Subhead"
              name="subhead"
              defaultValue={hero.subhead}
              textarea
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Primary CTA Label"
                name="cta_primary_label"
                defaultValue={hero.cta_primary_label}
              />
              <Field
                label="Primary CTA Link"
                name="cta_primary_href"
                defaultValue={hero.cta_primary_href}
              />
              <Field
                label="Secondary CTA Label"
                name="cta_secondary_label"
                defaultValue={hero.cta_secondary_label}
              />
              <Field
                label="Secondary CTA Link"
                name="cta_secondary_href"
                defaultValue={hero.cta_secondary_href}
              />
              <Field
                label="Location Label"
                name="location_label"
                defaultValue={hero.location_label}
              />
              <Field label="Dateline" name="dateline" defaultValue={hero.dateline} />
            </div>
            <SingleImageUploader
              name="image_url"
              label="Background Image"
              initialUrl={hero.image_url}
            />
            <SaveButton />
          </form>
        </Section>

        <Section title="Market Chart">
          <form action={updateMarketChart} className="flex flex-col gap-4">
            <Field
              label="Years (comma-separated)"
              name="years"
              defaultValue={marketChart.years.join(", ")}
            />
            <Field
              label="Households (comma-separated, thousands)"
              name="households"
              defaultValue={marketChart.households.join(", ")}
            />
            <Field
              label="Housing Units (comma-separated, thousands)"
              name="housing_units"
              defaultValue={marketChart.housing_units.join(", ")}
            />
            <Field
              label="Source Note"
              name="source_note"
              defaultValue={marketChart.source_note}
              textarea
            />
            <SaveButton />
          </form>
        </Section>

        <Section title="How I Can Help (Services)">
          <form action={updateServices} className="flex flex-col gap-6">
            {servicesPadded.map((service, i) => (
              <div key={i} className="rounded-xl border border-sand p-4">
                <p className="eyebrow text-navy/40">Column {i + 1}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Title"
                    name={`service_${i}_title`}
                    defaultValue={service.title}
                  />
                  <Field
                    label="Link"
                    name={`service_${i}_href`}
                    defaultValue={service.href}
                  />
                </div>
                <div className="mt-3">
                  <Field
                    label="Description"
                    name={`service_${i}_description`}
                    defaultValue={service.description}
                    textarea
                  />
                </div>
              </div>
            ))}
            <SaveButton />
          </form>
        </Section>

        <Section title="About / Pull Quote">
          <form action={updateAbout} className="flex flex-col gap-4">
            <Field label="Name" name="name" defaultValue={about.name} />
            <Field
              label="Quote"
              name="quote"
              defaultValue={about.quote}
              textarea
            />
            <SingleImageUploader
              name="headshot_url"
              label="Headshot"
              initialUrl={about.headshot_url}
            />
            <SaveButton />
          </form>
        </Section>

        <Section title="Newsletter Band">
          <form action={updateNewsletter} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Tagline Line 1"
                name="tagline_line1"
                defaultValue={newsletter.tagline_line1}
              />
              <Field
                label="Tagline Line 2"
                name="tagline_line2"
                defaultValue={newsletter.tagline_line2}
              />
            </div>
            <Field label="Heading" name="heading" defaultValue={newsletter.heading} />
            <Field
              label="Subhead"
              name="subhead"
              defaultValue={newsletter.subhead}
              textarea
            />
            <SingleImageUploader
              name="image_url"
              label="Background Image"
              initialUrl={newsletter.image_url}
            />
            <SaveButton />
          </form>
        </Section>

        <Section title="Contact & Footer">
          <form action={updateContact} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" defaultValue={contact.name ?? ""} />
              <Field
                label="City, State"
                name="city_state"
                defaultValue={contact.city_state}
              />
              <Field
                label="DRE Number"
                name="dre_number"
                defaultValue={contact.dre_number}
              />
              <Field label="Email" name="email" defaultValue={contact.email} />
              <Field label="Phone" name="phone" defaultValue={contact.phone ?? ""} />
              <Field
                label="Instagram URL"
                name="instagram_url"
                defaultValue={contact.instagram_url}
              />
              <Field
                label="LinkedIn URL"
                name="linkedin_url"
                defaultValue={contact.linkedin_url}
              />
            </div>
            <p className="mt-2 text-xs text-navy/50">
              City/state, DRE number, email and phone above are still
              placeholder values — replace them with your real details
              whenever you have them.
            </p>
            <SingleImageUploader
              name="photo_url"
              label="Contact Page Photograph"
              initialUrl={contact.photo_url}
            />
            <Field
              label="Photo Caption"
              name="photo_caption"
              placeholder="e.g. Encinitas · 4:37 PM"
              defaultValue={contact.photo_caption ?? ""}
            />
            <Field
              label="Handwritten Note"
              name="handwritten_note"
              defaultValue={contact.handwritten_note ?? ""}
            />
            <SaveButton />
          </form>
        </Section>
      </div>
    </div>
  );
}
