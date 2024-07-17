document.addEventListener("DOMContentLoaded", () => {
    const totalSavingsEl = document.getElementById("total-savings");
    const todaySavingsEl = document.getElementById("today-savings"); // New element
    const amountInput = document.getElementById("amount");
    const transactionTypeSelect = document.getElementById("transaction-type");
    const submitBtn = document.getElementById("submit-btn");
    const calendarEl = document.getElementById("calendar");
    const calendarMonthEl = document.getElementById("calendar-month");
    const savingsTableBody = document.querySelector("#savings-table tbody");
    const clearAllBtn = document.getElementById("clear-all-btn");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const confirmClearAllBtn = document.getElementById("confirm-clear-all-btn");

    let totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0.0;
    let todaySavings = parseFloat(localStorage.getItem("todaySavings")) || 0.0; // New variable
    const lastSavedDate = localStorage.getItem("lastSavedDate") || new Date().toLocaleDateString();
    let savingsHistory = JSON.parse(localStorage.getItem("savingsHistory")) || [];
    let selectedTransactionIndex = null;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function updateTotalSavings() {
        totalSavingsEl.textContent = totalSavings.toFixed(2);
        localStorage.setItem("totalSavings", totalSavings.toFixed(2));
    }

    function updateTodaySavings() {
        todaySavingsEl.textContent = todaySavings.toFixed(2);
        localStorage.setItem("todaySavings", todaySavings.toFixed(2));
    }

    function resetTodaySavingsIfNewDay() {
        const today = new Date().toLocaleDateString();
        if (lastSavedDate !== today) {
            todaySavings = 0.0;
            localStorage.setItem("lastSavedDate", today);
            updateTodaySavings();
        }
    }

    function updateCalendar() {
        calendarEl.innerHTML = "";
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        calendarMonthEl.textContent = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement("div");
            dayEl.classList.add("calendar-day");
            dayEl.textContent = i;

            const currentDate = new Date(today.getFullYear(), today.getMonth(), i);
            const transactionsForTheDay = savingsHistory.filter(transaction =>
                new Date(transaction.date).toLocaleDateString() === currentDate.toLocaleDateString()
            );

            if (transactionsForTheDay.length > 0) {
                const netAmount = transactionsForTheDay.reduce((acc, transaction) => acc + transaction.amount, 0);
                if (netAmount > 0) {
                    dayEl.classList.add("green");
                } else if (netAmount < 0) {
                    dayEl.classList.add("red");
                } else {
                    dayEl.classList.add("yellow");
                }
            }

            if (currentDate.toLocaleDateString() === today.toLocaleDateString()) {
                dayEl.classList.add("today");
            }

            calendarEl.appendChild(dayEl);
        }
    }

    function addTransaction(amount, date = new Date()) {
        savingsHistory.push({ amount, date });
        localStorage.setItem("savingsHistory", JSON.stringify(savingsHistory));
        updateSavingsTable();
        totalSavings += amount;
        todaySavings += amount; // Update today's savings
        updateTotalSavings();
        updateTodaySavings(); // Update display and local storage
        updateCalendar();
    }

    function withdrawTransaction(amount, date = new Date()) {
        savingsHistory.push({ amount: -amount, date });
        localStorage.setItem("savingsHistory", JSON.stringify(savingsHistory));
        updateSavingsTable();
        totalSavings -= amount;
        todaySavings -= amount; // Update today's savings
        updateTotalSavings();
        updateTodaySavings(); // Update display and local storage
        updateCalendar();
    }

    function updateSavingsTable() {
        savingsTableBody.innerHTML = "";
        savingsHistory.forEach((transaction, index) => {
            const tr = document.createElement("tr");
            const dateTd = document.createElement("td");
            const amountTd = document.createElement("td");
            const actionsTd = document.createElement("td");
            const deleteBtn = document.createElement("button");

            dateTd.textContent = new Date(transaction.date).toLocaleDateString();
            amountTd.textContent = transaction.amount.toFixed(2);
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("btn", "btn-danger", "btn-sm");
            deleteBtn.addEventListener("click", () => {
                selectedTransactionIndex = index;
                $('#deleteConfirmModal').modal('show');
            });

            actionsTd.appendChild(deleteBtn);
            tr.appendChild(dateTd);
            tr.appendChild(amountTd);
            tr.appendChild(actionsTd);
            savingsTableBody.appendChild(tr);
        });
    }

    function clearAllData() {
        totalSavings = 0.0;
        todaySavings = 0.0; // Reset today's savings
        savingsHistory = [];
        localStorage.setItem("totalSavings", "0.00");
        localStorage.setItem("todaySavings", "0.00"); // Reset local storage
        localStorage.setItem("savingsHistory", JSON.stringify([]));
        localStorage.setItem("lastSavedDate", new Date().toLocaleDateString());
        updateTotalSavings();
        updateTodaySavings(); // Update display and local storage
        updateSavingsTable();
        updateCalendar();
    }

    // Event listeners
    submitBtn.addEventListener("click", () => {
        const amount = parseFloat(amountInput.value);
        const transactionType = transactionTypeSelect.value;

        if (!isNaN(amount) && amount > 0) {
            if (transactionType === "save") {
                addTransaction(amount);
            } else if (transactionType === "withdraw") {
                withdrawTransaction(amount);
            }
            amountInput.value = "";
        }
    });

    clearAllBtn.addEventListener("click", () => {
        $('#clearAllConfirmModal').modal('show');
    });

    confirmDeleteBtn.addEventListener("click", () => {
        if (selectedTransactionIndex !== null) {
            const transaction = savingsHistory[selectedTransactionIndex];
            totalSavings -= transaction.amount;
            todaySavings -= transaction.amount; // Update today's savings
            savingsHistory.splice(selectedTransactionIndex, 1);
            updateSavingsTable();
            updateTotalSavings();
            updateTodaySavings(); // Update display and local storage
            updateCalendar();
            $('#deleteConfirmModal').modal('hide');
        }
    });

    confirmClearAllBtn.addEventListener("click", () => {
        clearAllData();
        $('#clearAllConfirmModal').modal('hide');
    });

    // Initial setup
    resetTodaySavingsIfNewDay(); // Check if the day has changed
    updateTotalSavings();
    updateTodaySavings(); // Initialize today's savings display
    updateSavingsTable();
    updateCalendar();
});

document.addEventListener("contextmenu", function(event){
    alert("inspect is not allowed");
    event.preventDefault();
});
