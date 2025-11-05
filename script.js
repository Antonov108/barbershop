// Тестовый администратор
const TEST_ADMIN = {
    email: 'vibe@gmail.com',
    password: 'admin123'
};

// Мок (имитация) API для работы без сервера
const mockApi = {
    masters: [
        { id: 1, name: 'Валентин', experience: 'старший мастер', photo: '', specialization: 'старший мастер' },
        { id: 2, name: 'Ева', experience: 'младший мастер', photo: '', specialization: 'младший мастер' },
        { id: 3, name: 'Ника', experience: 'младший мастер', photo: '', specialization: 'младший мастер' },
        { id: 4, name: 'Ева2', experience: 'младший мастер', photo: '', specialization: 'младший мастер' },
        { id: 5, name: 'Стас', experience: 'младший мастер', photo: '', specialization: 'младший мастер' },
        { id: 6, name: 'Андрей', experience: 'младший мастер', photo: '', specialization: 'младший мастер' },
    ],
    services: [
        { id: 1, name: 'Машинка + ножницы', price: '25', duration: '45' },
        { id: 2, name: 'Машинка', price: '20', duration: '30' },
        { id: 3, name: 'Удлиненная стрижка', price: '25-30', duration: '60' },
        { id: 4, name: 'Борода', price: '15', duration: '30' },
        { id: 5, name: 'Стрижка с бородой', price: '30', duration: '60' },
    ],
    bookings: JSON.parse(localStorage.getItem('vibeBarberBookings')) || [],
    schedule: {}
};

// Функции для работы с localStorage
const storage = {
    saveBookings() {
        localStorage.setItem('vibeBarberBookings', JSON.stringify(mockApi.bookings));
    },
    
    loadBookings() {
        const saved = localStorage.getItem('vibeBarberBookings');
        return saved ? JSON.parse(saved) : [];
    },
    
    clearBookings() {
        localStorage.removeItem('vibeBarberBookings');
        mockApi.bookings = [];
    }
};

// API функции
const api = {
    async request(endpoint, options = {}) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (options.body) {
            try {
                const bodyData = JSON.parse(options.body);
                if (bodyData.email === TEST_ADMIN.email && bodyData.password === TEST_ADMIN.password) {
                    return {
                        success: true,
                        data: {
                            token: 'mock-token-' + Date.now(),
                            user: {
                                id: 1,
                                name: 'Администратор Vibe',
                                role: 'admin',
                                phone: '+32 470 12 34 56',
                                email: TEST_ADMIN.email
                            }
                        }
                    };
                }
            } catch (e) {}
        }

        switch (endpoint) {
            case '/masters.php':
                return {
                    success: true,
                    data: mockApi.masters
                };
                
            case '/service.php':
                return {
                    success: true,
                    data: mockApi.services
                };
                
            case '/shop.php':
                return {
                    success: true,
                    data: {
                        name: 'Vibe BarberShop',
                        address: 'Avenue Van Volxem 248 Sint Gilis, Brussels, Belgium',
                        workHours: 'Пн-Вс(Вт выходной): 10:00-20:00',
                        instagram: '@vibe.barbershop.be',
                        phone: '+32 470 12 34 56',
                        email: 'vibe@barbershop.be'
                    }
                };
                
            case '/bookings.php':
                if (options.method === 'POST') {
                    const body = JSON.parse(options.body);
                    if (body.action === 'create') {
                        const service = mockApi.services.find(s => s.id === body.service_id);
                        const newBooking = {
                            id: Date.now(),
                            date: body.date,
                            time: body.time,
                            master_id: body.master_id,
                            service_name: service?.name || 'Услуга',
                            client_name: body.client_name,
                            client_phone: body.client_phone,
                            status: 'подтверждена',
                            created_at: new Date().toISOString()
                        };
                        mockApi.bookings.push(newBooking);
                        storage.saveBookings();
                        return { success: true, data: newBooking };
                    } else if (body.action === 'delete') {
                        const bookingIndex = mockApi.bookings.findIndex(b => b.id === body.booking_id);
                        if (bookingIndex !== -1) {
                            mockApi.bookings.splice(bookingIndex, 1);
                            storage.saveBookings();
                            return { success: true };
                        }
                        return { success: false, message: 'Запись не найдена' };
                    }
                    return { success: true, data: mockApi.bookings };
                }
                return { success: true, data: mockApi.bookings };
                
            case '/auth.php':
                const body = JSON.parse(options.body);
                if (body.action === 'login') {
                    if (body.email === TEST_ADMIN.email && body.password === TEST_ADMIN.password) {
                        return {
                            success: true,
                            data: {
                                token: 'mock-token-' + Date.now(),
                                user: {
                                    id: 1,
                                    name: 'Администратор Vibe',
                                    role: 'admin',
                                    phone: '+32 470 12 34 56',
                                    email: TEST_ADMIN.email
                                }
                            }
                        };
                    } else {
                        return {
                            success: false,
                            message: 'Неверный email или пароль'
                        };
                    }
                }
                return { success: true };
                
            default:
                return {
                    success: false,
                    message: 'Endpoint not found'
                };
        }
    },

    async loadMasters() {
        const result = await this.request('/masters.php');
        if (result.success) {
            state.masters = result.data.map(m => ({
                id: m.id,
                name: m.name,
                experience: m.specialization || 'мастер',
                photo: m.photo || '',
                schedule: m.schedule || state.defaultSchedule
            }));
            return result;
        } else {
            console.error('Ошибка загрузки мастеров:', result.message);
            state.masters = state.defaultMasters;
            return result;
        }
    },

    async loadServices() {
        const result = await this.request('/service.php');
        if (result.success) {
            state.services = result.data.map(s => ({
                id: s.id,
                name: s.name,
                price: s.price + '€',
                duration: parseInt(s.duration) || 30
            }));
            return result;
        } else {
            console.error('Ошибка загрузки услуг:', result.message);
            state.services = state.defaultServices;
            return result;
        }
    },

    async loadShopInfo() {
        const result = await this.request('/shop.php');
        if (result.success) {
            state.shopInfo = {
                name: result.data.name || 'Vibe BarberShop',
                address: result.data.address || 'Avenue Van Volxem 248 Sint Gilis, Brussels, Belgium',
                workHours: result.data.workHours || 'Пн-Вс(Вт выходной): 10:00-20:00',
                instagram: result.data.instagram || '@vibe.barbershop.be',
                phone: result.data.phone || '+32 470 12 34 56',
                email: result.data.email || 'vibe@barbershop.be'
            };
            return result;
        } else {
            console.error('Ошибка загрузки информации о салоне:', result.message);
            state.shopInfo = state.defaultShopInfo;
            return result;
        }
    },

    async loadBookings() {
        const result = await this.request('/bookings.php');
        if (result.success) {
            state.bookings = result.data.map(b => ({
                id: b.id,
                date: b.date,
                time: b.time,
                barber: b.master_id,
                service: b.service_name,
                clientName: b.client_name,
                clientPhone: b.client_phone,
                status: b.status,
                createdAt: b.created_at
            }));
            return result;
        } else {
            console.error('Ошибка загрузки записей:', result.message);
            return result;
        }
    },

    async createBooking(bookingData) {
        const result = await this.request('/bookings.php', {
            method: 'POST',
            body: JSON.stringify({
                action: 'create',
                master_id: bookingData.barber,
                service_id: bookingData.service,
                date: bookingData.date,
                time: bookingData.time,
                client_name: bookingData.clientName,
                client_phone: bookingData.clientPhone
            })
        });

        if (result.success) {
            await this.loadBookings();
        }
        
        return result;
    },

    async deleteBooking(bookingId) {
        const result = await this.request('/bookings.php', {
            method: 'POST',
            body: JSON.stringify({
                action: 'delete',
                booking_id: bookingId
            })
        });

        if (result.success) {
            await this.loadBookings();
        }
        
        return result;
    },

    async updateSchedule(masterId, schedule) {
        const master = mockApi.masters.find(m => m.id === masterId);
        if (master) {
            master.schedule = schedule;
        }
        return { success: true };
    },

    async login(email, password) {
        const result = await this.request('/auth.php', {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        if (result.success) {
            state.authToken = result.data.token;
            state.userRole = result.data.user.role;
            state.userId = result.data.user.id;
            state.clientName = result.data.user.name;
            state.clientPhone = result.data.user.phone || '';
            
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('userRole', result.data.user.role);
            localStorage.setItem('userId', result.data.user.id);
            
            await this.loadInitialData();
        }
        return result;
    },

    async register(userData) {
        return await this.request('/auth.php', {
            method: 'POST',
            body: JSON.stringify({
                action: 'register',
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password
            })
        });
    },

    logout() {
        state.authToken = null;
        state.userRole = null;
        state.userId = null;
        state.isAdmin = false;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        
        state.masters = [...state.defaultMasters];
        state.services = [...state.defaultServices];
        state.shopInfo = {...state.defaultShopInfo};
    },

    async loadInitialData() {
        await Promise.all([
            this.loadMasters(),
            this.loadServices(),
            this.loadShopInfo(),
            this.loadBookings()
        ]);
    },

    async clearAllBookings() {
        storage.clearBookings();
        await this.loadBookings();
        return { success: true, message: 'Все записи очищены' };
    }
};

// Данные по умолчанию
const defaultData = {
    masters: [
        { id: 1, name: 'Валентин', experience: 'старший мастер', photo: ''},
        { id: 2, name: 'Ева', experience: 'младший мастер', photo: ''},
        { id: 3, name: 'Ника', experience: 'младший мастер', photo: ''},
        { id: 4, name: 'Ева2', experience: 'младший мастер', photo: ''},
        { id: 5, name: 'Стас', experience: 'младший мастер', photo: ''},
        { id: 6, name: 'Андрей', experience: 'младший мастер', photo: ''},
    ],
    services: [
        { id: 1, name: 'Машинка + ножницы', price: '25€', duration: 45},
        { id : 2, name: 'Машинка', price: '20€', duration: 30},
        { id: 3, name: 'Удлиненная стрижка', price: '25-30€', duration: 60},
        { id: 4, name: 'Борода', price: '15€', duration: 30},
        { id : 5, name: 'Стрижка с бородой', price: '30€', duration: 60},
    ],
    shopInfo: {
        name: 'Vibe BarberShop',
        address: 'Avenue Van Volxem 248 Sint Gilis, Brussels, Belgium',
        workHours: 'Пн-Вс(Вт выходной): 10:00-20:00',
        instagram: '@vibe.barbershop.be',
        phone: '+32 470 12 34 56', 
        email: 'vibe@barbershop.be' 
    },
    defaultSchedule: {
        start: '10:00',
        end: '20:00',
        days: [1, 3, 4, 5, 6, 0]
    }
};

let state = {
    authToken: localStorage.getItem('authToken') || null,
    userRole: localStorage.getItem('userRole') || null,
    userId: localStorage.getItem('userId') || null,
    isAdmin: localStorage.getItem('userRole') === 'admin',
    
    masters: [],
    services: [],
    shopInfo: {},
    bookings: [],
    
    selectedDate: '',
    selectedTime: '',
    selectedBarber: null,
    selectedService: null,
    clientName: '',
    clientPhone: '',
    showSuccess: false,
    loading: false,
    error: null,
    
    defaultMasters: [...defaultData.masters],
    defaultServices: [...defaultData.services],
    defaultShopInfo: {...defaultData.shopInfo},
    defaultSchedule: {...defaultData.defaultSchedule}
};

const utils = {
    generateTimeSlots: function(startHour = 9, endHour = 20, interval = 30) {
        const slots = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                if (hour === endHour && minute > 0) break;
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    },

    formatDate: function(date) {
        return date.toISOString().split('T')[0];
    },

    getDayName: function(dateStr) {
        const date = new Date(dateStr);
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[date.getDay()];
    },

    getFullDayName: function(dateStr) {
        const date = new Date(dateStr);
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return days[date.getDay()];
    },

    isTimeSlotAvailable: function(date, time, barberId, serviceDuration = 30) {
        const barber = state.masters.find(m => m.id === barberId);
        if (!barber || !barber.schedule) return false;

        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();
        const schedule = barber.schedule;
        
        if (!schedule.days.includes(dayOfWeek)) return false;

        const [slotHour, slotMinute] = time.split(':').map(Number);
        const [startHour, startMinute] = schedule.start.split(':').map(Number);
        const [endHour, endMinute] = schedule.end.split(':').map(Number);

        const slotTime = slotHour * 60 + slotMinute;
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        const slotEndTime = slotTime + serviceDuration;

        if (slotTime < startTime || slotEndTime > endTime) return false;

        return !state.bookings.some(booking => {
            if (booking.date !== date || booking.barber !== barberId) return false;
            
            const [bookingHour, bookingMinute] = booking.time.split(':').map(Number);
            const bookingTime = bookingHour * 60 + bookingMinute;
            const bookingService = state.services.find(s => s.name === booking.service);
            const bookingDuration = bookingService ? bookingService.duration : 30;
            const bookingEndTime = bookingTime + bookingDuration;

            return (slotTime < bookingEndTime && slotEndTime > bookingTime);
        });
    },

    getAvailableTimeSlots: function() {
        if (!state.selectedBarber || !state.selectedDate) return [];

        const barber = state.masters.find(m => m.id === state.selectedBarber);
        if (!barber || !barber.schedule) return [];

        const selectedService = state.services.find(s => s.id === state.selectedService);
        const serviceDuration = selectedService ? selectedService.duration : 30;

        const schedule = barber.schedule;
        const [startHour] = schedule.start.split(':').map(Number);
        const [endHour] = schedule.end.split(':').map(Number);

        const allSlots = this.generateTimeSlots(startHour, endHour);
        
        return allSlots.filter(slot => 
            this.isTimeSlotAvailable(state.selectedDate, slot, state.selectedBarber, serviceDuration)
        );
    },

    validatePhone: function(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    },

    validateName: function(name) {
        return name.trim().length >= 2;
    },

    formatPhone: function(phone) {
        return phone.replace(/\D/g, '');
    }
};

const components = {
    barberSelector: function() {
        let html = '<div><h3>💈 Выберите мастера</h3><div class="barber-grid">';
        
        if (state.masters.length === 0) {
            html += '<div class="empty-state">Мастера не найдены</div>';
        } else {
            state.masters.forEach(barber => {
                const selected = state.selectedBarber === barber.id ? 'selected' : '';
                html += `<button class="barber-card ${selected}" onclick="selectBarber(${barber.id})">`;
                html += `<div class="photo">${barber.photo || '👨‍💼'}</div>`;
                html += `<div class="name">${barber.name}</div>`;
                html += `<div class="experience">${barber.experience}</div>`;
                html += '</button>';
            });
        }
        
        html += '</div></div>';
        return html;
    },
    
    datePicker: function() {
        const today = new Date();
        let html = '<div><h3>📅 Выберите дату</h3><div class="date-grid">';

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = utils.formatDate(date);
            const selected = state.selectedDate === dateStr ? 'selected' : '';
            const isAvailable = state.selectedBarber ? 
                state.masters.find(m => m.id === state.selectedBarber)?.schedule?.days.includes(date.getDay()) : true;
            
            html += `<button class="date-btn ${selected} ${!isAvailable ? 'disabled' : ''}" 
                     ${!isAvailable ? 'disabled' : ''} 
                     onclick="selectDate('${dateStr}')">`;
            html += `<div class="day">${utils.getDayName(dateStr)}</div>`;
            html += `<div class="date">${date.getDate()}</div>`;
            html += '</button>';
        }

        html += '</div></div>';
        return html;
    },

    timePicker: function() {
        const slots = utils.getAvailableTimeSlots();

        if (slots.length === 0) {
            return '<div><h3>🕒 Выберите время</h3><div class="empty-state">На выбранную дату нет доступных слотов</div></div>';
        }

        let html = '<div><h3>🕒 Выберите время</h3><div class="time-grid">';
        slots.forEach(time => {
            const selected = state.selectedTime === time ? 'selected' : '';
            html += `<button class="time-btn ${selected}" onclick="selectTime('${time}')">${time}</button>`;
        });
        html += '</div></div>';
        return html;
    },

    serviceSelector: function() {
        let html = '<div><h3>✂️ Выберите услугу</h3><div class="service-list">';
        
        if (state.services.length === 0) {
            html += '<div class="empty-state">Услуги не найдены</div>';
        } else {
            state.services.forEach(service => {
                const selected = state.selectedService === service.id ? 'selected' : '';
                html += `<button class="service-card ${selected}" onclick="selectService(${service.id})">`;
                html += '<div class="service-info">';
                html += `<div class="name">${service.name}</div>`;
                html += `<div class="duration">${service.duration} минут</div>`; 
                html += '</div>';
                html += `<div class="service-price">${service.price}</div>`;
                html += '</button>';   
            });
        }
        
        html += '</div></div>';
        return html;
    },

    bookingForm: function() {
        const selectedBarber = state.masters.find(m => m.id === state.selectedBarber);
        const selectedService = state.services.find(s => s.id === state.selectedService);
        
        let html = '<div><h3>📝 Контактные данные</h3>';
        
        html += '<div class="booking-summary">';
        html += `<div><strong>Мастер:</strong> ${selectedBarber?.name || 'Не выбран'}</div>`;
        html += `<div><strong>Услуга:</strong> ${selectedService?.name || 'Не выбрана'} - ${selectedService?.price || ''}</div>`;
        html += `<div><strong>Дата и время:</strong> ${state.selectedDate} ${state.selectedTime}</div>`;
        html += '</div>';
        
        html += '<div class="form-group"><label>Ваше имя *</label>';
        html += `<input type="text" id="clientName" class="form-input" placeholder="Введите ваше имя" 
                 value="${state.clientName}" oninput="updateClientName(this.value)"></div>`;
        html += '<div class="form-group"><label>Телефон *</label>';
        html += `<input type="tel" id="clientPhone" class="form-input" placeholder="+32 ___ __ __ __" 
                 value="${state.clientPhone}" oninput="updateClientPhone(this.value)"></div>`;
        html += `<button class="btn-primary" onclick="createBooking()" 
                 ${state.loading ? 'disabled' : ''}>${state.loading ? 'Загрузка...' : 'Записаться на прием'}</button>`;

        if (state.error) {
            html += `<div class="error-message">❌ ${state.error}</div>`;
        }

        if (state.showSuccess) {
            const barberName = selectedBarber?.name || 'мастер';
            const serviceName = selectedService?.name || 'услуга';
            html += `<div class="success-message">
                <h3>🎉 Запись прошла успешно!</h3>
                <p>Ждем вас <strong>${state.selectedTime} ${utils.getFullDayName(state.selectedDate)} ${state.selectedDate}</strong></p>
                <p>Мастер: <strong>${barberName}</strong></p>
                <p>Услуга: <strong>${serviceName}</strong></p>
            </div>`;
        }

        return html;
    },

    loginForm: function() {
        return `
            <div class="login-form">
                <h3>🔐 Вход для администратора</h3>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="adminEmail" class="form-input" placeholder="vibe@gmail.com" value="vibe@gmail.com">
                </div>
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" id="adminPassword" class="form-input" placeholder="admin123" value="admin123">
                </div>
                <button class="btn-primary" onclick="adminLogin()">Войти</button>
                <div style="text-align: center; margin-top: 15px;">
                    <button class="btn-secondary" onclick="render()">← Назад к записи</button>
                </div>
            </div>
        `;
    }
};

function selectBarber(id) {
    state.selectedBarber = id;
    state.selectedTime = '';
    state.selectedService = null;
    state.error = null;
    render();
}

function selectDate(date) {
    state.selectedDate = date;
    state.selectedTime = '';
    state.error = null;
    render();
}

function selectTime(time) {
    state.selectedTime = time;
    state.error = null;
    render();
}

function selectService(id) {
    state.selectedService = id;
    state.error = null;
    render();
}

function updateClientName(value) {
    state.clientName = value;
    state.error = null;
}

function updateClientPhone(value) {
    state.clientPhone = value;
    state.error = null;
}

async function createBooking() {
    if (!state.selectedDate || !state.selectedTime || !state.selectedBarber || !state.selectedService) {
        state.error = 'Пожалуйста, заполните все поля выбора';
        render();
        return;
    }

    if (!utils.validateName(state.clientName)) {
        state.error = 'Введите корректное имя (минимум 2 символа)';
        render();
        return;
    }

    if (!utils.validatePhone(state.clientPhone)) {
        state.error = 'Введите корректный номер телефона';
        render();
        return;
    }

    state.loading = true;
    state.error = null;
    render();

    const bookingData = {
        date: state.selectedDate,
        time: state.selectedTime,
        barber: state.selectedBarber,
        service: state.selectedService,
        clientName: state.clientName.trim(),
        clientPhone: utils.formatPhone(state.clientPhone)
    };

    const result = await api.createBooking(bookingData);

    state.loading = false;

    if (result.success) {
        state.showSuccess = true;
        state.selectedTime = '';
        state.selectedService = null;
        state.clientName = '';
        state.clientPhone = '';
        render();

        setTimeout(() => {
            state.showSuccess = false;
            render();
        }, 5000);
    } else {
        state.error = result.message || 'Ошибка при создании записи';
        render();
    }
}

async function adminLogin() {
    const email = document.getElementById('adminEmail')?.value;
    const password = document.getElementById('adminPassword')?.value;

    if (!email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    state.loading = true;
    render();

    const result = await api.login(email, password);

    state.loading = false;

    if (result.success) {
        state.isAdmin = state.userRole === 'admin';
        render();
    } else {
        alert('Ошибка входа: ' + (result.message || 'Неверные данные'));
        render();
    }
}

function adminLogout() {
    api.logout();
    state.isAdmin = false;
    render();
}

function showAdminLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>${state.shopInfo.name}</h1>
                <p>Вход в панель администратора</p>
            </div>
            ${components.loginForm()}
        </div>
    `;
}

function editSchedule(barberId) {
    document.getElementById('display-' + barberId).style.display = 'none';
    document.getElementById('form-' + barberId).style.display = 'block';
}

function cancelEdit(barberId) {
    document.getElementById('display-' + barberId).style.display = 'block';
    document.getElementById('form-' + barberId).style.display = 'none';
}

async function saveSchedule(barberId) {
    const start = document.getElementById('start-' + barberId).value;
    const end = document.getElementById('end-' + barberId).value;
    const dayButtons = document.querySelectorAll('#days-' + barberId + ' .day-btn');
    const days = [];

    dayButtons.forEach((btn, idx) => {
        if (btn.classList.contains('active')) {
            days.push(idx);
        }
    });
    
    const schedule = { start: start, end: end, days: days };
    
    state.loading = true;
    render();

    const result = await api.updateSchedule(barberId, schedule);

    state.loading = false;

    if (result.success) {
        const barber = state.masters.find(m => m.id === barberId);
        if (barber) {
            barber.schedule = schedule;
        }
        
        document.getElementById('display-' + barberId).style.display = 'block';
        document.getElementById('form-' + barberId).style.display = 'none';
        render();
    } else {
        alert('Ошибка сохранения расписания: ' + (result.message || 'Неизвестная ошибка'));
    }
}

function toggleDay(barberId, dayIdx, event) {
    event.currentTarget.classList.toggle('active');
}

function getBarberName(id) {
    const barber = state.masters.find(b => b.id === id);
    return barber ? barber.name : 'Неизвестно';
}

async function deleteBooking(bookingId) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        state.loading = true;
        render();
        
        const result = await api.deleteBooking(bookingId);
        
        state.loading = false;
        
        if (result.success) {
            render();
        } else {
            alert('Ошибка при удалении записи: ' + (result.message || 'Неизвестная ошибка'));
            render();
        }
    }
}

async function clearAllBookings() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ записи? Это действие нельзя отменить.')) {
        state.loading = true;
        render();
        
        const result = await api.clearAllBookings();
        
        state.loading = false;
        
        if (result.success) {
            alert(result.message);
            render();
        } else {
            alert('Ошибка при очистке записей: ' + (result.message || 'Неизвестная ошибка'));
            render();
        }
    }
}

function renderClient() {
    let html = '<div class="container">';
    
    html += `
        <div class="contact-header">
            <div class="contact-info">
                <div class="contact-item">
                    <span class="icon">📍</span>
                    <span class="text">${state.shopInfo.address}</span>
                </div>
                <div class="contact-item">
                    <span class="icon">📞</span>
                    <span class="text">${state.shopInfo.phone}</span>
                </div>
                <div class="contact-item">
                    <span class="icon">🕐</span>
                    <span class="text">${state.shopInfo.workHours}</span>
                </div>
                <div class="contact-item">
                    <span class="icon">📧</span>
                    <span class="text">${state.shopInfo.email}</span>
                </div>
                <div class="contact-item">
                    <span class="icon">📱</span>
                    <span class="text">${state.shopInfo.instagram}</span>
                </div>
            </div>
        </div>
    `;
    
    html += '<div class="header">';
    html += '<div class="logo">VIBE</div>';
    html += '<h1>' + state.shopInfo.name + '</h1>';
    html += '<p>Профессиональный уход за вашим стилем</p>';
    html += '</div>';
    
    if (!state.isAdmin) {
        html += '<div style="text-align: center; margin-bottom: 20px;">';
        html += '<button class="admin-login-btn" onclick="showAdminLogin()">🔐 Вход для админа</button>';
        html += '</div>';
    }
    
    html += '<div class="grid"><div class="card"><h2>Онлайн запись</h2>';
    
    if (state.loading) {
        html += '<div class="loading">Загрузка...</div>';
    } else {
        html += components.barberSelector();

        if (state.selectedBarber) {
            html += components.datePicker();

            if (state.selectedDate) {
                html += components.timePicker();

                if (state.selectedTime) {
                    html += components.serviceSelector();

                    if (state.selectedService) {
                        html += components.bookingForm();
                    }
                }
            }
        }
    }

    html += '</div></div></div>';
    return html;
}

function renderAdmin() {
    const dayNames = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

    let html = '<div class="container">';
    html += '<div class="admin-header"><h1>Панель Администратора Vibe BarberShop</h1>';
    html += `<button class="admin-logout-btn" onclick="adminLogout()" ${state.loading ? 'disabled' : ''}>${state.loading ? 'Загрузка...' : 'Выйти'}</button></div>`;

    html += '<div class="card" style="margin-bottom: 20px;">';
    html += '<h2>Управление записями</h2>';
    html += '<div style="display: flex; gap: 15px; flex-wrap: wrap;">';
    html += `<button class="btn-primary" onclick="clearAllBookings()" style="width: auto; padding: 12px 20px;" ${state.loading ? 'disabled' : ''}>`;
    html += '🗑️ Очистить все записи';
    html += '</button>';
    html += '<div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">';
    html += `Всего записей: ${state.bookings.length}`;
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="card"><h2>Управление графиком работы</h2>';
    
    if (state.masters.length === 0) {
        html += '<div class="empty-state">Мастера не найдены</div>';
    } else {
        state.masters.forEach(barber => {
            const schedule = barber.schedule || state.defaultSchedule;
            html += '<div class="schedule-item">';
            html += '<div class="schedule-header"><h4>' + barber.name + '</h4>';
            html += '<button class="btn-edit" onclick="editSchedule(' + barber.id + ')">Редактировать</button></div>';
            
            html += '<div class="schedule-display" id="display-' + barber.id + '">';
            html += '<div><strong>Время:</strong> ' + schedule.start + ' - ' + schedule.end + '</div>';
            html += '<div><strong>Дни:</strong> ' + schedule.days.map(d => dayNames[d]).join(', ') + '</div>';
            html += '</div>';
            
            html += '<div class="schedule-form" id="form-' + barber.id + '" style="display: none;">';
            html += '<div class="time-inputs">';
            html += '<div class="form-group"><label>Начало работы</label>';
            html += '<input type="time" class="form-input" id="start-' + barber.id + '" value="' + schedule.start + '"></div>';
            html += '<div class="form-group"><label>Конец работы</label>';
            html += '<input type="time" class="form-input" id="end-' + barber.id + '" value="' + schedule.end + '"></div>';
            html += '</div>';
            
            html += '<div class="form-group"><label>Рабочие дни</label>';
            html += '<div class="days-selector" id="days-' + barber.id + '">';
            dayNames.forEach((day, idx) => {
                const active = schedule.days.includes(idx) ? 'active' : '';
                html += '<button class="day-btn ' + active + '" onclick="toggleDay(' + barber.id + ', ' + idx + ', event)">' + day + '</button>';
            });
            html += '</div></div>';
            
            html += '<div class="action-buttons">';
            html += '<button class="btn-primary" onclick="saveSchedule(' + barber.id + ')">Сохранить</button>';
            html += '<button class="btn-secondary" onclick="cancelEdit(' + barber.id + ')">Отмена</button>';
            html += '</div>';
            
            html += '</div>';
            html += '</div>';
        });
    }
    html += '</div>';

    html += '<div class="card"><h2>Все записи</h2>';
    if (state.bookings.length === 0) {
        html += '<div class="empty-state">Записей пока нет</div>';
    } else {
        html += '<table class="bookings-table"><thead><tr>';
        html += '<th>Дата</th><th>Время</th><th>Клиент</th><th>Телефон</th><th>Мастер</th><th>Услуга</th><th>Статус</th><th>Действия</th>';
        html += '</tr></thead><tbody>';

        const sortedBookings = [...state.bookings].sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });

        sortedBookings.forEach(booking => {
            html += '<tr>';
            html += '<td>' + booking.date + '</td>';
            html += '<td>' + booking.time + '</td>';
            html += '<td>' + booking.clientName + '</td>';
            html += '<td>' + booking.clientPhone + '</td>';
            html += '<td>' + getBarberName(booking.barber) + '</td>';
            html += '<td>' + booking.service + '</td>';
            html += '<td>' + (booking.status || 'подтверждена') + '</td>';
            html += '<td><button class="btn-secondary" onclick="deleteBooking(' + booking.id + ')" style="padding: 5px 10px; font-size: 12px;">Удалить</button></td>';
            html += '</tr>';
        });
        
        html += '</tbody></table>';
    }
    html += '</div>';

    html += '</div>';
    return html;
}

function render() {
    const app = document.getElementById('app');
    app.innerHTML = state.isAdmin ? renderAdmin() : renderClient();
}

document.addEventListener('DOMContentLoaded', async function() {
    const today = new Date();
    state.selectedDate = utils.formatDate(today);
    
    state.masters = [...state.defaultMasters];
    state.services = [...state.defaultServices];
    state.shopInfo = {...state.defaultShopInfo};
    
    state.masters.forEach(master => {
        if (!master.schedule) {
            master.schedule = {...state.defaultSchedule};
        }
    });
    
    render();
    
    if (state.authToken) {
        state.loading = true;
        render();
        
        await api.loadInitialData();
        
        state.loading = false;
        render();
    }
});