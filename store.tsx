import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Client, Service, Appointment, AppointmentStatus, PaymentStatus } from './types';
import { generateId, getTodayDateString } from './utils';

interface AppContextType {
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
  getClientById: (id: string) => Client | undefined;
  getServiceById: (id: string) => Service | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLIENTS: 'barber_clients',
  SERVICES: 'barber_services',
  APPOINTMENTS: 'barber_appointments'
};

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte Cabelo', durationMinutes: 30, price: 35 },
  { id: '2', name: 'Barba', durationMinutes: 20, price: 25 },
  { id: '3', name: 'Combo (Corte + Barba)', durationMinutes: 50, price: 50 },
  { id: '4', name: 'Sobrancelha', durationMinutes: 10, price: 10 },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load data
  useEffect(() => {
    const loadedClients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
    const loadedServices = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    const loadedAppointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');

    setClients(loadedClients);
    setServices(loadedServices.length > 0 ? loadedServices : INITIAL_SERVICES);
    setAppointments(loadedAppointments);
  }, []);

  // Persist data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  // Client Actions
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...data,
      id: generateId(),
      createdAt: Date.now()
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = (id: string) => {
    // Check constraints: prevent delete if has active appointments? For MVP, just delete.
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Service Actions
  const addService = (data: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...data,
      id: generateId()
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Appointment Actions
  const addAppointment = (data: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newApt: Appointment = {
      ...data,
      id: generateId(),
      createdAt: Date.now()
    };
    setAppointments(prev => [...prev, newApt]);
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments
      .filter(a => a.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getClientById = (id: string) => clients.find(c => c.id === id);
  const getServiceById = (id: string) => services.find(s => s.id === id);

  return (
    <AppContext.Provider value={{
      clients,
      services,
      appointments,
      addClient,
      updateClient,
      deleteClient,
      addService,
      updateService,
      deleteService,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointmentsByDate,
      getClientById,
      getServiceById
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};