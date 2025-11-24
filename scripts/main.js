$(function() {
    // Contract Check
    if (!window.App || !window.App.UI || !window.App.Storage) {
        console.error('Critical dependencies missing');
        return;
    }

    // Data Store
    App.Data = {
        store: App.Storage.load(),
        save() {
            App.Storage.save(this.store);
            this.refresh();
        },
        refresh() {
            App.UI.renderDashboard();
            App.UI.renderChores();
            App.UI.renderRewards();
            App.UI.renderMembers();
        }
    };

    // Initialize
    App.Init = function() {
        App.Data.refresh();
        
        // Setup Navigation
        $('button[data-view]').on('click', function() {
            const view = $(this).data('view');
            $('.view-section').addClass('hidden');
            $(`#view-${view}`).removeClass('hidden');
            
            $('.nav-btn').removeClass('text-[hsl(174,80%,40%)] bg-[hsl(174,80%,95%)] font-bold').addClass('text-gray-600');
            $(this).addClass('text-[hsl(174,80%,40%)] bg-[hsl(174,80%,95%)] font-bold').removeClass('text-gray-600');

            // Mobile
            if(window.innerWidth < 768) {
                // Simple highlighting for bottom nav
                $('.nav-btn').removeClass('text-[hsl(174,80%,40%)]');
                $(this).addClass('text-[hsl(174,80%,40%)]');
            }
        });

        // Modal Triggers
        $('#btn-add-chore').click(() => App.UI.showModal('chore'));
        $('#btn-add-member').click(() => App.UI.showModal('member'));
        $('#btn-add-reward').click(() => App.UI.showModal('reward'));

        // Form Handlers
        $('#form-chore').on('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const newChore = {
                id: App.Utils.uuid(),
                title: formData.get('title'),
                points: parseInt(formData.get('points')),
                dueDate: formData.get('dueDate'),
                assigneeId: formData.get('assigneeId'),
                frequency: formData.get('frequency'),
                status: 'pending'
            };
            App.Data.store.chores.push(newChore);
            App.Data.save();
            App.UI.hideModal('chore');
            App.Utils.showToast('Chore created!');
        });

        $('#form-member').on('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const newMember = {
                id: App.Utils.uuid(),
                name: formData.get('name'),
                avatar: $('#member-avatar-input').val(),
                color: formData.get('color'),
                points: 0
            };
            App.Data.store.members.push(newMember);
            App.Data.save();
            App.UI.hideModal('member');
        });

        $('#form-reward').on('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const newReward = {
                id: App.Utils.uuid(),
                title: formData.get('title'),
                cost: parseInt(formData.get('cost')),
                icon: formData.get('icon')
            };
            App.Data.store.rewards.push(newReward);
            App.Data.save();
            App.UI.hideModal('reward');
        });

        // Actions (Delegate)
        $(document).on('click', '.btn-complete', function() {
            const id = $(this).data('id');
            const chore = App.Data.store.chores.find(c => c.id === id);
            if (chore) {
                chore.status = 'completed';
                // Award Points
                const member = App.Data.store.members.find(m => m.id === chore.assigneeId);
                if (member) member.points += chore.points;
                App.Data.save();
                App.UI.fireConfetti();
                App.Utils.showToast(`+${chore.points} Points for ${member ? member.name : 'Household'}!`);
            }
        });

        $(document).on('click', '.btn-delete-chore', function() {
            const id = $(this).data('id');
            App.Data.store.chores = App.Data.store.chores.filter(c => c.id !== id);
            App.Data.save();
        });
        
        $(document).on('click', '.btn-delete-member', function() {
            if(confirm('Remove this member?')) {
                const id = $(this).data('id');
                App.Data.store.members = App.Data.store.members.filter(m => m.id !== id);
                // Unassign chores
                App.Data.store.chores.forEach(c => {
                    if(c.assigneeId === id) c.assigneeId = null;
                });
                App.Data.save();
            }
        });

        // Emoji Selector Logic
        $('.emoji-btn').click(function() {
            const val = $(this).data('val');
            $('#member-avatar-input').val(val);
            $('.emoji-btn').removeClass('bg-blue-100 ring-2 ring-blue-300');
            $(this).addClass('bg-blue-100 ring-2 ring-blue-300');
        });

    };

    // Start
    App.Init();
});