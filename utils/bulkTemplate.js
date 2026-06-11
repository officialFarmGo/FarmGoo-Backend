exports.newDeliveryRequestTemplate = (trackingId, pickup, destination, fare) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Delivery Request Available</h2>
            <p>A new delivery request has been created. Here are the details:</p>
            <ul>
                <li><strong>Tracking ID:</strong> ${trackingId}</li>
                <li><strong>Pickup:</strong> ${pickup}</li>
                <li><strong>Destination:</strong> ${destination}</li>
                <li><strong>Fare:</strong> ₦${fare.toFixed(2)}</li>
            </ul>
            <p>Log in to the FarmGoo app to accept this delivery.</p>
        </div>
    `
}