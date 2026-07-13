# User Stories: Uptime Monitor

This document outlines the user personas and agile user stories representing the core interactions and business value for the **Uptime Monitor** application.

---

## 1. User Personas

### Persona: Alex (Network Administrator)
- **Role**: IT Infrastructure Manager.
- **Tech Savviness**: High. Comfortable with terminal commands, networking concepts, and dashboards.
- **Needs**: Alex needs to ensure all local servers, databases, routers, and switches are operational. He needs a reliable, visual utility to check latency, identify outages, and spot performance degradation before it causes user complaints.
- **Pain Points**: Manual pinging is tedious. Existing commercial monitoring software is heavy, expensive, and difficult to set up for simple local network environments.

---

## 2. User Stories

### US-1: Device Inventory CRUD
**As a** Network Administrator,  
**I want to** add, view, update, and remove devices from the monitoring inventory,  
**So that** I can customize which infrastructure elements are monitored by the application.

#### Acceptance Criteria

**Scenario 1: Successfully adding a new device for ICMP monitoring**
* **Given** I am on the "Device Management" view,
* **When** I fill in the form with Name: `"Core Switch"`, Host: `"192.168.1.1"`, Protocol: `"ICMP"`, and toggle "Is Active" to active, and click "Save",
* **Then** the device is saved to the database, the page lists the new device, and the background engine begins scheduling checks for it.

**Scenario 2: Successfully adding a new device for TCP monitoring**
* **Given** I am on the "Device Management" view,
* **When** I select Protocol: `"TCP"`,
* **Then** the "Port" input field is displayed and marked as required.
* **When** I enter Port: `5432` and Host: `"192.168.1.10"`, then click "Save",
* **Then** the device is successfully added to the monitoring roster.

**Scenario 3: Validation failures when configuration is invalid**
* **Given** I am adding or editing a device,
* **When** I enter an invalid host format (e.g., `"not-an-ip-or-dns!"`) or an out-of-range port number (e.g., `999999`),
* **Then** the system displays a clear validation error message and prevents submission.

**Scenario 4: Deleting a device and cascading data clean-up**
* **Given** I am looking at the device list,
* **When** I click the "Delete" button for a specific device and confirm the prompt,
* **Then** the device is removed from the view, and all historical ping logs and incidents associated with that device are purged from the database.

---

### US-2: Real-Time Live Status Dashboard
**As a** Network Administrator,  
**I want to** view a consolidated dashboard displaying live statuses of all active devices,  
**So that** I can see at a glance if any servers or network routers are currently down.

#### Acceptance Criteria

**Scenario 1: Viewing aggregate summary statistics**
* **Given** I open the dashboard page,
* **Then** I see high-level statistic cards displaying:
  * Total configured devices.
  * Number of active monitors.
  * Total number of devices currently `UP`.
  * Total number of devices currently `DOWN`.

**Scenario 2: Device listing and status badge visibility**
* **Given** there are multiple active and inactive devices in the system,
* **When** I view the dashboard list,
* **Then** each device exhibits:
  * A clear visual color indicator (Green for `UP`, Red for `DOWN`, Grey for `INACTIVE`).
  * The device name and host IP/address.
  * The protocol used (ICMP or TCP).
  * The latency from the last execution (in ms, e.g., `4ms`).
  * The timestamp of the last successful check.

---

### US-3: Global Interval Adjustment
**As a** Network Administrator,  
**I want to** adjust the monitoring cycle interval globally from the user interface,  
**So that** I can reduce network traffic when testing local networks or increase frequency when troubleshooting.

#### Acceptance Criteria

**Scenario 1: Modifying the check interval**
* **Given** I am on the "Settings" page,
* **When** I select `"30 seconds"` from the Global Monitoring Interval dropdown and click "Apply Settings",
* **Then** the configuration is saved to the database.
* **And** the background scheduler immediately reschedules the check loop to execute every 30 seconds without requiring a backend reload.

---

### US-4: Latency & Performance History
**As a** Network Administrator,  
**I want to** select an individual device and see its latency trends over time,  
**So that** I can identify patterns of congestion, slow response times, or intermittent connection problems.

#### Acceptance Criteria

**Scenario 1: Viewing device-specific details and history**
* **Given** I click on a device in the list to open its details,
* **Then** the application displays a detailed view including:
  * Average latency computed over the last 24 hours.
  * Calculated Uptime percentage (e.g., `99.98%`).
  * A line graph showing latency measurements (Y-axis) plotted against timestamps (X-axis).
  * Outage history lists showing specific downtime events.

---

### US-5: Incident Logs & Event History
**As a** Network Administrator,  
**I want to** view a chronological log of status transitions and incidents,  
**So that** I can investigate when outages started and how long they lasted.

#### Acceptance Criteria

**Scenario 1: Automating incident creation on device failure**
* **Given** a device with status `UP` fails its latest connectivity check,
* **When** the monitoring engine confirms the failure,
* **Then** the device status changes to `DOWN`.
* **And** a new record is created in the `Incidents` table with the start timestamp.

**Scenario 2: Resolving an ongoing incident**
* **Given** an ongoing incident where device state is `DOWN` and `resolved_at` is null,
* **When** the background monitor runs a test and receives a successful connection or response,
* **Then** the device status changes back to `UP`.
* **And** the corresponding incident record is updated with the resolution timestamp, and the duration is calculated.

**Scenario 3: Inspecting incident history UI**
* **Given** I am on the "Event Logs" view,
* **Then** I see a list of outages sorted chronologically (latest first), indicating:
  * Device Name.
  * Outage Start Time.
  * Recovery Time (or "Ongoing" if still DOWN).
  * Calculated Duration (e.g., `"14 minutes 23 seconds"`).
