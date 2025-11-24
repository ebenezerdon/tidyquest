window.App = window.App || {};

(function() {
    const UI = {};

    // --- Renderers ---
    UI.renderDashboard = function() {
        const data = App.Data.store;
        
        // Update Stats
        const pending = data.chores.filter(c => c.status === 'pending').length;
        $('#dash-pending-count').text(pending);

        // Top Earner (Mock calculation based on points total for now)
        const sortedMembers = [...data.members].sort((a, b) => b.points - a.points);
        if (sortedMembers.length > 0) {
            const top = sortedMembers[0];
            $('#dash-top-earner').html(`
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background-color: ${top.color}20">${top.avatar}</div>
                <div class="flex flex-col">
                    <span>${top.name}</span>
                    <span class="text-xs text-gray-500 font-normal">${top.points} XP</span>
                </div>
            `);
        }

        // Today's Tasks List (Preview)
        const $list = $('#dash-chores-list').empty();
        const pendingChores = data.chores.filter(c => c.status === 'pending').slice(0, 3);
        
        if (pendingChores.length === 0) {
            $list.append('<div class="text-gray-400 italic">No chores pending!</div>');
        } else {
            pendingChores.forEach(chore => {
                const member = data.members.find(m => m.id === chore.assigneeId);
                const memberHtml = member 
                    ? `<div class="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gray-100" title="${member.name}">${member.avatar}</div>`
                    : `<div class="w-6 h-6 rounded-full bg-gray-200"></div>`;
                
                $list.append(`
                    <div class="flex items-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div class="w-2 h-10 rounded-full mr-3" style="background-color: ${member ? member.color : '#ccc'}"></div>
                        <div class="flex-1">
                            <div class="font-bold text-gray-800">${chore.title}</div>
                            <div class="text-xs text-gray-500">${chore.points} XP</div>
                        </div>
                        ${memberHtml}
                    </div>
                `);
            });
        }

        // Leaderboard
        const $lb = $('#dash-leaderboard').empty();
        sortedMembers.forEach((m, idx) => {
            $lb.append(`
                <div class="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                    <div class="flex items-center gap-4">
                        <div class="text-lg font-bold text-gray-300 w-6">#${idx + 1}</div>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner" style="background-color: ${m.color}30">${m.avatar}</div>
                        <span class="font-bold text-gray-800">${m.name}</span>
                    </div>
                    <div class="font-black text-[hsl(174,80%,40%)]">${m.points} XP</div>
                </div>
            `);
        });
    };

    UI.renderChores = function() {
        const $container = $('#chores-list-container').empty();
        const chores = App.Data.store.chores;

        if (chores.length === 0) {
            $('#chores-empty-state').removeClass('hidden');
            return;
        }
        $('#chores-empty-state').addClass('hidden');

        // Sort: Pending first, then by due date
        chores.sort((a, b) => (a.status === b.status ? 0 : a.status === 'pending' ? -1 : 1));

        chores.forEach(c => {
            const member = App.Data.store.members.find(m => m.id === c.assigneeId);
            const isDone = c.status === 'completed';
            const color = member ? member.color : '#9ca3af';
            
            const card = $(`
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:shadow-md ${isDone ? 'opacity-60 grayscale' : ''}">
                    <div class="absolute top-0 left-0 w-1 h-full" style="background-color: ${color}"></div>
                    <div class="flex justify-between items-start mb-3 pl-2">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">${c.frequency}</span>
                            <h3 class="text-lg font-bold text-gray-900 ${isDone ? 'line-through' : ''}">${c.title}</h3>
                        </div>
                        <div class="bg-[hsl(174,80%,95%)] text-[hsl(174,80%,40%)] px-2 py-1 rounded-lg text-xs font-bold">+${c.points} XP</div>
                    </div>
                    <div class="flex justify-between items-center pl-2">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-100">${member ? member.avatar : '?'}</div>
                            <span class="text-sm text-gray-600">${member ? member.name : 'Unassigned'}</span>
                        </div>
                        ${!isDone ? `<button class="btn-complete bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-[hsl(174,80%,40%)] transition-colors" data-id="${c.id}">Done</button>` : '<span class="text-green-600 font-bold text-sm">✓ Complete</span>'}
                    </div>
                    <button class="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 btn-delete-chore" data-id="${c.id}">&times;</button>
                </div>
            `);
            $container.append(card);
        });
    };

    UI.renderRewards = function() {
        const $container = $('#rewards-list-container').empty();
        App.Data.store.rewards.forEach(r => {
             $container.append(`
                <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                    <div class="w-16 h-16 rounded-2xl bg-[hsl(30,90%,96%)] flex items-center justify-center text-3xl mb-4">${r.icon}</div>
                    <h3 class="font-bold text-gray-900 mb-1">${r.title}</h3>
                    <div class="text-[hsl(174,80%,40%)] font-black text-xl mb-4">${r.cost} XP</div>
                    <button class="w-full py-2 rounded-xl border-2 border-gray-100 font-bold text-gray-600 hover:border-[hsl(174,80%,40%)] hover:text-[hsl(174,80%,40%)] transition-colors btn-redeem" data-id="${r.id}" data-cost="${r.cost}">Redeem</button>
                </div>
             `);
        });
    };

    UI.renderMembers = function() {
        const $container = $('#members-list-container').empty();
        App.Data.store.members.forEach(m => {
            $container.append(`
                <div class="bg-white rounded-3xl p-6 shadow-sm border-t-4 flex flex-col items-center relative" style="border-color: ${m.color}">
                    <div class="w-20 h-20 rounded-full border-4 border-white shadow-lg -mt-10 bg-gray-50 flex items-center justify-center text-4xl mb-4">${m.avatar}</div>
                    <h3 class="text-xl font-bold text-gray-900">${m.name}</h3>
                    <div class="text-3xl font-black text-gray-800 my-2">${m.points} <span class="text-sm text-gray-400 font-normal">XP</span></div>
                    <button class="text-red-400 text-xs hover:text-red-600 mt-2 btn-delete-member" data-id="${m.id}">Remove</button>
                </div>
            `);
        });
    };

    // --- Modal & Confetti ---
    UI.showModal = function(id) {
        $(`#modal-${id}`).removeClass('hidden');
        // Populate member select for chore modal specifically
        if (id === 'chore') {
            const $sel = $('#chore-assignee-select').empty();
            App.Data.store.members.forEach(m => {
                $sel.append(`<option value="${m.id}">${m.avatar} ${m.name}</option>`);
            });
        }
    };

    UI.hideModal = function(id) {
        $(`#modal-${id}`).addClass('hidden');
        // Reset forms
        $(`#form-${id}`)[0].reset();
        $('#ai-suggestions').addClass('hidden');
    };

    UI.fireConfetti = function() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const colors = ['#14b8a6', '#f97316', '#fbbf24', '#ec4899'];
        
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 8 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 100
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            particles.forEach(p => {
                if (p.life > 0) {
                    active = true;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.5; // Gravity
                    p.life--;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                }
            });
            if (active) requestAnimationFrame(animate);
        }
        animate();
    };

    App.UI = UI;
})();