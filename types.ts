export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID'
}

export enum PaymentMethod {
  CASH = 'CASH',
  PIX = 'PIX',
  CARD = 'CARD',
  OTHER = 'OTHER'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  createdAt: number;
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceIds: string[]; // Changed from single serviceId to array
  date: string; // ISO Date String YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  price: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface DailyStats {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
}

export interface BarberSettings {
  shopName: string;
  shopPhone: string;
}