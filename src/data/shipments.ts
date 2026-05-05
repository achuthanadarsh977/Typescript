export interface ShipmentEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

export interface Shipment {
  trackingNumber: string;
  carrier: string;
  service: string;
  status: "In Transit" | "Delivered" | "Out for Delivery" | "Customs Hold" | "Delayed" | "Processing" | "Returned";
  origin: string;
  destination: string;
  shipper: string;
  recipient: string;
  weight: string;
  estimatedDelivery: string;
  lastLocation: string;
  lastUpdate: string;
  events: ShipmentEvent[];
}

export const shipments: Shipment[] = [
  {
    trackingNumber: "TRK123456789IN",
    carrier: "Blue Dart",
    service: "Express",
    status: "In Transit",
    origin: "Mumbai, Maharashtra",
    destination: "Bengaluru, Karnataka",
    shipper: "TechMart Pvt Ltd",
    recipient: "Rahul Sharma",
    weight: "2.5 kg",
    estimatedDelivery: "2026-04-20",
    lastLocation: "Pune Hub, Maharashtra",
    lastUpdate: "2026-04-18 09:30 AM",
    events: [
      { date: "2026-04-18 09:30 AM", location: "Pune Hub", status: "In Transit", description: "Package in transit to destination city" },
      { date: "2026-04-17 11:00 PM", location: "Mumbai Warehouse", status: "Departed", description: "Package departed from origin facility" },
      { date: "2026-04-17 06:00 PM", location: "Mumbai, Maharashtra", status: "Processing", description: "Package picked up and processing started" },
    ]
  },
  {
    trackingNumber: "TRK987654321IN",
    carrier: "Delhivery",
    service: "Standard",
    status: "Delivered",
    origin: "Delhi, NCR",
    destination: "Chennai, Tamil Nadu",
    shipper: "Amazon India",
    recipient: "Priya Nair",
    weight: "1.2 kg",
    estimatedDelivery: "2026-04-17",
    lastLocation: "Chennai, Tamil Nadu",
    lastUpdate: "2026-04-17 02:15 PM",
    events: [
      { date: "2026-04-17 02:15 PM", location: "Chennai", status: "Delivered", description: "Package delivered successfully. Signed by recipient." },
      { date: "2026-04-17 08:00 AM", location: "Chennai Hub", status: "Out for Delivery", description: "Package out for delivery with courier" },
      { date: "2026-04-16 10:00 PM", location: "Chennai Facility", status: "Arrived", description: "Package arrived at destination facility" },
      { date: "2026-04-15 03:00 PM", location: "Delhi Hub", status: "Dispatched", description: "Package dispatched from origin" },
    ]
  },
  {
    trackingNumber: "TRK456789123IN",
    carrier: "FedEx India",
    service: "International Priority",
    status: "Customs Hold",
    origin: "Hyderabad, Telangana",
    destination: "New York, USA",
    shipper: "Infosys Ltd",
    recipient: "John Carter",
    weight: "5.0 kg",
    estimatedDelivery: "2026-04-22",
    lastLocation: "Mumbai International Airport",
    lastUpdate: "2026-04-18 06:45 AM",
    events: [
      { date: "2026-04-18 06:45 AM", location: "Mumbai Airport Customs", status: "Customs Hold", description: "Package held at customs for document verification. Please submit invoice." },
      { date: "2026-04-17 11:30 PM", location: "Mumbai International Airport", status: "Arrived", description: "Package arrived at international gateway" },
      { date: "2026-04-17 04:00 PM", location: "Hyderabad Hub", status: "Dispatched", description: "Package dispatched for international shipment" },
    ]
  },
  {
    trackingNumber: "TRK741852963IN",
    carrier: "Shadowfax",
    service: "Same Day",
    status: "Out for Delivery",
    origin: "Bengaluru Warehouse",
    destination: "Koramangala, Bengaluru",
    shipper: "Swiggy Instamart",
    recipient: "Ananya Krishnan",
    weight: "0.8 kg",
    estimatedDelivery: "2026-04-18",
    lastLocation: "HSR Layout, Bengaluru",
    lastUpdate: "2026-04-18 11:00 AM",
    events: [
      { date: "2026-04-18 11:00 AM", location: "HSR Layout", status: "Out for Delivery", description: "Delivery executive Ravi is on the way. ETA 30 minutes." },
      { date: "2026-04-18 09:15 AM", location: "Bengaluru Warehouse", status: "Processing", description: "Order packed and assigned to delivery executive" },
    ]
  },
  {
    trackingNumber: "TRK369258147IN",
    carrier: "Ecom Express",
    service: "Standard",
    status: "Delayed",
    origin: "Kolkata, West Bengal",
    destination: "Ahmedabad, Gujarat",
    shipper: "Flipkart",
    recipient: "Vikram Patel",
    weight: "3.2 kg",
    estimatedDelivery: "2026-04-21",
    lastLocation: "Nagpur Transit Hub",
    lastUpdate: "2026-04-18 07:00 AM",
    events: [
      { date: "2026-04-18 07:00 AM", location: "Nagpur Transit Hub", status: "Delayed", description: "Package delayed due to vehicle breakdown. Rescheduled for next dispatch." },
      { date: "2026-04-17 02:00 PM", location: "Nagpur Hub", status: "Arrived", description: "Package arrived at transit hub" },
      { date: "2026-04-16 08:00 AM", location: "Kolkata Facility", status: "Dispatched", description: "Package dispatched from origin facility" },
    ]
  },
  {
    trackingNumber: "TRK159357486IN",
    carrier: "DHL India",
    service: "Express Worldwide",
    status: "Processing",
    origin: "Pune, Maharashtra",
    destination: "London, UK",
    shipper: "Wipro Technologies",
    recipient: "Sarah Johnson",
    weight: "4.5 kg",
    estimatedDelivery: "2026-04-23",
    lastLocation: "Pune Facility",
    lastUpdate: "2026-04-18 10:00 AM",
    events: [
      { date: "2026-04-18 10:00 AM", location: "Pune Facility", status: "Processing", description: "Package received and processing for international shipment" },
    ]
  },
  {
    trackingNumber: "TRK852741963IN",
    carrier: "DTDC",
    service: "Economy",
    status: "Returned",
    origin: "Jaipur, Rajasthan",
    destination: "Lucknow, Uttar Pradesh",
    shipper: "Meesho",
    recipient: "Sunita Verma",
    weight: "1.0 kg",
    estimatedDelivery: "2026-04-15",
    lastLocation: "Jaipur Hub",
    lastUpdate: "2026-04-18 08:30 AM",
    events: [
      { date: "2026-04-18 08:30 AM", location: "Jaipur Hub", status: "Returned", description: "Package returned to origin. Delivery attempted 3 times. Recipient not available." },
      { date: "2026-04-16 10:00 AM", location: "Lucknow", status: "Delivery Failed", description: "3rd delivery attempt failed. Recipient not available." },
      { date: "2026-04-15 11:00 AM", location: "Lucknow", status: "Delivery Failed", description: "2nd delivery attempt failed." },
      { date: "2026-04-14 09:00 AM", location: "Lucknow", status: "Delivery Failed", description: "1st delivery attempt failed. Door locked." },
    ]
  },
  {
    trackingNumber: "TRK963147258IN",
    carrier: "Blue Dart",
    service: "Ground Express",
    status: "In Transit",
    origin: "Surat, Gujarat",
    destination: "Bhubaneswar, Odisha",
    shipper: "Textile World",
    recipient: "Deepak Mohanty",
    weight: "6.0 kg",
    estimatedDelivery: "2026-04-21",
    lastLocation: "Nagpur Hub",
    lastUpdate: "2026-04-18 12:00 PM",
    events: [
      { date: "2026-04-18 12:00 PM", location: "Nagpur Hub", status: "In Transit", description: "Package in transit, heading to eastern region hub" },
      { date: "2026-04-17 05:00 PM", location: "Surat Facility", status: "Dispatched", description: "Package dispatched" },
    ]
  }
];

// Convert shipments to searchable text documents for RAG
export function shipmentsToDocuments(): Array<{ id: string; text: string; shipment: Shipment }> {
  return shipments.map(s => ({
    id: s.trackingNumber,
    text: `
      Tracking Number: ${s.trackingNumber}
      Carrier: ${s.carrier} (${s.service})
      Status: ${s.status}
      Origin: ${s.origin}
      Destination: ${s.destination}
      Shipper: ${s.shipper}
      Recipient: ${s.recipient}
      Weight: ${s.weight}
      Estimated Delivery: ${s.estimatedDelivery}
      Last Known Location: ${s.lastLocation}
      Last Update: ${s.lastUpdate}
      Recent Events: ${s.events.slice(0, 3).map(e => `${e.date} - ${e.status} at ${e.location}: ${e.description}`).join(" | ")}
    `.trim(),
    shipment: s
  }));
}
