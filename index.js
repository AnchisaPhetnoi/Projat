 <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        const temperatureDisplay = document.getElementById('temperature-display');
        const pumpToggle = document.getElementById('pump-toggle');
        const temperatureChart = document.getElementById('temperatureChart').getContext('2d');
        const dataHistory = document.getElementById('data-history');
        const pumpActivityLog = document.getElementById('pump-activity-log');
        const alertBox = document.getElementById('alert');

        let pumpStatus = false;
        let temperatureData = [];
        let timeLabels = [];
        let pumpActivityData = [];

        // Dummy data function (replace this with actual MQTT or API call)
        function fetchTemperature() {
            return (Math.random() * (35 - 15) + 15).toFixed(2);  // Random temperature for demo
        }

        // Update Temperature Display and Chart
        function updateTemperature() {
            const temperature = fetchTemperature();
            const timestamp = new Date().toLocaleString(); // แสดงวันที่และเวลา

            temperatureDisplay.textContent = `${temperature} °C`;

            // Check for temperature issues
            checkForIssues(temperature);

            // Update chart and table
            temperatureData.push(temperature);
            timeLabels.push(timestamp);
            if (temperatureData.length > 10) {
                temperatureData.shift();
                timeLabels.shift();
            }

            updateChart();
            updateHistoryTable(timestamp, temperature);
        }

        // Check for issues with the pump
        function checkForIssues(temperature) {
            if (temperature < 20 || temperature > 30) {
                alertBox.style.display = 'block'; // แสดงการแจ้งเตือน
            } else {
                alertBox.style.display = 'none'; // ซ่อนการแจ้งเตือน
            }
        }

        // Update Chart
        function updateChart() {
            chart.data.labels = timeLabels;
            chart.data.datasets[0].data = temperatureData;
            chart.update();
        }

        // Update Data History Table
        function updateHistoryTable(timestamp, temperature) {
            const newRow = `<tr><td>${timestamp}</td><td>${temperature} °C</td></tr>`;
            dataHistory.insertAdjacentHTML('afterbegin', newRow);
        }

        // Update Pump Activity Log
        function updatePumpActivityLog() {
            const timestamp = new Date().toLocaleString();
            const statusText = pumpStatus ? 'Pump is ON' : 'Pump is OFF';
            const newRow = `<tr><td>${timestamp}</td><td>${statusText}</td></tr>`;
            pumpActivityLog.insertAdjacentHTML('afterbegin', newRow);
        }

        // Toggle Pump On/Off
        pumpToggle.addEventListener('click', function() {
            pumpStatus = !pumpStatus;
            pumpToggle.textContent = pumpStatus ? 'Pump is ON' : 'Pump is OFF';
            pumpToggle.classList.toggle('on', pumpStatus);
            pumpToggle.classList.toggle('off', !pumpStatus);

            // Update pump activity log
            updatePumpActivityLog();

            // Here, you can send the pump control signal to the backend
            console.log('Pump Status:', pumpStatus ? 'ON' : 'OFF');
        });

        // Chart.js Setup
        const chart = new Chart(temperatureChart, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperatureData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        // Fetch and update temperature data every 5 seconds
        setInterval(updateTemperature, 5000);
    </script>
</body>
</html>
