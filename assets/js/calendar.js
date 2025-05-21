class DoctorSchedule {
    static SCHEDULE_DIR = '/data/Schedule_data/';
    
    constructor() {
        this.currentDate = new Date('2025-01-13');
        this.currentLang = 'zh-hant';
        this.translations = {
            weekdays: {
                text: {
                    'zh-hant': ['週一', '週二', '週三', '週四', '週五', '週六'],
                    'en': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                }
            },
            status: {
                'available': {
                    'zh-hant': '可預約',
                    'en': 'Available'
                },
                'unavailable': {
                    'zh-hant': '不開診',
                    'en': 'Unavailable'
                },
                'full': {
                    'zh-hant': '已額滿',
                    'en': 'Full'
                }
            },
            time_slots: {
                'morning': {
                    'zh-hant': '上午',
                    'en': 'Morning'
                },
                'afternoon': {
                    'zh-hant': '下午',
                    'en': 'Afternoon'
                },
                'evening': {
                    'zh-hant': '晚上',
                    'en': 'Evening'
                }
            }
        };
        
        this.doctors = [
            { id: "1", name: "OralPath Anteater", specialty: "Oral Pathology" },
            { id: "2", name: "Extractosaurus", specialty: "Oral Surgery" },
            { id: "3", name: "Scaling Kitty", specialty: "Periodontology" },
            { id: "4", name: "ProsthoWolf", specialty: "Operative Dentistry" },
            { id: "5", name: "PedoRabbit", specialty: "Pedodontics" },
            { id: "6", name: "LaviSheep", specialty: "Orthodontics" },
            { id: "7", name: "Captain Frontal Lobotomy", specialty: "Neurosurgery" }
        ];
        
        this.initialize();
    }

    async initialize() {
        try {
            const loadingElement = document.getElementById('calendar-loading');
            const gridElement = document.getElementById('schedule-grid');
            
            if (loadingElement) loadingElement.style.display = 'flex';
            if (gridElement) gridElement.style.display = 'none';
            
            const schedule = await this.loadSchedule();
            this.renderCalendar(schedule);
            
            if (loadingElement) loadingElement.style.display = 'none';
            if (gridElement) gridElement.style.display = 'grid';
        } catch (error) {
            console.error('Failed to initialize calendar:', error);
            if (document.getElementById('calendar-loading')) {
                document.getElementById('calendar-loading').textContent = 'Failed to load calendar';
            }
        }
    }

    async loadSchedule() {
        try {
            const monday = new Date(this.currentDate);
            const dayOffset = monday.getDay() === 0 ? -6 : 1 - monday.getDay();
            monday.setDate(monday.getDate() + dayOffset);
            
            const dateStr = monday.toISOString().slice(0,10).replace(/-/g, '');
            const filePath = `${window.location.origin}${DoctorSchedule.SCHEDULE_DIR}${dateStr}.json`;
            
            console.log('Loading schedule from:', filePath);
            
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Schedule not found for week of ${monday.toISOString().slice(0,10)}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Failed to load schedule:', error);
            throw error;
        }
    }

    renderCalendar(schedule) {
        const grid = document.getElementById('schedule-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        const weekDates = this.getWeekDates();
        
        // Add headers
        this.addHeaders(grid, weekDates);
        
        // Add schedule for each doctor
        this.doctors.forEach(doctor => {
            this.addDoctorSchedule(grid, doctor, weekDates, schedule);
        });
    }

    addHeaders(grid, weekDates) {
        grid.appendChild(this.createCell('科別', 'grid-header'));
        grid.appendChild(this.createCell('醫師', 'grid-header'));
        grid.appendChild(this.createCell('時段', 'grid-header'));
        
        weekDates.forEach((date, index) => {
            if (index < 6) { // Mon-Sat only
                const weekday = this.translations.weekdays.text[this.currentLang][index];
                const dateStr = `${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
                grid.appendChild(this.createCell(`${weekday}<br>${dateStr}`, 'grid-header'));
            }
        });
    }

    addDoctorSchedule(grid, doctor, weekDates, schedule) {
        // Add specialty
        grid.appendChild(this.createCell(doctor.specialty, 'specialty-name'));
        
        // Add doctor name
        grid.appendChild(this.createCell(doctor.name, 'doctor-name'));
        
        // Add time slots column
        const timeSlotCell = this.createCell('', 'time-slots-column');
        timeSlotCell.innerHTML = Object.keys(this.translations.time_slots)
            .map(slot => this.translations.time_slots[slot][this.currentLang])
            .join('<br>');
        grid.appendChild(timeSlotCell);
        
        // Add schedule for each day
        weekDates.forEach((date, index) => {
            if (index < 6) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                
                const slots = schedule[year]?.[month]?.[day]?.[doctor.id] || {
                    morning: 'unavailable',
                    afternoon: 'unavailable',
                    evening: 'unavailable'
                };
                
                ['morning', 'afternoon', 'evening'].forEach(slot => {
                    const status = slots[slot] || 'unavailable';
                    const slotDiv = document.createElement('div');
                    slotDiv.className = `time-slot ${status}`;
                    slotDiv.textContent = this.translations.status[status][this.currentLang];
                    cell.appendChild(slotDiv);
                });
                
                grid.appendChild(cell);
            }
        });
    }

    getWeekDates() {
        const dates = [];
        const startOfWeek = new Date(this.currentDate);
        const diff = startOfWeek.getDay() === 0 ? -6 : 1 - startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() + diff);
        
        for (let i = 0; i < 6; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    createCell(content, className) {
        const cell = document.createElement('div');
        cell.className = `grid-cell ${className}`;
        cell.innerHTML = content;
        return cell;
    }

    prevWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.initialize();
    }

    nextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.initialize();
    }
}

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Initialize calendar
    window.doctorSchedule = new DoctorSchedule();
    
    // Set up navigation buttons
    const prevButton = document.getElementById('prev-week');
    const nextButton = document.getElementById('next-week');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (window.doctorSchedule) window.doctorSchedule.prevWeek();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (window.doctorSchedule) window.doctorSchedule.nextWeek();
        });
    }
}); 