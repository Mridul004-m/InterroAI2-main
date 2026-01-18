// ================= Profile Dropdown =================
document.getElementById('profileBtn')?.addEventListener('click', function () {
    const menu = document.getElementById('dropdownMenu');
    if (!menu) return;

    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    menu.style.flexDirection = 'column';
});

// Handle logout click
document.querySelector('#dropdownMenu a')?.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = "main.php?logout=true";
});

// ================= Hover + Click for Role Tags =================
document.addEventListener('DOMContentLoaded', function () {
    const roleTags = document.querySelectorAll('.role-tag');

    roleTags.forEach(tag => {

        // Hover effect
        tag.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 5px 15px rgba(79, 70, 229, 0.2)';
        });

        tag.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });

        // CLICK → generate quiz
        tag.addEventListener('click', function () {
            const topic = this.innerText.trim();

            // Save topic for quiz page
            localStorage.setItem('interroai_topic', topic);

            // ✅ CORRECT PATH
            window.location.href = '/quizpage/quiz.html';
        });
    });
});

// ================= Custom Quiz Button =================
function goToQuiz() {
    localStorage.removeItem('interroai_topic'); // custom mode
    window.location.href = '/quizpage/quiz.html';
}

// ================= Safe back/forward reload =================
(function () {
    try {
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.href);
        }

        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                window.location.reload();
            }
        });
    } catch (e) {
        console.error("Back button reload error:", e);
    }
})();
