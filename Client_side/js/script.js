// Externalized JavaScript for Homepage.html
// Moved from inline <script> in Homepage.html

// Quick demo tracking functions (client-side demo)
function quickTrack(){
    const val = document.getElementById('quickTrackInput').value.trim();
    if(!val){ alert('Please enter a tracking number.'); return; }
    showTrackingResult(val);
    // scroll to tracking section for visibility
    document.getElementById('tracking').scrollIntoView({ behavior: 'smooth' });
}

function advancedTrack(){
    const val = document.getElementById('advancedTrackInput').value.trim();
    if(!val){ alert('Please enter a tracking number.'); return; }
    showTrackingResult(val);
}

function showTrackingResult(id){
    const results = document.getElementById('trackingResults');
    const trackingId = document.getElementById('trackingId');
    trackingId.textContent = id;
    results.style.display = 'block';
}

// Contact form handling: client validation + mailto fallback
document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('contactForm');
    if(form){
        form.addEventListener('submit', function(e){
            e.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            if(!name || !email || !message){
                alert('Please fill in all fields.');
                return;
            }
            // Build mailto as a fallback (opens user's mail client)
            const to = 'your-email@example.com'; // <-- replace with your real address
            const subject = encodeURIComponent('Website contact from ' + name);
            const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
            const mailto = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
            // show success message and open mail client
            const successBox = document.getElementById('contactSuccess');
            if(successBox) successBox.style.display = 'block';
            window.location.href = mailto;
        });
    }

    // Collapse bootstrap navbar on nav-link click (mobile friendly)
    const navbarCollapse = document.getElementById('navbarNav');
    document.querySelectorAll('.nav-link').forEach(function(link){
        link.addEventListener('click', function(){
            if(navbarCollapse && navbarCollapse.classList.contains('show')){
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
});
