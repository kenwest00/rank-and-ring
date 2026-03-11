document.addEventListener('DOMContentLoaded', () => {
    // ROI Calculator DOM Elements
    const ticketSlider = document.getElementById('avgTicket');
    const callsSlider = document.getElementById('missedCalls');
    const closeSlider = document.getElementById('closeRate');

    const ticketDisplay = document.getElementById('ticketVal');
    const callsDisplay = document.getElementById('callsVal');
    const closeDisplay = document.getElementById('closeVal');

    const lossDisplay = document.getElementById('monthlyLoss');

    // Number formatter for currency
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    // Calculate Loss
    function updateCalculator() {
        const ticket = parseInt(ticketSlider.value, 10);
        const calls = parseInt(callsSlider.value, 10);
        const close = parseInt(closeSlider.value, 10) / 100;

        // Update display values
        ticketDisplay.textContent = formatter.format(ticket);
        callsDisplay.textContent = calls;
        closeDisplay.textContent = `${(close * 100).toFixed(0)}%`;

        // Calculate Monthly Loss (Assuming 4 weeks in a month)
        const weeklyLoss = (calls * close) * ticket;
        const monthlyLoss = weeklyLoss * 4;

        // Animate the update
        lossDisplay.style.transform = 'scale(1.1)';
        lossDisplay.style.color = '#fff';

        setTimeout(() => {
            lossDisplay.textContent = formatter.format(monthlyLoss);
            lossDisplay.style.transform = 'scale(1)';
            lossDisplay.style.color = 'var(--color-accent)';
        }, 150);
    }

    // Attach Event Listeners (both 'input' for smooth sliding and 'change' for final value)
    if (ticketSlider && callsSlider && closeSlider) {
        [ticketSlider, callsSlider, closeSlider].forEach(slider => {
            slider.addEventListener('input', updateCalculator);
        });

        // Initial Calculation
        updateCalculator();
    }
});
