export type ListingStatus = "for_sale" | "investment" | "off_market" | "sold";
export type ListingCategory = "residential" | "multifamily" | "development";
export type ArticleCategory =
  | "southern-california"
  | "national"
  | "rates"
  | "development"
  | "alternative-construction"
  | "architectural-spotlight";

export interface Listing {
  id: string;
  title: string;
  slug: string;
  status: ListingStatus;
  category: ListingCategory;
  price_cents: number | null;
  price_display: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  acres: number | null;
  units: number | null;
  location: string;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[];
  featured: boolean;
  featured_headline: string | null;
  featured_excerpt: string | null;
  featured_focal: string | null;
  sort_order: number;
  published: boolean;
  homepage_elsewhere: boolean;
  homepage_elsewhere_order: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleBlockBase {
  id: string;
}

export interface HeadingBlock extends ArticleBlockBase {
  type: "heading";
  text: string;
}

export interface TextBlock extends ArticleBlockBase {
  type: "text";
  text: string;
}

export interface ImageBlock extends ArticleBlockBase {
  type: "image";
  url: string;
  caption: string;
  focal: string;
}

export interface ImageTextBlock extends ArticleBlockBase {
  type: "image_text";
  url: string;
  side: "left" | "right";
  text: string;
}

export interface TwoColumnTextBlock extends ArticleBlockBase {
  type: "two_column_text";
  left: string;
  right: string;
}

export interface QuoteBlock extends ArticleBlockBase {
  type: "quote";
  text: string;
  attribution: string;
}

export interface StatBlock extends ArticleBlockBase {
  type: "stat";
  value: string;
  label: string;
}

export interface GalleryBlock extends ArticleBlockBase {
  type: "gallery";
  urls: string[];
}

export interface DividerBlock extends ArticleBlockBase {
  type: "divider";
}

export type ArticleBlock =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ImageTextBlock
  | TwoColumnTextBlock
  | QuoteBlock
  | StatBlock
  | GalleryBlock
  | DividerBlock;

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  tags: string[];
  excerpt: string | null;
  body: string | null;
  blocks: ArticleBlock[];
  image_url: string | null;
  image_caption: string | null;
  image_position: string | null;
  read_time: string | null;
  is_feature_story: boolean;
  is_market_report: boolean;
  featured: boolean;
  architectural_feature: boolean;
  eyebrow: string | null;
  stat: string | null;
  secondary_stat: string | null;
  annotation: string | null;
  metadata: string | null;
  cta_label: string | null;
  published: boolean;
  on_my_radar: boolean;
  homepage_elsewhere: boolean;
  homepage_elsewhere_order: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingRow<T> {
  key: string;
  value: T;
  updated_at: string;
}

export interface HeroSettings {
  headline: string;
  subhead: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  image_url: string;
  location_label: string;
  dateline: string;
}

export interface MarketChartSettings {
  years: number[];
  households: number[];
  housing_units: number[];
  source_note: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export interface AboutSettings {
  quote: string;
  name: string;
  headshot_url: string;
  portrait_url: string;
  location_label: string;
  handwritten_note: string;
  bio: string;
  // About page — real headshot (small byline photo, distinct from the
  // illustrated headshot_url used elsewhere on the site)
  headshot_photo_url: string;
  // About page — editorial photo slots. Each is admin-supplied; the site
  // never sources or generates imagery for these. focal is a CSS
  // object-position value (e.g. "50% 40%") so a supplied photo can be
  // recropped without re-exporting the file.
  opening_photo_url: string;
  opening_photo_caption: string;
  opening_photo_focal: string;
  community_photo_url: string;
  community_photo_caption: string;
  community_photo_focal: string;
  travel_photo_1_url: string;
  travel_photo_1_caption: string;
  travel_photo_1_focal: string;
  travel_photo_2_url: string;
  travel_photo_2_caption: string;
  travel_photo_2_focal: string;
  travel_photo_3_url: string;
  travel_photo_3_caption: string;
  travel_photo_3_focal: string;
}

export interface NewsletterSettings {
  image_url: string;
  tagline_line1: string;
  tagline_line2: string;
  heading: string;
  subhead: string;
}

export interface ContactSettings {
  city_state: string;
  dre_number: string;
  instagram_url: string;
  linkedin_url: string;
  email: string;
  phone?: string;
  name?: string;
  photo_url?: string;
  photo_caption?: string;
  handwritten_note?: string;
}

export type ClientStatus =
  | "lead"
  | "active"
  | "under_contract"
  | "past_client"
  | "lost";
export type ClientType = "buyer" | "seller" | "investor" | "other";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  client_type: ClientType;
  timeline: string | null;
  next_follow_up_date: string | null;
  last_contacted_at: string | null;
  notes: string | null;
  source: string | null;
  contact_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyBox {
  id: string;
  client_id: string;
  label: string;
  property_type: string | null;
  min_price_cents: number | null;
  max_price_cents: number | null;
  beds_min: number | null;
  baths_min: number | null;
  areas: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  body: string;
  outcome: string | null;
  next_follow_up_date: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  intent: string | null;
  context: string | null;
  source: string | null;
  timeline: string | null;
  created_at: string;
}

export type PipelineStage =
  | "sourced"
  | "researching"
  | "contacted"
  | "negotiating"
  | "under_contract"
  | "closed"
  | "dead";

export interface DealCompany {
  id: string;
  name: string;
  website: string | null;
  pipeline_stage: PipelineStage;
  heat_score: number | null;
  next_action_date: string | null;
  next_action_type: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealProperty {
  id: string;
  company_id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  property_type: string | null;
  units: number | null;
  year_built: number | null;
  total_sf: number | null;
  lot_size_acres: number | null;
  occupancy_current: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealFinancials {
  property_id: string;
  purchase_price: number | null;
  gross_revenue: number | null;
  operating_expenses: number | null;
  exit_cap_rate: number | null;
  hold_period_years: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealContact {
  id: string;
  company_id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  is_decision_maker: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealCallLog {
  id: string;
  company_id: string;
  contact_id: string | null;
  outcome: string | null;
  notes: string | null;
  next_action_date: string | null;
  next_action_type: string | null;
  called_at: string;
  created_at: string;
}

export type GoalCategory = "business" | "personal";

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  target_metric: string | null;
  period_start: string;
  period_end: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GoalWeeklyTarget {
  id: string;
  goal_id: string;
  week_number: number;
  target_text: string;
  created_at: string;
  updated_at: string;
}

export interface GoalDailyCheck {
  id: string;
  goal_id: string;
  check_date: string;
  completed: boolean;
  created_at: string;
}

export interface DailyBriefArticle {
  title: string;
  url: string;
  source: string;
  summary: string;
}

export interface DailyBrief {
  id: string;
  brief_date: string;
  headline: string | null;
  articles: DailyBriefArticle[];
  deep_report: DailyBriefArticle | null;
  call_summary: string | null;
  created_at: string;
}

export interface ScheduleBlock {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type TodoStatus = "pending" | "done";

export interface Todo {
  id: string;
  title: string;
  notes: string | null;
  status: TodoStatus;
  goal_id: string | null;
  assigned_block_id: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MarketReadSourceType = "feed" | "manual";

export interface MarketRead {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  image_url: string | null;
  theme: string | null;
  published_at: string | null;
  fetched_at: string;
  kept: boolean;
  key_points: string[] | null;
  why_it_matters: string | null;
  source_type: MarketReadSourceType;
}
