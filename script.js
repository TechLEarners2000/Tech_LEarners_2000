// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile navigation toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Email button handler (opens mail client with prefilled subject/body)
// Bind email elements to open the contact modal so user can enter details
const modal = document.getElementById('contact-modal');
const modalOverlay = modal ? modal.querySelector('.modal-overlay') : null;
const modalForm = document.getElementById('contact-modal-form');
const modalName = document.getElementById('modal-name');
const modalEmail = document.getElementById('modal-email');
const modalMessage = document.getElementById('modal-message');
const modalCancel = document.getElementById('modal-cancel');

function openModalWithTargetEmail(emailCodes) {
    if (!modal) return;
    modal.dataset.targetEmail = emailCodes;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    // small timeout to ensure element is focusable
    setTimeout(() => { if (modalName) modalName.focus(); }, 50);
}

function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    modal.dataset.targetEmail = '';
    if (modalForm) modalForm.reset();
    // return focus to previously focused element
    if (modal._trigger) {
        try { modal._trigger.focus(); } catch (e) {}
        modal._trigger = null;
    }
}

document.querySelectorAll('[data-email-codes]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        const codes = el.getAttribute('data-email-codes');
        // record the trigger so focus can be returned when modal closes
        if (modal) modal._trigger = el;
        openModalWithTargetEmail(codes);
    });
});

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
}

if (modalCancel) {
    modalCancel.addEventListener('click', closeModal);
}

if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = modalName.value.trim();
        const email = modalEmail.value.trim();
        const message = modalMessage.value.trim();
        const errorEl = document.getElementById('modal-error');
        errorEl.textContent = '';
        if (!name || !email || !message) {
            errorEl.textContent = 'Please fill in all fields.';
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorEl.textContent = 'Please enter a valid email address.';
            modalEmail.focus();
            return;
        }

        const targetCodes = modal.dataset.targetEmail;
        const to = decodeFromCodes(targetCodes);
        const subject = encodeURIComponent('Contact from ' + name + ' (' + email + ')');
        const bodyLines = [];
        bodyLines.push('Name: ' + name);
        bodyLines.push('Email: ' + email);
        bodyLines.push('');
        bodyLines.push('Message:');
        bodyLines.push(message);
        const body = encodeURIComponent(bodyLines.join('\n'));
        closeModal();
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
}

// Keyboard handling: close on Escape and trap focus inside modal
document.addEventListener('keydown', (e) => {
    if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') {
        closeModal();
        return;
    }
    if (e.key === 'Tab') {
        // basic focus trap
        const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                last.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        }
    }
});

// No phone bindings needed: contact is email-only now

// Helper: decode comma-separated char codes into string
function decodeFromCodes(csv) {
    if (!csv) return '';
    return csv.split(',').map(c => String.fromCharCode(parseInt(c, 10))).join('');
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections except hero
document.querySelectorAll('section:not(.hero)').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Typing effect for hero text (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Apply typing effect to hero title
const heroTitle = document.querySelector('.hero-content h1');
if (heroTitle) {
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';
    setTimeout(() => {
        typeWriter(heroTitle, originalText, 150);
    }, 500);
}
