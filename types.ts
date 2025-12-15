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
  workStartTime: string; // "09:00"
  workEndTime: string;   // "19:00"
  workDays: number[];    // [0, 1, 2, 3, 4, 5, 6] where 0 is Sunday
}