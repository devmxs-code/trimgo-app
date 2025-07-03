import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, User, Phone, Scissors, CheckCircle, ArrowLeft, 
  MapPin, Star, Users, ChevronRight, Info, Shield, CreditCard, 
  Smile, Frown, Bookmark, Settings, LogOut, BarChart2, Gift,
  X, Map, Search
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  category: string;
  popularity: number;
}

interface Barber {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  photo: string;
  availableDays: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  barberId?: string;
}

const TrimGo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'services' | 'barbers' | 'datetime' | 'client' | 'confirmation' | 'profile'
  >('welcome');
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [isBookingConfirmed, setIsBookingConfirmed] = useState<boolean>(false);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'services' | 'barbers' | 'info'>('services');
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'login' | 'register'>('login');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showMap, setShowMap] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dados de exemplo
  const services: Service[] = [
    { 
      id: '1', 
      name: 'Corte Clássico', 
      duration: 30, 
      price: 45, 
      description: 'Corte tradicional com tesoura e máquina, finalizado com acabamento perfeito',
      category: 'cabelo',
      popularity: 4.8
    },
    { 
      id: '2', 
      name: 'Corte + Barba', 
      duration: 45, 
      price: 65, 
      description: 'Combo completo com corte e barba alinhada com navalha',
      category: 'combo',
      popularity: 4.9
    },
    { 
      id: '3', 
      name: 'Barba Premium', 
      duration: 25, 
      price: 35, 
      description: 'Barba desenhada com produtos premium e toalha quente',
      category: 'barba',
      popularity: 4.7
    },
    { 
      id: '4', 
      name: 'Tratamento VIP', 
      duration: 60, 
      price: 90, 
      description: 'Corte + Barba + Sobrancelha + Hidratação Capilar',
      category: 'combo',
      popularity: 5.0
    },
    { 
      id: '5', 
      name: 'Corte Infantil', 
      duration: 25, 
      price: 30, 
      description: 'Corte especial para crianças com ambiente lúdico',
      category: 'cabelo',
      popularity: 4.5
    },
    { 
      id: '6', 
      name: 'Sobrancelha', 
      duration: 15, 
      price: 20, 
      description: 'Design de sobrancelha com pinça ou navalha',
      category: 'estetica',
      popularity: 4.3
    },
    { 
      id: '7', 
      name: 'Pigmentação', 
      duration: 40, 
      price: 80, 
      description: 'Pigmentação de barba para preencher falhas',
      category: 'estetica',
      popularity: 4.6
    },
    { 
      id: '8', 
      name: 'Relaxamento', 
      duration: 35, 
      price: 70, 
      description: 'Relaxamento capilar para cabelos crespos ou ondulados',
      category: 'tratamento',
      popularity: 4.4
    }
  ];

  const barbers: Barber[] = [
    {
      id: '1',
      name: 'Marcos Silva',
      specialty: 'Cortes Clássicos',
      rating: 4.9,
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      availableDays: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira']
    },
    {
      id: '2',
      name: 'Ricardo Almeida',
      specialty: 'Barba e Estilo',
      rating: 4.8,
      photo: 'https://randomuser.me/api/portraits/men/44.jpg',
      availableDays: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira']
    },
    {
      id: '3',
      name: 'Carlos Gomes',
      specialty: 'Cortes Modernos',
      rating: 4.7,
      photo: 'https://randomuser.me/api/portraits/men/22.jpg',
      availableDays: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira']
    },
    {
      id: '4',
      name: 'Fernando Costa',
      specialty: 'Tratamentos',
      rating: 4.9,
      photo: 'https://randomuser.me/api/portraits/men/65.jpg',
      availableDays: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira']
    }
  ];

  const categories = ['Todos', 'Cabelo', 'Barba', 'Combo', 'Estética', 'Tratamento'];

  const operatingHours = {
    weekdays: { open: '09:00', close: '20:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '10:00', close: '16:00' }
  };

  const getCurrentStatus = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    const dayOfWeek = now.getDay();
    
    let hours;
    if (dayOfWeek === 0) { // Domingo
      hours = operatingHours.sunday;
    } else if (dayOfWeek === 6) { // Sábado
      hours = operatingHours.saturday;
    } else { // Segunda a sexta
      hours = operatingHours.weekdays;
    }
    
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    const isOpen = currentTime >= openTime && currentTime < closeTime;
    
    return {
      isOpen,
      hours: `${hours.open} - ${hours.close}`,
      status: isOpen ? 'ABERTO AGORA' : 'FECHADO',
      nextOpening: isOpen ? null : 
        dayOfWeek === 6 ? operatingHours.sunday.open : 
        dayOfWeek === 0 ? operatingHours.weekdays.open : 
        hours.open
    };
  }, [operatingHours.weekdays, operatingHours.saturday, operatingHours.sunday]);

  const [currentStatus, setCurrentStatus] = useState(getCurrentStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStatus(getCurrentStatus());
    }, 60000);

    return () => clearInterval(timer);
  }, [getCurrentStatus]);

  const generateTimeSlots = (): TimeSlot[] => {
    if (!selectedBarber) return [];
    
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 19;
    const interval = 30; // minutos
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotKey = `${selectedDate}-${timeString}-${selectedBarber.id}`;
        
        slots.push({
          time: timeString,
          available: !bookedSlots.has(slotKey),
          barberId: selectedBarber.id
        });
      }
    }
    
    return slots;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    // Verifica se é hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(dateString);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate.getTime() === today.getTime()) {
      return `Hoje, ${date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    
    // Verifica se é amanhã
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (inputDate.getTime() === tomorrow.getTime()) {
      return `Amanhã, ${date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    
    return date.toLocaleDateString('pt-BR', options);
  };

  const sendWhatsAppMessage = () => {
    const message = `✂️ *TrimGo - Confirmação de Agendamento* ✂️

📅 *Data:* ${formatDate(selectedDate)}
⏰ *Horário:* ${selectedTime}
💈 *Barbeiro:* ${selectedBarber?.name}
✂️ *Serviço:* ${selectedService?.name}
💰 *Valor:* R$ ${selectedService?.price}
👤 *Cliente:* ${clientName}
📱 *Telefone:* ${clientPhone}

📍 *Localização:*
Rua das Barbearias, 123 - Centro
Caraguatatuba - SP

💡 *Instruções:*
- Chegue 5 minutos antes do horário
- Traga seu comprovante de agendamento
- Cancelamentos com 2h de antecedência

Agradecemos sua preferência!`;

    const phoneNumber = "5512999999999";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    const slotKey = `${selectedDate}-${selectedTime}-${selectedBarber?.id}`;
    setBookedSlots(prev => new Set(prev).add(slotKey));
    
    window.open(whatsappUrl, '_blank');
    setIsBookingConfirmed(true);
  };

  const resetBooking = () => {
    setCurrentStep('services');
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setIsBookingConfirmed(false);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setActiveTab('barbers');
  };

  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber);
    setCurrentStep('datetime');
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'Todos' || service.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderWelcome = () => (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <div className="w-full h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative h-full flex flex-col items-center justify-center p-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mt-4">TrimGo</h1>
            <p className="text-white text-opacity-90 text-lg">Agendamento inteligente para barbearias</p>
          </div>
        </div>
      </div>
  
      {/* Status Card */}
      <div className={`p-5 rounded-xl shadow-md ${currentStatus.isOpen ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${currentStatus.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {currentStatus.isOpen ? <Smile className="w-6 h-6" /> : <Frown className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">{currentStatus.isOpen ? 'Estamos abertos!' : 'Estamos fechados'}</h3>
              <p className="text-sm">Horário: {currentStatus.hours}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${currentStatus.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {currentStatus.status}
          </div>
        </div>
        {!currentStatus.isOpen && currentStatus.nextOpening && (
          <p className="text-sm mt-2 text-gray-600">Abre às {currentStatus.nextOpening}</p>
        )}
      </div>
  
      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Agendamento 24h</h3>
          <p className="text-xs text-gray-500">Reserve a qualquer momento</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Profissionais</h3>
          <p className="text-xs text-gray-500">Especialistas certificados</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Segurança</h3>
          <p className="text-xs text-gray-500">Protocolos rigorosos</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Fidelidade</h3>
          <p className="text-xs text-gray-500">Programa de benefícios</p>
        </div>
      </div>
  
      {/* CTA Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => setCurrentStep('services')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Agendar Agora</span>
          <ChevronRight className="w-5 h-5" />
        </button>
        
        {userLoggedIn ? (
          <button
            onClick={() => setCurrentStep('profile')}
            className="w-full bg-white border-2 border-gray-200 text-gray-800 py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all"
          >
            Minha Conta
          </button>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-white border-2 border-gray-200 text-gray-800 py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all"
          >
            Entrar / Cadastrar
          </button>
        )}
      </div>
  
      {/* Map Section - Movido para o final */}
      {showMap && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="h-48 bg-gray-200 relative flex items-center justify-center">
            <Map className="w-12 h-12 text-gray-400" />
            <button 
              onClick={() => setShowMap(false)}
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
              aria-label="Fechar mapa"
              title="Fechar mapa"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-gray-800">Barbearia TrimGo</h3>
                <p className="text-sm text-gray-600">Rua das Barbearias, 123 - Centro, Caraguatatuba - SP</p>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Rua+das+Barbearias,+123+-+Centro,+Caraguatatuba+-+SP"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-3 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium text-sm flex items-center justify-center hover:bg-blue-100 transition-colors"
              aria-label="Ver rotas no mapa"
              title="Ver rotas no mapa"
            >
              Ver rotas no mapa
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentStep('welcome')}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
          aria-label="Voltar"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">Nossos Serviços</h2>
        <div className="w-9"></div>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar serviços..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Limpar busca"
            title="Limpar busca"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
              selectedCategory === category 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Services List */}
      <div className="grid gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg">
                    <Scissors className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.duration} min • R$ {service.price}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-500 ml-1">{service.popularity.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mt-2" />
              </div>
              <p className="text-gray-500 text-sm mt-3">{service.description}</p>
            </div>
          ))
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-center">
            <p className="text-yellow-800">Nenhum serviço encontrado com esses critérios</p>
            <button 
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="text-blue-600 text-sm font-medium mt-2"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );


  const renderBarbers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActiveTab('services')}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">Escolha seu Barbeiro</h2>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-6">
        <div className="flex items-center space-x-3">
          <Scissors className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-800">{selectedService?.name}</h3>
            <p className="text-sm text-blue-600">R$ {selectedService?.price} • {selectedService?.duration} min</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            onClick={() => handleBarberSelect(barber)}
            className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={barber.photo} 
                  alt={barber.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                  <div className="bg-green-100 rounded-full p-1">
                    <div className="flex items-center justify-center w-5 h-5">
                      <Star className="w-3 h-3 text-green-600 fill-green-600" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600">{barber.name}</h3>
                <p className="text-sm text-gray-600">{barber.specialty}</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(barber.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{barber.rating.toFixed(1)}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDateTime = () => {
    // Função auxiliar para verificar se é hoje
    const isToday = (dateString: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = new Date(dateString);
      return date.getTime() === today.getTime();
    };
  
    // Formatação amigável da data
    const formatDisplayDate = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      if (date.getTime() === today.getTime()) {
        return { weekday: 'Hoje', fullDate: date.toLocaleDateString('pt-BR') };
      } else if (date.getTime() === tomorrow.getTime()) {
        return { weekday: 'Amanhã', fullDate: date.toLocaleDateString('pt-BR') };
      } else {
        return {
          weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          fullDate: date.toLocaleDateString('pt-BR')
        };
      }
    };
  
    // Obtém os próximos 7 dias (incluindo hoje)
    const getNext7Days = () => {
      const days = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        days.push(date.toISOString().split('T')[0]);
      }
      
      return days;
    };
  
    // Função para mapear nomes de dias em português para inglês
    const mapPortugueseDayToEnglish = (day: string): string => {
      const dayMap: Record<string, string> = {
        'segunda': 'monday',
        'terça': 'tuesday',
        'quarta': 'wednesday',
        'quinta': 'thursday',
        'sexta': 'friday',
        'sábado': 'saturday',
        'domingo': 'sunday'
      };
      return dayMap[day.toLowerCase()] || day;
    };
  
    // Filtra apenas dias disponíveis para o barbeiro
    const availableDays = getNext7Days().filter(date => {
      if (!selectedBarber) return false;
      
      const dateObj = new Date(date);
      const dayNameInPortuguese = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
      const englishDayName = mapPortugueseDayToEnglish(dayNameInPortuguese);
      
      // Verifica se o barbeiro está disponível nesse dia
      return selectedBarber.availableDays.some(availableDay => {
        const englishAvailableDay = mapPortugueseDayToEnglish(availableDay);
        return englishAvailableDay === englishDayName.toLowerCase();
      });
    });
  
    return (
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentStep('services')}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
            aria-label='Voltar'
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">Data e Horário</h2>
          <div className="w-9"></div>
        </div>
  
        {/* Resumo do Serviço */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 space-y-3">
          <div className="flex items-center space-x-3">
            <Scissors className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">{selectedService?.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700">{selectedBarber?.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700">R$ {selectedService?.price}</span>
          </div>
        </div>
  
        {/* Seleção de Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Escolha a Data</span>
            </h3>
            
            <div className="grid gap-3">
              {availableDays.length > 0 ? (
                availableDays.map(date => {
                  const { weekday, fullDate } = formatDisplayDate(date);
                  const today = isToday(date);
                  
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-4 rounded-xl border transition-all transform hover:scale-105 ${
                        selectedDate === date
                          ? 'border-blue-500 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${today ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      <div className="font-semibold flex items-center">
                        {weekday}
                        {today && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Hoje</span>}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {fullDate}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-center">
                  <p className="text-yellow-800">Este barbeiro não tem disponibilidade nos próximos 7 dias</p>
                </div>
              )}
            </div>
          </div>
        {/* Horários Disponíveis (mostra apenas quando uma data é selecionada) */}
        {selectedDate && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Horários Disponíveis para {formatDisplayDate(selectedDate).weekday}</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {generateTimeSlots().map(slot => (
                <button
                  key={slot.time}
                  onClick={() => {
                    if (slot.available) {
                      setSelectedTime(slot.time);
                      setCurrentStep('client');
                    }
                  }}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg border transition-all font-medium text-sm ${
                    selectedTime === slot.time
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                      : slot.available
                      ? 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-800'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                  {!slot.available && <div className="text-xs text-red-500 mt-1">Indisponível</div>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClientInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentStep('datetime')}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
          aria-label='Voltar'
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">Seus Dados</h2>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </div>

      {/* Booking Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Scissors className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">{selectedService?.name}</span>
          </div>
          <span className="text-blue-700 font-medium">R$ {selectedService?.price}</span>
        </div>
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700">{selectedBarber?.name}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700">{formatDate(selectedDate)}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700">{selectedTime}</span>
        </div>
      </div>

      {/* Client Form */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone/WhatsApp
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Enviaremos a confirmação por WhatsApp. Certifique-se de que seu número está correto.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep('confirmation')}
          disabled={!clientName || !clientPhone}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
        >
          <span>Confirmar Agendamento</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      {!isBookingConfirmed ? (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirme seu Agendamento</h2>
            <p className="text-gray-600">Revise os dados antes de finalizar</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-2 rounded-lg">
                  <Scissors className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{selectedService?.name}</p>
                  <p className="text-sm text-gray-600">{selectedService?.duration} min</p>
                </div>
              </div>
              <p className="text-lg font-bold text-blue-600">R$ {selectedService?.price}</p>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Data</span>
                </div>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Horário</span>
                </div>
                <span className="font-medium">{selectedTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <span>Barbeiro</span>
                </div>
                <span className="font-medium">{selectedBarber?.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <span>Cliente</span>
                </div>
                <span className="font-medium">{clientName}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>Telefone</span>
                </div>
                <span className="font-medium">{clientPhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Política de Cancelamento</p>
                <p className="text-xs text-blue-700 mt-1">
                  Cancelamentos devem ser feitos com pelo menos 2 horas de antecedência. 
                  Faltas consecutivas podem resultar em cobrança ou bloqueio de agendamentos futuros.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={sendWhatsAppMessage}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <span>Confirmar via WhatsApp</span>
            </button>
            
            <button
              onClick={() => setCurrentStep('client')}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Voltar e Editar
            </button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl border-2 border-green-200">
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Agendamento Confirmado!</h2>
            <p className="text-green-700">Você receberá um lembrete no dia do serviço</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Detalhes do Agendamento</h3>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-semibold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Barbeiro:</span>
                <span className="font-semibold">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-semibold">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-semibold text-green-600">R$ {selectedService?.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left">
            <h4 className="font-medium text-blue-800 mb-2">Instruções:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Chegue 5 minutos antes do horário marcado</li>
              <li>Traje casual é bem-vindo</li>
              <li>Cancelamentos com 2h de antecedência</li>
              <li>Pontualidade é apreciada</li>
            </ul>
          </div>

          <button
            onClick={resetBooking}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <span>Novo Agendamento</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentStep('welcome')}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">Minha Conta</h2>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src="https://randomuser.me/api/portraits/men/1.jpg" 
              alt="User"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
              <div className="bg-blue-100 rounded-full p-1">
                <div className="flex items-center justify-center w-5 h-5">
                  <Star className="w-3 h-3 text-blue-600 fill-blue-600" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">João Silva</h3>
            <p className="text-sm text-gray-600">joao@exemplo.com</p>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-500 ml-1">4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
          <div className="flex items-center space-x-3">
            <Bookmark className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Meus Agendamentos</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
          <div className="flex items-center space-x-3">
            <Gift className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Meus Benefícios</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
          <div className="flex items-center space-x-3">
            <BarChart2 className="w-5 h-5 text-green-600" />
            <span className="font-medium">Histórico</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Configurações</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <button 
        onClick={() => setUserLoggedIn(false)}
        className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-all mt-6"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sair</span>
      </button>
    </div>
  );

  const renderAuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {authMethod === 'login' ? 'Entrar' : 'Cadastrar'}
            </h3>
            <button 
              onClick={() => setShowAuthModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {authMethod === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            
            <div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all">
                {authMethod === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setAuthMethod(authMethod === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {authMethod === 'login' 
                  ? 'Não tem uma conta? Cadastre-se' 
                  : 'Já tem uma conta? Entrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 px-4">
      <div className="max-w-md mx-auto">
        {/* Header com status */}
        {currentStep !== 'welcome' && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
                    <Scissors className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-800">TrimGo</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${currentStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {currentStatus.status}
                  </div>
                  <div className="text-xs text-gray-500">{currentStatus.hours}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          {currentStep === 'welcome' && renderWelcome()}
          {currentStep === 'services' && activeTab === 'services' && renderServices()}
          {currentStep === 'services' && activeTab === 'barbers' && renderBarbers()}
          {currentStep === 'datetime' && renderDateTime()}
          {currentStep === 'client' && renderClientInfo()}
          {currentStep === 'confirmation' && renderConfirmation()}
          {currentStep === 'profile' && renderProfile()}
        </div>
      </div>

      {showAuthModal && renderAuthModal()}
    </div>
  );
};

export default TrimGo;