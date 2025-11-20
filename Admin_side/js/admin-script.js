// Basic courier state and helper functions for AdminDashboard
// Provides: couriers (array), nextId (number), renderTable(), logout(), addCourier(), and persistence

(function(){
    // Load from localStorage or seed with sample data
    const stored = localStorage.getItem('yash_couriers');
    window.couriers = stored ? JSON.parse(stored) : [
        { id: 'CN-1', sender: 'Reliance Fresh', senderAddress: 'Shop No. 12, Sector 18, Ahmedabad', receiver: 'Rahul Sharma', receiverAddress: 'Plot No. 42, Rajkot', phone: '9999999999', estimatedDelivery: '2025-11-10', status: 'Delivered', date: '2025-11-07' }
    ];

    // nextId persisted separately
    const storedNext = localStorage.getItem('yash_nextId');
    window.nextId = storedNext ? parseInt(storedNext, 10) : (window.couriers.length + 1);

    function persist(){
        localStorage.setItem('yash_couriers', JSON.stringify(window.couriers));
        localStorage.setItem('yash_nextId', String(window.nextId));
    }

    // Render the courier list to a table or fallback to Recent Activity card
    window.renderTable = function(){
        // If there's an element with id 'couriersTable', render rows there
        const table = document.getElementById('couriersTable');
        if(table){
            const tbody = table.querySelector('tbody') || (function(){ const b = document.createElement('tbody'); table.appendChild(b); return b; })();
            tbody.innerHTML = '';
            window.couriers.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.id}</td>
                    <td>${escapeHtml(c.sender)}</td>
                    <td>${escapeHtml(c.receiver)}</td>
                    <td>${escapeHtml(c.status)}</td>
                    <td>${escapeHtml(c.estimatedDelivery || '')}</td>
                `;
                tbody.appendChild(tr);
            });
            return;
        }

        // Fallback: update the Recent Activity card (first .card .card-body)
        const recentBody = document.querySelector('.card .card-body');
        if(!recentBody) return;
        // create a new activity item for the most recent courier
        const latest = window.couriers[0];
        if(!latest) return;
        const item = document.createElement('div');
        item.className = 'activity-item p-3 d-flex align-items-start';
        item.innerHTML = `
            <div class="activity-icon bg-primary me-3"><i class="fas fa-box"></i></div>
            <div class="flex-fill">
                <div class="d-flex justify-content-between">
                    <h6 class="mb-1">New courier added: ${escapeHtml(latest.id)} to ${escapeHtml(latest.receiver)}</h6>
                    <small class="text-muted">${escapeHtml(latest.id)} • just now</small>
                </div>
                <p class="text-muted small mb-0">${escapeHtml(latest.receiverAddress || '')}</p>
            </div>
        `;
        // Insert at the top of card-body
        recentBody.insertBefore(item, recentBody.firstChild);
    };

    // Simple logout handler
    window.logout = function(){
        // implement your real logout here. For now, clear session-like state and redirect to a login page if present
        try{ localStorage.removeItem('yash_session'); }catch(e){}
        // Also clear common user keys if present
        try{ localStorage.removeItem('cts_current_user'); }catch(e){}
        try{ localStorage.removeItem('yash_user'); }catch(e){}
        // Redirect to the project's login page. The login file in this project is
        // The project's login file is located in the top-level `Home` folder.
        // Use the correct relative path from Admin_side and encode it to
        // handle spaces in the filename. Fallback to a sibling 'login.html'
        // if navigation fails for some reason.
        const target = '../Home/Login Admin and Client.html';
        try {
            location.href = encodeURI(target);
        } catch (e) {
            // Last-resort fallback
            location.href = 'login.html';
        }
    };

    // Utility: render HTML-escaped text
    function escapeHtml(str){
        if(!str && str !== 0) return '';
        return String(str).replace(/[&<>"']/g, function(ch){
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[ch];
        });
    }

    // Ensure renderTable is called on load
    document.addEventListener('DOMContentLoaded', function(){
        renderTable();
    });

    // Expose a helper to add a courier programmatically (used by the inline form handler)
    window.addCourier = function(c){
        window.couriers.unshift(c);
        window.nextId = window.nextId + 1;
        persist();
        renderTable();
    };

    // Persist on unload
    window.addEventListener('beforeunload', persist);

})();
// Add courier form handling
const addForm = document.getElementById('addCourierForm');
if(addForm){
    addForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const fd = new FormData(addForm);
        const newC = {
            id: 'CN-' + (nextId++),
            sender: fd.get('sender') || 'Unknown',
            senderAddress: fd.get('senderAddress') || '',
            receiver: fd.get('receiver') || 'Unknown',
            receiverAddress: fd.get('receiverAddress') || '',
            phone: fd.get('phone') || '',
            estimatedDelivery: fd.get('estimatedDelivery') || '',
            status: 'Pending',
            date: new Date().toISOString().slice(0,10)
        };
        couriers.unshift(newC);
        renderTable();
        addForm.reset();
        const modalEl = document.getElementById('addCourierModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
    });
}

    // Wire Update Status button on Admin Dashboard (navigates to Manage Couriers page)
    document.addEventListener('DOMContentLoaded', function(){
        const upd = document.getElementById('updateStatusBtn');
        if(upd){
            upd.addEventListener('click', function(){
                // Navigate to the Manage Couriers page where status can be updated
                try{ location.href = 'CourierTracking .html'; } catch(e){ console.warn('Navigation failed', e); }
            });
        }
    });

