export type ClientType = "owner" | "agency" | "direct";

export type AdminBooking = {
  id: string;
  user_id: string;
  user_email: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  creative_url?: string | null;
  client_name?: string | null;
  client_company?: string | null;
  client_type?: ClientType;
};

export type AdminBillboard = {
  id: string;
  name: string;
  city: string;
  type: string;
  ots: string;
  price: number;
  status: string;
  lat: number;
  lng: number;
  image_url?: string | null;
};

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: string;
  client_type: ClientType;
  created_at: string;
  total_spent: number;
  booking_count: number;
};

export type AdminStats = {
  totalRevenue: number;
  pendingCount: number;
  confirmedCount: number;
  totalBookings: number;
  activeScreens: number;
  totalClients: number;
};
