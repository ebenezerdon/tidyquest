window.App = window.App || {};

(function() {
    App.Utils = {
        uuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        
        formatDate(dateStr) {
            if (!dateStr) return 'No Date';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        },

        // Simple toast notification
        showToast(message) {
            const $toast = $(`<div class="toast"><span>${message}</span></div>`);
            $('body').append($toast);
            setTimeout(() => $toast.addClass('show'), 10);
            setTimeout(() => {
                $toast.removeClass('show');
                setTimeout(() => $toast.remove(), 300);
            }, 3000);
        }
    };

    App.Storage = {
        KEY: 'tidyquest_data',
        load() {
            const raw = localStorage.getItem(this.KEY);
            if (raw) return JSON.parse(raw);
            return this.seed();
        },
        save(data) {
            localStorage.setItem(this.KEY, JSON.stringify(data));
        },
        seed() {
            // Initial Demo Data
            const m1 = App.Utils.uuid();
            const m2 = App.Utils.uuid();
            const data = {
                members: [
                    { id: m1, name: 'Mom', avatar: '👩', color: '#ec4899', points: 150 },
                    { id: m2, name: 'Alex', avatar: '👦', color: '#3b82f6', points: 50 }
                ],
                chores: [
                    { id: App.Utils.uuid(), title: 'Empty Dishwasher', points: 20, assigneeId: m1, frequency: 'daily', status: 'pending', dueDate: new Date().toISOString().split('T')[0] },
                    { id: App.Utils.uuid(), title: 'Clean Room', points: 50, assigneeId: m2, frequency: 'weekly', status: 'pending', dueDate: new Date().toISOString().split('T')[0] }
                ],
                rewards: [
                    { id: App.Utils.uuid(), title: 'Ice Cream Trip', cost: 100, icon: '🍦' },
                    { id: App.Utils.uuid(), title: '1 Hour Video Games', cost: 50, icon: '🎮' }
                ],
                history: []
            };
            this.save(data);
            return data;
        }
    };
})();