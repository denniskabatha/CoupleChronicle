document.addEventListener('DOMContentLoaded', function() {
    // Initialize the calendar
    const calendarEl = document.getElementById('calendar');
    
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
            },
            themeSystem: 'bootstrap5',
            events: '/calendar/events',
            editable: false,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            weekNumbers: true,
            navLinks: true,
            businessHours: true,
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
            },
            // Open event details modal when clicking on an event
            eventClick: function(info) {
                showEventModal(info.event);
            },
            // Open create event form when selecting a date range
            select: function(info) {
                // Only proceed if user is logged in
                const isLoggedIn = document.body.dataset.loggedIn === 'true';
                if (isLoggedIn) {
                    redirectToCreateEvent(info.startStr, info.endStr, info.allDay);
                } else {
                    // Show login required message
                    const alertContainer = document.getElementById('calendar-alerts');
                    if (alertContainer) {
                        const alert = document.createElement('div');
                        alert.className = 'alert alert-warning alert-dismissible fade show';
                        alert.innerHTML = `
                            <strong>Login Required!</strong> Please log in to create events.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        `;
                        alertContainer.appendChild(alert);
                        
                        // Automatically remove the alert after 3 seconds
                        setTimeout(() => {
                            alert.remove();
                        }, 3000);
                    }
                }
                calendar.unselect();
            },
            loading: function(isLoading) {
                // Show or hide a loading indicator
                const loadingEl = document.getElementById('calendar-loading');
                if (loadingEl) {
                    if (isLoading) {
                        loadingEl.style.display = 'block';
                    } else {
                        loadingEl.style.display = 'none';
                    }
                }
            }
        });
        
        calendar.render();
        
        // Add responsive behavior to the calendar
        window.addEventListener('resize', function() {
            if (window.innerWidth < 768) {
                calendar.changeView('listMonth');
            } else {
                calendar.changeView('dayGridMonth');
            }
        });
        
        // Initially check width on load
        if (window.innerWidth < 768) {
            calendar.changeView('listMonth');
        }
    }
    
    // Function to show event details in a modal
    function showEventModal(event) {
        const modalTitle = document.getElementById('eventModalLabel');
        const modalBody = document.getElementById('eventModalBody');
        const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
        
        if (modalTitle && modalBody) {
            modalTitle.textContent = event.title;
            
            // Format the event start and end dates
            let dateInfo = formatEventDates(event);
            
            // Prepare the event info HTML
            let eventHTML = `
                <div class="event-details">
                    <div class="mb-3">
                        <strong>Date:</strong> ${dateInfo}
                    </div>
            `;
            
            if (event.extendedProps.description) {
                eventHTML += `
                    <div class="mb-3">
                        <strong>Description:</strong>
                        <p>${event.extendedProps.description}</p>
                    </div>
                `;
            }
            
            if (event.extendedProps.location) {
                eventHTML += `
                    <div class="mb-3">
                        <strong>Location:</strong>
                        <p>${event.extendedProps.location}</p>
                    </div>
                `;
            }
            
            if (event.extendedProps.event_type) {
                eventHTML += `
                    <div class="mb-3">
                        <strong>Event Type:</strong>
                        <span class="badge bg-${getEventTypeColor(event.extendedProps.event_type)}">${capitalizeFirstLetter(event.extendedProps.event_type)}</span>
                    </div>
                `;
            }
            
            // Add edit and delete buttons if the user is logged in and is either admin or event owner
            const isLoggedIn = document.body.dataset.loggedIn === 'true';
            const currentUserId = parseInt(document.body.dataset.userId || '0');
            const isAdmin = document.body.dataset.isAdmin === 'true';
            const eventUserId = event.extendedProps.user_id;
            
            if (isLoggedIn && (isAdmin || currentUserId === eventUserId)) {
                eventHTML += `
                    <div class="mt-4">
                        <a href="/calendar/${event.id}/edit" class="btn btn-outline-primary btn-sm me-2">
                            <i class="bi bi-pencil"></i> Edit
                        </a>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteEvent(${event.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                `;
            }
            
            eventHTML += `</div>`;
            
            modalBody.innerHTML = eventHTML;
            eventModal.show();
        }
    }
    
    // Helper function to format event dates
    function formatEventDates(event) {
        const startDate = event.start;
        const endDate = event.end;
        const allDay = event.allDay;
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        
        if (allDay) {
            if (endDate) {
                // Multi-day all-day event
                return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
            } else {
                // Single-day all-day event
                return startDate.toLocaleDateString('en-US', options);
            }
        } else {
            // Event with specific times
            const timeOptions = {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            };
            
            if (endDate) {
                // Event with start and end time
                if (startDate.getDate() === endDate.getDate() && 
                    startDate.getMonth() === endDate.getMonth() &&
                    startDate.getFullYear() === endDate.getFullYear()) {
                    // Same day event
                    return `${startDate.toLocaleDateString('en-US', options)} from ${startDate.toLocaleTimeString('en-US', timeOptions)} to ${endDate.toLocaleTimeString('en-US', timeOptions)}`;
                } else {
                    // Multi-day event
                    return `${startDate.toLocaleDateString('en-US', options)} at ${startDate.toLocaleTimeString('en-US', timeOptions)} to ${endDate.toLocaleDateString('en-US', options)} at ${endDate.toLocaleTimeString('en-US', timeOptions)}`;
                }
            } else {
                // Event with only start time
                return `${startDate.toLocaleDateString('en-US', options)} at ${startDate.toLocaleTimeString('en-US', timeOptions)}`;
            }
        }
    }
    
    // Helper function to determine badge color based on event type
    function getEventTypeColor(eventType) {
        const colors = {
            'anniversary': 'danger',
            'date': 'info',
            'birthday': 'warning',
            'special': 'purple',
            'other': 'secondary'
        };
        
        return colors[eventType] || 'secondary';
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Function to redirect to create event page with date parameters
    function redirectToCreateEvent(startStr, endStr, allDay) {
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        
        // Format the dates for the URL
        const formattedStart = startDate.toISOString().slice(0, 16);
        let formattedEnd = '';
        
        if (allDay) {
            // For all-day events, adjust the end date (FullCalendar sets it to the next day)
            endDate.setDate(endDate.getDate() - 1);
            formattedEnd = endDate.toISOString().slice(0, 16);
        } else {
            formattedEnd = endDate.toISOString().slice(0, 16);
        }
        
        // Redirect to the create event page with date parameters
        window.location.href = `/calendar/create?start=${formattedStart}&end=${formattedEnd}&allDay=${allDay}`;
    }
    
    // Global function to handle event deletion
    window.deleteEvent = function(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/calendar/${eventId}/delete`;
            document.body.appendChild(form);
            form.submit();
        }
    };
});
