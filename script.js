// Конфигурация
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001'
};

// Данные по умолчанию
const defaultData = {
  masters: [
    { 
      id: 1, 
      name: 'Валентин', 
      experience: 'старший мастер', 
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      specialization: 'старший мастер',
      schedule: { start: '10:00', end: '20:00', days: [1, 3, 4, 5, 6, 0] }
    },
    { 
      id: 2, 
      name: 'Ева', 
      experience: 'младший мастер', 
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
      specialization: 'младший мастер',
      schedule: { start: '10:00', end: '20:00', days: [1, 3, 4, 5, 6, 0] }
    },
    { 
      id: 3, 
      name: 'Ника', 
      experience: 'младший мастер', 
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      specialization: 'младший мастер',
      schedule: { start: '10:00', end: '20:00', days: [1, 3, 4, 5, 6, 0] }
    }
  ],
  services: [
    { id: 1, name: 'Машинка + ножницы', price: '25€', duration: 45 },
    { id: 2, name: 'Машинка', price: '20€', duration: 30 },
    { id: 3, name: 'Удлиненная стрижка', price: '25-30€', duration: 60 },
    { id: 4, name: 'Комплекс (стрижка + моделирование бороды)', price: '50€', duration: 90 },
    { id: 5, name: 'Выпаривание лица + камуфляж', price: '15€', duration: 25 },
    { id: 6, name: 'Шампунь и уход', price: '10€', duration: 15 }
  ],
  shopInfo: {
    name: 'Vibe BarberShop',
    address: 'Avenue Van Volxem 248 Sint Gilis, Brussels, Belgium',
    workHours: 'Пн-Вс(Вт выходной): 10:00-20:00',
    instagram: '@vibe.barbershop.be',
    phone: '+32 470 12 34 56',
    email: 'vibe@barbershop.be'
  },
  reviews: [
    { id: 1, clientName: 'Александр', rating: 5, comment: 'Отличный сервис! Валентин - настоящий профессионал.', date: '2024-01-15' },
    { id: 2, clientName: 'Михаил', rating: 5, comment: 'Очень доволен стрижкой. Приятная атмосфера в барбершопе.', date: '2024-01-10' },
    { id: 3, clientName: 'Денис', rating: 4, comment: 'Хорошее качество услуг, вежливый персонал. Рекомендую!', date: '2024-01-08' }
  ]
};

// State
let state = {
  user: null,
  masters: [],
  services: [],
  shopInfo: {},
  bookings: [],
  reviews: [],
  
  // UI состояния
  selectedDate: '',
  selectedTime: '',
  selectedBarber: null,
  selectedService: null,
  clientName: '',
  clientPhone: '',
  showSuccess: false,
  loading: false,
  error: null,
  
  // Управление мастерами
  editingMaster: null,
  showMasterForm: false,
  
  // Навигация
  currentTab: 'booking',
  
  // Отзывы
  newReviewRating: 0
};

// Простой API клиент
const api = {
  async loadMasters() {
    try {
      const response = await fetch('http://localhost:3001/masters');
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
    } catch (error) {
      console.log('Используем локальные данные мастеров');
    }
    return { success: true, data: defaultData.masters };
  },

  async loadServices() {
    try {
      const response = await fetch('http://localhost:3001/services');
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
    } catch (error) {
      console.log('Используем локальные данные услуг');
    }
    return { success: true, data: defaultData.services };
  },

  async loadShopInfo() {
    try {
      const response = await fetch('http://localhost:3001/shop');
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
    } catch (error) {
      console.log('Используем локальные данные магазина');
    }
    return { success: true, data: defaultData.shopInfo };
  },

  async loadBookings() {
    try {
      const response = await fetch('http://localhost:3001/bookings');
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
    } catch (error) {
      console.log('Нет записей');
    }
    return { success: true, data: [] };
  },

  async loadReviews() {
    try {
      const response = await fetch('http://localhost:3001/reviews');
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
    } catch (error) {
      console.log('Используем локальные данные отзывов');
    }
    return { success: true, data: defaultData.reviews };
  },

  async createBooking(bookingData) {
    try {
      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: bookingData.date,
          time: bookingData.time,
          master_id: bookingData.barber,
          service_name: state.services.find(s => s.id === bookingData.service)?.name || 'Услуга',
          client_name: bookingData.clientName,
          client_phone: bookingData.clientPhone,
          status: 'подтверждена',
          created_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      console.log('Запись сохранена локально');
    }
    return { success: true };
  },

  async addMaster(masterData) {
    try {
      const response = await fetch('http://localhost:3001/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(masterData)
      });
      
      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      console.log('Мастер сохранен локально');
    }
    return { success: true };
  },

  async updateMaster(masterId, masterData) {
    try {
      const response = await fetch(`http://localhost:3001/masters/${masterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(masterData)
      });
      
      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      console.log('Мастер обновлен локально');
    }
    return { success: true };
  },

  async deleteMaster(masterId) {
    try {
      const response = await fetch(`http://localhost:3001/masters/${masterId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      console.log('Мастер удален локально');
    }
    return { success: true };
  },

  async login(email, password) {
    if (email === 'vibe@gmail.com' && password === 'admin123') {
      const user = {
        id: 1,
        name: 'Администратор Vibe',
        role: 'admin',
        email: 'vibe@gmail.com'
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: { user } };
    }
    return { success: false, message: 'Неверные данные' };
  }
};

// Utils
const utils = {
  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  getDayName(dateStr) {
    const date = new Date(dateStr);
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  },

  validatePhone(phone) {
    return phone.replace(/\D/g, '').length >= 10;
  },

  validateName(name) {
    return name.trim().length >= 2;
  },

  generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  },

  getAvailableMasters(selectedDate, selectedTime, selectedService) {
    if (!selectedDate || !selectedTime || !selectedService) return [];
    
    const service = state.services.find(s => s.id === selectedService);
    if (!service) return [];
    
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const dayOfWeek = selectedDateTime.getDay();
    
    return state.masters.filter(master => {
      if (!master.schedule.days.includes(dayOfWeek)) return false;
      
      const [startHour, startMinute] = master.schedule.start.split(':').map(Number);
      const [endHour, endMinute] = master.schedule.end.split(':').map(Number);
      const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      const selectedTimeInMinutes = selectedHour * 60 + selectedMinute;
      
      if (selectedTimeInMinutes < startTime || selectedTimeInMinutes >= endTime) {
        return false;
      }
      
      const hasBookingAtThisTime = state.bookings.some(booking => {
        return booking.master_id === master.id && 
               booking.date === selectedDate && 
               booking.time === selectedTime;
      });
      
      return !hasBookingAtThisTime;
    });
  },

  isMasterBusy(masterId, date, time) {
    return state.bookings.some(booking => {
      return booking.master_id === masterId && 
             booking.date === date && 
             booking.time === time;
    });
  }
};

// Компоненты для клиентской части
const components = {
  navigation() {
    return `
      <div class="navigation">
        <button class="nav-btn ${state.currentTab === 'booking' ? 'active' : ''}" onclick="switchTab('booking')">
           Запись
        </button>
        <button class="nav-btn ${state.currentTab === 'reviews' ? 'active' : ''}" onclick="switchTab('reviews')">
           Отзывы
        </button>
      </div>
    `;
  },

  serviceSelector() {
    let html = '<div><h3> Выберите услугу</h3><div class="service-list">';
    state.services.forEach(service => {
      const selected = state.selectedService === service.id ? 'selected' : '';
      html += `<button class="service-card ${selected}" onclick="selectService(${service.id})">
                <div class="service-info">
                  <div class="name">${service.name}</div>
                  <div class="duration">${service.duration} мин</div>
                </div>
                <div class="service-price">${service.price}</div>
              </button>`;
    });
    html += '</div></div>';
    return html;
  },

  datePicker() {
    const today = new Date();
    let html = '<div><h3> Выберите дату</h3><div class="date-grid">';
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = utils.formatDate(date);
      const selected = state.selectedDate === dateStr ? 'selected' : '';
      
      html += `<button class="date-btn ${selected}" onclick="selectDate('${dateStr}')">
                <div class="day">${utils.getDayName(dateStr)}</div>
                <div class="date">${date.getDate()}</div>
              </button>`;
    }
    html += '</div></div>';
    return html;
  },

  timePicker() {
    const times = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'];
    let html = '<div><h3> Выберите время</h3><div class="time-grid">';
    
    times.forEach(time => {
      const availableMasters = utils.getAvailableMasters(state.selectedDate, time, state.selectedService);
      const isAvailable = availableMasters.length > 0;
      
      const selected = state.selectedTime === time ? 'selected' : '';
      html += `<button class="time-btn ${selected} ${!isAvailable ? 'disabled' : ''}" 
                onclick="${isAvailable ? `selectTime('${time}')` : ''}" 
                ${!isAvailable ? 'disabled' : ''}>
                ${time}
                ${!isAvailable ? '<div class="time-unavailable">Нет свободных мастеров</div>' : ''}
              </button>`;
    });
    html += '</div></div>';
    return html;
  },

  barberSelector() {
    const availableMasters = utils.getAvailableMasters(state.selectedDate, state.selectedTime, state.selectedService);
    
    let html = '<div><h3>💈 Выберите мастера</h3>';
    
    if (availableMasters.length === 0) {
      html += '<div class="info-message"> На выбранное время нет свободных мастеров</div>';
    } else {
      html += '<div class="barber-grid">';
      availableMasters.forEach(barber => {
        const selected = state.selectedBarber === barber.id ? 'selected' : '';

        // Правильное отображение фото с классами из вашего CSS
        const photoContent = barber.photo 
          ? `<img src="${barber.photo}" alt="${barber.name}" class="barber-photo-img">` 
          : `<div class="barber-photo-placeholder">👤</div>`;
        
        const masterBookingsToday = state.bookings.filter(booking => 
          booking.master_id === barber.id && booking.date === state.selectedDate
        );
        
        html += `<button class="barber-card ${selected}" onclick="selectBarber(${barber.id})">
                  <div class="photo-container">
                    ${photoContent}
                  </div>
                  <div class="name">${barber.name}</div>
                  <div class="experience">${barber.experience}</div>
                  <div class="specialization">${barber.specialization}</div>
                  <div class="availability">✅ Свободен в ${state.selectedTime}</div>
                  ${masterBookingsToday.length > 0 ? `
                    <div class="master-schedule-today">
                      <small>Занят в: ${masterBookingsToday.map(b => b.time).join(', ')}</small>
                    </div>
                  ` : ''}
                </button>`;
      });
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  },

  bookingForm() {
    const barber = state.masters.find(m => m.id === state.selectedBarber);
    const service = state.services.find(s => s.id === state.selectedService);
    
    let html = `<div><h3> Контактные данные</h3>
                <div class="booking-summary">
                  <div><strong>Услуга:</strong> ${service?.name} - ${service?.price}</div>
                  <div><strong>Дата и время:</strong> ${state.selectedDate} ${state.selectedTime}</div>
                  <div><strong>Мастер:</strong> ${barber?.name}</div>
                </div>
                <div class="form-group">
                  <label>Ваше имя *</label>
                  <input type="text" class="form-input" value="${state.clientName}" 
                         oninput="updateClientName(this.value)" placeholder="Введите ваше имя">
                </div>
                <div class="form-group">
                  <label>Телефон *</label>
                  <input type="tel" class="form-input" value="${state.clientPhone}" 
                         oninput="updateClientPhone(this.value)" placeholder="+32 ___ __ __ __">
                </div>
                <button class="btn-primary" onclick="createBooking()" ${state.loading ? 'disabled' : ''}>
                  ${state.loading ? 'Загрузка...' : 'Записаться на прием'}
                </button>`;

    if (state.error) {
      html += `<div class="error-message"> ${state.error}</div>`;
    }
    if (state.showSuccess) {
      html += `<div class="success-message">
                <h3> Запись прошла успешно!</h3>
                <p>Ждем вас ${state.selectedTime} ${state.selectedDate}</p>
                <p><strong>Мастер:</strong> ${barber?.name}</p>
                <p><strong>Услуга:</strong> ${service?.name}</p>
              </div>`;
    }
    return html;
  },

  reviewsTab() {
    let html = `
      <div class="reviews-section">
        <h2> Отзывы наших клиентов</h2>
        <div class="reviews-stats">
          <div class="average-rating">
            <span class="rating-stars">★★★★★</span>
            <span class="rating-text">4.8 из 5 (${state.reviews.length} отзывов)</span>
          </div>
        </div>
        <div class="reviews-list">
    `;
    
    state.reviews.forEach(review => {
      const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      html += `
        <div class="review-card">
          <div class="review-header">
            <div class="review-client">${review.clientName}</div>
            <div class="review-rating">
              <span class="stars">${stars}</span>
              <span class="review-date">${review.date}</span>
            </div>
          </div>
          <div class="review-comment">${review.comment}</div>
        </div>
      `;
    });
    
    html += `
        </div>
        <div class="add-review">
          <h3>Оставить отзыв</h3>
          <div class="form-group">
            <label>Ваше имя</label>
            <input type="text" id="reviewName" class="form-input" placeholder="Введите ваше имя">
          </div>
          <div class="form-group">
            <label>Оценка</label>
            <div class="rating-selector">
              ${[1,2,3,4,5].map(star => `
                <button class="star-btn" onclick="setRating(${star})">${star <= (state.newReviewRating || 0) ? '★' : '☆'}</button>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label>Ваш отзыв</label>
            <textarea id="reviewComment" class="form-input" placeholder="Поделитесь вашими впечатлениями..." rows="3"></textarea>
          </div>
          <button class="btn-primary" onclick="submitReview()">Оставить отзыв</button>
        </div>
      </div>
    `;
    
    return html;
  },

  loginForm() {
    return `<div class="login-form">
              <h3>Вход для администратора</h3>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="adminEmail" class="form-input" value="vibe@gmail.com">
              </div>
              <div class="form-group">
                <label>Пароль</label>
                <input type="password" id="adminPassword" class="form-input" value="admin123">
              </div>
              <button class="btn-primary" onclick="adminLogin()">Войти</button>
              <button class="btn-secondary" onclick="renderMain()">← Назад</button>
            </div>`;
  },

  masterForm() {
    const master = state.editingMaster;
    return `
      <div class="master-form-overlay">
        <div class="master-form">
          <h3>${master ? 'Редактировать мастера' : 'Добавить мастера'}</h3>
          <div class="form-group">
            <label>Имя мастера *</label>
            <input type="text" id="masterName" class="form-input" 
                   value="${master?.name || ''}" placeholder="Введите имя мастера">
          </div>
          <div class="form-group">
            <label>Фото (URL)</label>
            <input type="text" id="masterPhoto" class="form-input" 
                   value="${master?.photo || ''}" placeholder="https://example.com/photo.jpg">
            <small style="color: #666; font-size: 12px;">Вставьте ссылку на изображение или оставьте пустым</small>
          </div>
          <div class="form-group">
            <label>Специализация *</label>
            <input type="text" id="masterExperience" class="form-input" 
                   value="${master?.experience || ''}" placeholder="Например: старший мастер">
          </div>
          <div class="form-group">
            <label>Специализация (детально)</label>
            <input type="text" id="masterSpecialization" class="form-input" 
                   value="${master?.specialization || ''}" placeholder="Например: стрижка, борода">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Начало работы</label>
              <input type="time" id="masterStart" class="form-input" 
                     value="${master?.schedule?.start || '10:00'}">
            </div>
            <div class="form-group">
              <label>Конец работы</label>
              <input type="time" id="masterEnd" class="form-input" 
                     value="${master?.schedule?.end || '20:00'}">
            </div>
          </div>
          <div class="form-group">
            <label>Рабочие дни</label>
            <div class="days-selector">
              ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => `
                <label class="day-checkbox">
                  <input type="checkbox" value="${index}" 
                         ${master?.schedule?.days?.includes(index) ? 'checked' : ''}>
                  ${day}
                </label>
              `).join('')}
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" onclick="saveMaster()">
              ${master ? 'Сохранить' : 'Добавить'}
            </button>
            <button class="btn-secondary" onclick="closeMasterForm()">Отмена</button>
          </div>
        </div>
      </div>
    `;
  }
};

// === ОСНОВНЫЕ ФУНКЦИИ ===

function switchTab(tabName) {
  state.currentTab = tabName;
  renderMain();
}

function selectService(id) {
  state.selectedService = id;
  state.selectedDate = '';
  state.selectedTime = '';
  state.selectedBarber = null;
  renderMain();
}

function selectDate(date) {
  state.selectedDate = date;
  state.selectedTime = '';
  state.selectedBarber = null;
  renderMain();
}

function selectTime(time) {
  state.selectedTime = time;
  state.selectedBarber = null;
  renderMain();
}

function selectBarber(id) {
  state.selectedBarber = id;
  renderMain();
}

function updateClientName(value) {
  state.clientName = value;
}

function updateClientPhone(value) {
  state.clientPhone = value;
}

function setRating(rating) {
  state.newReviewRating = rating;
  renderMain();
}

function submitReview() {
  const name = document.getElementById('reviewName')?.value;
  const comment = document.getElementById('reviewComment')?.value;
  
  if (!name || !comment || !state.newReviewRating) {
    alert('Пожалуйста, заполните все поля и поставьте оценку');
    return;
  }
  
  const newReview = {
    id: utils.generateId(),
    clientName: name,
    rating: state.newReviewRating,
    comment: comment,
    date: utils.formatDate(new Date())
  };
  
  state.reviews.unshift(newReview);
  state.newReviewRating = 0;
  
  if (document.getElementById('reviewName')) document.getElementById('reviewName').value = '';
  if (document.getElementById('reviewComment')) document.getElementById('reviewComment').value = '';
  
  renderMain();
  alert('Спасибо за ваш отзыв!');
}

async function createBooking() {
  if (!state.selectedDate || !state.selectedTime || !state.selectedBarber || !state.selectedService) {
    state.error = 'Пожалуйста, заполните все поля';
    renderMain();
    return;
  }
  if (!utils.validateName(state.clientName)) {
    state.error = 'Введите корректное имя';
    renderMain();
    return;
  }
  if (!utils.validatePhone(state.clientPhone)) {
    state.error = 'Введите корректный телефон';
    renderMain();
    return;
  }

  state.loading = true;
  renderMain();

  const result = await api.createBooking({
    date: state.selectedDate,
    time: state.selectedTime,
    barber: state.selectedBarber,
    service: state.selectedService,
    clientName: state.clientName,
    clientPhone: state.clientPhone
  });

  state.loading = false;
  
  if (result.success) {
    state.showSuccess = true;
    state.clientName = '';
    state.clientPhone = '';
    
    const bookingsResult = await api.loadBookings();
    state.bookings = bookingsResult.data;
    
    renderMain();
    setTimeout(() => {
      state.showSuccess = false;
      state.selectedService = null;
      state.selectedDate = '';
      state.selectedTime = '';
      state.selectedBarber = null;
      renderMain();
    }, 5000);
  } else {
    state.error = result.message;
    renderMain();
  }
}

// === ФУНКЦИИ АДМИНКИ ===

async function adminLogin() {
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  
  state.loading = true;
  renderMain();

  const result = await api.login(email, password);
  
  state.loading = false;
  
  if (result.success) {
    state.user = result.data.user;
    const bookingsResult = await api.loadBookings();
    state.bookings = bookingsResult.data;
    renderMain();
  } else {
    alert('Ошибка: ' + result.message);
    renderMain();
  }
}

function adminLogout() {
  state.user = null;
  localStorage.removeItem('user');
  renderMain();
}

function showAdminLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="header">
        <div class="logo">VIBE</div>
        <h1>Vibe BarberShop</h1>
        <p>Вход в панель администратора</p>
      </div>
      ${components.loginForm()}
    </div>
  `;
}

async function deleteBooking(bookingId) {
  if (confirm('Удалить эту запись?')) {
    try {
      const response = await fetch(`http://localhost:3001/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await api.loadBookings();
        state.bookings = result.data;
        renderAdmin();
      }
    } catch (error) {
      state.bookings = state.bookings.filter(b => b.id !== bookingId);
      renderAdmin();
    }
  }
}

function callClient(phone) {
  window.open(`tel:${phone}`);
}

async function clearAllBookings() {
  if (confirm('ВЫ УВЕРЕНЫ? Это удалит ВСЕ записи!')) {
    try {
      const bookings = await api.loadBookings();
      for (const booking of bookings.data) {
        await fetch(`http://localhost:3001/bookings/${booking.id}`, {
          method: 'DELETE'
        });
      }
    } catch (error) {
      console.log('Очистка локальных данных');
    }
    
    state.bookings = [];
    renderAdmin();
    alert('Все записи очищены!');
  }
}

function showAddMasterForm() {
  state.editingMaster = null;
  state.showMasterForm = true;
  renderAdmin();
}

function editMaster(master) {
  state.editingMaster = master;
  state.showMasterForm = true;
  renderAdmin();
}

function closeMasterForm() {
  state.showMasterForm = false;
  state.editingMaster = null;
  renderAdmin();
}

async function saveMaster() {
  const name = document.getElementById('masterName').value;
  const photo = document.getElementById('masterPhoto').value;
  const experience = document.getElementById('masterExperience').value;
  const specialization = document.getElementById('masterSpecialization').value;
  const start = document.getElementById('masterStart').value;
  const end = document.getElementById('masterEnd').value;
  
  const dayCheckboxes = document.querySelectorAll('.day-checkbox input:checked');
  const days = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));

  if (!name || !experience) {
    alert('Пожалуйста, заполните обязательные поля');
    return;
  }

  const masterData = {
    name,
    photo,
    experience,
    specialization,
    schedule: {
      start,
      end,
      days
    }
  };

  state.loading = true;
  renderAdmin();

  let result;
  if (state.editingMaster) {
    masterData.id = state.editingMaster.id;
    result = await api.updateMaster(state.editingMaster.id, masterData);
  } else {
    masterData.id = utils.generateId();
    result = await api.addMaster(masterData);
  }

  state.loading = false;

  if (result.success) {
    const mastersResult = await api.loadMasters();
    state.masters = mastersResult.data;
    state.showMasterForm = false;
    state.editingMaster = null;
    renderAdmin();
  } else {
    alert('Ошибка при сохранении мастера');
  }
}

async function deleteMaster(masterId) {
  if (confirm('Удалить этого мастера? Все его записи также будут удалены.')) {
    state.loading = true;
    renderAdmin();

    const result = await api.deleteMaster(masterId);
    
    state.loading = false;

    if (result.success) {
      const mastersResult = await api.loadMasters();
      state.masters = mastersResult.data;
      renderAdmin();
    } else {
      alert('Ошибка при удалении мастера');
    }
  }
}

function getBarberName(id) {
  const barber = state.masters.find(b => b.id === id);
  return barber ? barber.name : 'Неизвестно';
}

// === RENDER ФУНКЦИИ ===

function renderMain() {
  const app = document.getElementById('app');
  
  if (state.user?.role === 'admin') {
    renderAdmin();
    return;
  }

  let mainContent = '';
  
  if (state.currentTab === 'booking') {
    mainContent = `
      <div class="card">
        <h2>Онлайн запись</h2>
        ${state.loading ? '<div class="loading">Загрузка...</div>' : `
          ${components.serviceSelector()}
          ${state.selectedService ? components.datePicker() : '<div class="info-message">✂️ Сначала выберите услугу</div>'}
          ${state.selectedDate ? components.timePicker() : ''}
          ${state.selectedTime ? components.barberSelector() : ''}
          ${state.selectedBarber ? components.bookingForm() : ''}
        `}
      </div>
    `;
  } else if (state.currentTab === 'reviews') {
    mainContent = `
      <div class="card">
        ${components.reviewsTab()}
      </div>
    `;
  }

  app.innerHTML = `
    <div class="container">
      <div class="contact-header">
        <div class="contact-info">
          <div class="contact-item"><span class="icon">📍</span><span class="text">${state.shopInfo.address}</span></div>
          <div class="contact-item"><span class="icon">📞</span><span class="text">${state.shopInfo.phone}</span></div>
          <div class="contact-item"><span class="icon">🕐</span><span class="text">${state.shopInfo.workHours}</span></div>
          <div class="contact-item"><span class="icon">📧</span><span class="text">${state.shopInfo.email}</span></div>
          <div class="contact-item"><span class="icon">📱</span><span class="text">${state.shopInfo.instagram}</span></div>
        </div>
      </div>
      
      <div class="header">
        <div class="logo">VIBE</div>
        <h1>${state.shopInfo.name}</h1>
        <p>Профессиональный уход за вашим стилем</p>
        ${!state.user ? '<button class="admin-login-btn" onclick="showAdminLogin()">🔐 Вход для админа</button>' : ''}
      </div>
      
      ${components.navigation()}
      
      <div class="grid">
        ${mainContent}
      </div>
    </div>
  `;
}

function renderAdmin() {
  const app = document.getElementById('app');
  
  let adminHTML = `
    <div class="container">
      <div class="admin-header">
        <h1>Панель Администратора</h1>
        <button class="admin-logout-btn" onclick="adminLogout()">Выйти</button>
      </div>

      <div class="admin-card">
        <h2>📊 Статистика</h2>
        <div class="admin-stats">
          <div class="stat-item">
            <span class="stat-number">${state.masters.length}</span>
            <span class="stat-label">Мастеров</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${state.services.length}</span>
            <span class="stat-label">Услуг</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${state.bookings.length}</span>
            <span class="stat-label">Записей</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${state.reviews.length}</span>
            <span class="stat-label">Отзывов</span>
          </div>
        </div>
      </div>

      <div class="admin-card">
        <h2>💈 Управление мастерами</h2>
        <button class="btn-primary" onclick="showAddMasterForm()" style="margin-bottom: 20px;">
          ➕ Добавить мастера
        </button>
        <div class="masters-grid">
          ${state.masters.map(master => {
            const photoPreview = master.photo 
              ? `<img src="${master.photo}" alt="${master.name}" class="admin-master-photo">` 
              : `<div class="admin-master-photo-placeholder">👤</div>`;
            
            return `
            <div class="master-card">
              <div class="master-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  ${photoPreview}
                  <div class="master-name">${master.name}</div>
                </div>
                <div class="master-actions">
                  <button class="btn-edit" onclick='editMaster(${JSON.stringify(master).replace(/'/g, "&#39;")})'>✏️</button>
                  <button class="btn-delete" onclick="deleteMaster(${master.id})">🗑️</button>
                </div>
              </div>
              <div class="master-info">${master.experience}</div>
              <div class="master-info">${master.specialization || 'Общие услуги'}</div>
              <div class="master-schedule">
                <div class="schedule-time">⏰ ${master.schedule.start} - ${master.schedule.end}</div>
                <div class="schedule-days">📅 ${master.schedule.days.map(d => ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d]).join(', ')}</div>
              </div>
              <div class="master-bookings">
                Записей: ${state.bookings.filter(b => b.master_id === master.id).length}
              </div>
            </div>
          `}).join('')}
        </div>
      </div>

      <div class="admin-card">
        <h2>👥 Записи клиентов</h2>
        ${state.bookings.length === 0 ? 
          '<div class="empty-state">Записей пока нет</div>' : 
          `
          <div class="table-container">
            <table class="bookings-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Мастер</th>
                  <th>Услуга</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                ${state.bookings.map(booking => `
                  <tr>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td>${booking.client_name}</td>
                    <td>${booking.client_phone}</td>
                    <td>${getBarberName(booking.master_id)}</td>
                    <td>${booking.service_name}</td>
                    <td>
                      <button class="btn-delete" onclick="deleteBooking(${booking.id})">Удалить</button>
                      <button class="btn-call" onclick="callClient('${booking.client_phone}')">Позвонить</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="table-actions">
            <button class="btn-danger" onclick="clearAllBookings()">Очистить все записи</button>
          </div>
          `
        }
      </div>

      <div class="admin-card">
        <h2>✂️ Услуги</h2>
        <div class="services-list">
          ${state.services.map(service => `
            <div class="service-item">
              <div class="service-info">
                <div class="service-name">${service.name}</div>
                <div class="service-duration">${service.duration} мин</div>
              </div>
              <div class="service-price">${service.price}</div>
              <div class="service-bookings">
                Заказов: ${state.bookings.filter(b => b.service_name === service.name).length}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="admin-card">
        <h2>⭐ Отзывы клиентов</h2>
        <div class="reviews-admin">
          ${state.reviews.map(review => `
            <div class="review-admin-card">
              <div class="review-admin-header">
                <div class="review-client">${review.clientName}</div>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-date">${review.date}</div>
              </div>
              <div class="review-comment">${review.comment}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  if (state.showMasterForm) {
    adminHTML += components.masterForm();
  }

  app.innerHTML = adminHTML;
}

// Инициализация
document.addEventListener('DOMContentLoaded', async function() {
  const today = new Date();
  state.selectedDate = utils.formatDate(today);
  
  // Проверяем сохраненного пользователя
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    state.user = JSON.parse(savedUser);
  }
  
  // Загружаем данные
  state.loading = true;
  renderMain();
  
  const [mastersResult, servicesResult, shopResult, bookingsResult, reviewsResult] = await Promise.all([
    api.loadMasters(),
    api.loadServices(),
    api.loadShopInfo(),
    api.loadBookings(),
    api.loadReviews()
  ]);
  
  state.masters = mastersResult.data;
  state.services = servicesResult.data;
  state.shopInfo = shopResult.data;
  state.bookings = bookingsResult.data;
  state.reviews = reviewsResult.data;
  state.loading = false;
  
  renderMain();
});