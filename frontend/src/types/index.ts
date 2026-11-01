export type Language = 'en' | 'hi' | 'gu';
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatResponse {
  reply: string;
  source: 'ollama_ai' | 'gemini_ai';
  model: string;
  missing_fields: string[];
  event_input: EventCreateInput | null;
}
export type ServiceBundle = 'hospitality' | 'travel' | 'registration' | 'hybrid' | 'coordination';
export interface FeedbackInput { author: string; rating: number; comment: string }
export interface FeedbackRecord extends FeedbackInput { id: string; event_id: string; created_at: string }
export interface FeedbackSummary { entries: FeedbackRecord[]; total: number; average_rating: number | null }

export type RsvpStatus = 'pending' | 'confirmed' | 'declined';
export interface GuestInput {
  name: string;
  phone: string;
  party_size: number;
  rsvp_status: RsvpStatus;
  dietary_requirements: string;
  notes: string;
}
export interface GuestRecord extends GuestInput { id: string; event_id: string }
export interface GuestSummary {
  guests: GuestRecord[];
  invited_people: number;
  confirmed_people: number;
  pending_people: number;
  declined_people: number;
  planned_capacity: number;
}

export type EventType = 'wedding' | 'birthday' | 'community' | 'other';
export type VenueStatus = 'not_booked' | 'shortlisted' | 'booked';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both' | 'flexible';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type VendorStatus = 'not_contacted' | 'contacted' | 'quoted' | 'booked' | 'rejected';

export interface ScheduleItem {
  time_slot: string;
  activity: string;
  notes?: string;
}

export interface EventItem {
  id: string;
  name: string;
  event_type: EventType;
  date?: string | null;
  city: string;
  venue_status: VenueStatus;
  guest_count: number;
  total_budget: number;
  currency: string;
  language: Language;
  theme_preference?: string | null;
  dietary_requirements?: string | null;
  indoor_outdoor: IndoorOutdoor;
  additional_notes?: string | null;

  // AI Plan details
  event_summary?: string | null;
  theme_concept?: string | null;
  weather_contingency?: string | null;
  guest_experience_ideas: string[];
  prep_steps: string[];
  event_day_schedule: ScheduleItem[];
  plan_source: 'none' | 'gemini_ai' | 'ollama_ai' | 'rules_fallback';
  plan_generated_at?: string | null;

  // Stats
  total_tasks: number;
  completed_tasks: number;
  task_completion_percentage: number;
  budget_total_estimated: number;
  budget_total_actual: number;
  budget_remaining: number;
  is_over_budget: boolean;

  created_at: string;
  updated_at: string;
}

export interface EventListItem {
  id: string;
  name: string;
  event_type: EventType;
  date?: string | null;
  city: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  language: Language;
  plan_source: string;
  total_tasks: number;
  completed_tasks: number;
  task_completion_percentage: number;
  budget_total_estimated: number;
  budget_total_actual: number;
  created_at: string;
  updated_at: string;
}

export interface EventCreateInput {
  name: string;
  event_type: EventType;
  date?: string;
  city: string;
  venue_status: VenueStatus;
  guest_count: number;
  total_budget: number;
  currency: string;
  language: Language;
  theme_preference?: string;
  dietary_requirements?: string;
  indoor_outdoor: IndoorOutdoor;
  additional_notes?: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  item_name: string;
  estimated_amount: number;
  actual_amount: number;
  notes?: string | null;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryBreakdown {
  category: string;
  estimated_total: number;
  actual_total: number;
  percentage_of_budget: number;
  item_count: number;
}

export interface BudgetSummary {
  event_id: string;
  currency: string;
  total_budget: number;
  total_estimated: number;
  total_actual: number;
  remaining_budget: number;
  is_over_budget: boolean;
  over_budget_amount: number;
  categories: CategoryBreakdown[];
  items: BudgetItem[];
}

export interface TaskItem {
  id: string;
  event_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  milestone_phase: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TasksListResponse {
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  tasks: TaskItem[];
}

export interface VendorRecord {
  id: string;
  event_id: string;
  category: string;
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  estimated_quote: number;
  actual_quote: number;
  status: VendorStatus;
  notes?: string | null;
  selection_criteria?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorsListResponse {
  total_vendors: number;
  booked_vendors: number;
  vendors: VendorRecord[];
}

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database: string;
  ai_engine: {
    has_credentials: boolean;
    provider: string;
    model: string;
    fallback_ready: boolean;
  };
}
