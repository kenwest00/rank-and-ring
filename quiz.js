document.addEventListener('DOMContentLoaded', () => {
    const steps = window.document.querySelectorAll('.step');
    const progressBar = document.getElementById('progress');
    const cards = window.document.querySelectorAll('.option-card');
    const resultText = document.getElementById('dynamicResultText');
    const submitBtn = document.getElementById('submitBtn');

    let currentStep = 0;
    const totalSteps = steps.length;

    // Store user answers
    const answers = {
        trade: '',
        problem: '',
        size: ''
    };

    // Handle Option Clicks
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const stepId = card.closest('.step').id;
            const val = card.dataset.val;

            // Save answer based on current step
            if (stepId === 'step1') answers.trade = val;
            if (stepId === 'step2') answers.problem = val;
            if (stepId === 'step3') answers.size = val;

            // Visual feedback
            card.style.borderColor = 'var(--color-accent)';
            card.style.background = 'rgba(245, 158, 11, 0.1)';

            // Delay slightly for UX, then move to next step
            setTimeout(() => {
                nextStep();
            }, 300);
        });
    });

    function nextStep() {
        if (currentStep < totalSteps - 1) {
            // Hide current
            steps[currentStep].classList.remove('active');
            // Show next
            currentStep++;
            steps[currentStep].classList.add('active');

            // Update Progress
            const progressPct = ((currentStep + 1) / totalSteps) * 100;
            progressBar.style.width = `${progressPct}%`;

            // If we reached the final step, dynamically update the text
            if (currentStep === totalSteps - 1) {
                generateCustomResult();
            }
        }
    }

    function generateCustomResult() {
        let tradeName = "your service business";
        if (answers.trade === 'hv') tradeName = "your HVAC business";
        if (answers.trade === 'pl') tradeName = "your Plumbing business";
        if (answers.trade === 'el') tradeName = "your Electrical business";

        let problemResponse = "an AI Receptionist could capture a significant amount of your missed revenue.";

        if (answers.problem === 'time') {
            problemResponse = "a 24/7 Virtual Dispatcher is the exact system you need to stop losing jobs while your hands are full.";
        } else if (answers.problem === 'leads') {
            problemResponse = "our Local SEO Foundation package will push you above competitors on Google My Business.";
        } else if (answers.problem === 'org') {
            problemResponse = "our integrated Lead Management System will organize your jobs and cut out the texting back-and-forth.";
        }

        resultText.innerHTML = `Based on your answers, for <strong>${tradeName}</strong>, ${problemResponse} Let's do the exact math for your territory.`;
    }

    submitBtn.addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!name || !email || !phone) {
            alert("Please fill out all fields to get your blueprint.");
            return;
        }

        // Simulate form submission
        submitBtn.innerHTML = "Generating Blueprint...";
        submitBtn.style.opacity = '0.7';

        setTimeout(() => {
            // Note: In production this would hit an API e.g. /api/leads
            // For the prototype, we redirect to the Thank You page and pass the name to personalize it
            window.location.href = `thankyou.html?name=${encodeURIComponent(name)}`;
        }, 1500);
    });
});
