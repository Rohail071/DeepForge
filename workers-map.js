// Initialize map around Islamabad
        const map = L.map('map').setView(
            [33.6844, 73.0479],
            13
        );

        // Load OpenStreetMap tiles
        L.tileLayer(
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 19,

                referrerPolicy: 'strict-origin-when-cross-origin',

                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(map);

        // Sample workers
        const workers = [
            {
                name: 'Kamran Ahmed',
                profession: 'Electrician',
                lat: 33.6995,
                lng: 73.0363
            },
            {
                name: 'Babar Imran',
                profession: 'Carpenter',
                lat: 33.6844,
                lng: 73.0479
            },
            {
                name: 'Iftikhar Ali',
                profession: 'Plumber',
                lat: 33.6938,
                lng: 73.0652
            },
            {
                name: 'Saad Malik',
                profession: 'Painter',
                lat: 33.7100,
                lng: 73.0500
            }
        ];

        function calculateDistance(lat1, lon1, lat2, lon2) {

            const R = 6371; // Earth's radius in km

            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;

            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) *
                Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        }
        const workerMarkers = [];

        workers.forEach(worker => {

            const marker = L.marker([worker.lat, worker.lng])
                .addTo(map)
                .bindPopup(`
            <b>${worker.name}</b><br>
            ${worker.profession}<br>
            <span style="color:green">Available</span>
        `);

            workerMarkers.push(marker);
        });
        // Get customer's current location

        document.getElementById('myLocationBtn').addEventListener('click', function () {

            if (!navigator.geolocation) {
                alert("Geolocation is not supported.");
                return;
            }

            alert("Getting your location...");

            navigator.geolocation.getCurrentPosition(

                function (position) {

                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    // Calculate distance from customer to every worker

                    // Calculate distances for all workers
                    const workersWithDistances = workers.map((worker, index) => {

                        const distance = calculateDistance(
                            userLat,
                            userLng,
                            worker.lat,
                            worker.lng
                        );

                        // Update marker popup
                        workerMarkers[index].bindPopup(`
        <b>${worker.name}</b><br>
        ${worker.profession}<br>
        <span style="color:green">Available</span><br>
        <b>${distance.toFixed(2)} km away</b>
    `);

                        return {
                            ...worker,
                            distance: distance,
                            originalIndex: index
                        };

                    });

                    // Sort workers from nearest to farthest
                    workersWithDistances.sort((a, b) => a.distance - b.distance);

                    // Display workers in the list
                    const workerList = document.getElementById('workerList');

                    workerList.innerHTML = workersWithDistances.map(worker => `
    <div class="worker-item" data-index="${worker.originalIndex}">
        <h3>${worker.name}</h3>
        <p>${worker.profession} · Available</p>
        <span class="worker-distance">
            ${worker.distance.toFixed(2)} km away
        </span>
    </div>
`).join('');

                    // Make list items clickable
                    document.querySelectorAll('.worker-item').forEach(item => {

                        item.addEventListener('click', function () {

                            const index = Number(this.dataset.index);
                            const worker = workers[index];

                            map.setView([worker.lat, worker.lng], 16);
                            workerMarkers[index].openPopup();

                        });

                    });


                    // Add customer's marker
                    L.marker([userLat, userLng])
                        .addTo(map)
                        .bindPopup("<b>You are here!</b>")
                        .openPopup();

                    // Show customer and workers together
                    const allPoints = [
                        [userLat, userLng],
                        ...workers.map(worker => [worker.lat, worker.lng])
                    ];

                    map.fitBounds(allPoints, { padding: [40, 40] });

                    alert("Location found! Worker distances calculated.");

                },

                function (error) {
                    alert("Location error: " + error.message);
                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000
                }

            );

        });
