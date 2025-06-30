import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import Database from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database.Database(path.join(__dirname, 'cmd_telehealth.db'));

// Initialize database tables
db.serialize(() => {
  // Create services table (master data)
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      average_price REAL NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create clinics table
  db.run(`
    CREATE TABLE IF NOT EXISTS clinics (
      id TEXT PRIMARY KEY,
      clinic_name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      date_created DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create clinic_services table (junction table)
  db.run(`
    CREATE TABLE IF NOT EXISTS clinic_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clinic_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      price REAL NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (clinic_id) REFERENCES clinics (id),
      FOREIGN KEY (service_id) REFERENCES services (id),
      UNIQUE(clinic_id, service_id)
    )
  `);

  // Create system_logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      priority TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      project TEXT NOT NULL,
      class_name TEXT NOT NULL,
      method TEXT NOT NULL
    )
  `);

  // Insert master services data
  const masterServices = [
    ['SRV001', 'General Consultation', 'CONSULT', 'General medical consultation with certified doctors', 150, 1],
    ['SRV002', 'X-Ray Imaging', 'XRAY', 'Digital X-ray imaging and diagnostic services', 200, 1],
    ['SRV003', 'Blood Test', 'BLOOD', 'Comprehensive blood testing and laboratory analysis', 100, 1],
    ['SRV004', 'COVID-19 Test', 'COVID', 'RT-PCR and rapid antigen testing for COVID-19', 75, 1],
    ['SRV005', 'MRI Scan', 'MRI', 'Magnetic Resonance Imaging for detailed diagnostics', 800, 1]
  ];

  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (id, name, code, description, average_price, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  masterServices.forEach(service => {
    insertService.run(service);
  });

  insertService.finalize();

  // Insert sample clinics
  const sampleClinics = [
    ['CL202200001', 'HealthFirst Medical Center', 'HealthFirst LLC', '123 Medical Plaza Drive', 'Los Angeles', 'California', 'United States', '90210', 34.0522, -118.2437],
    ['CL202200002', 'Metropolitan Diagnostic Center', 'Metro Health Solutions Inc.', '456 Healthcare Boulevard', 'New York', 'New York', 'United States', '10001', 40.7128, -74.0060],
    ['CL202200003', 'Community Care Clinic', 'Community Health Partners', '789 Wellness Street', 'Chicago', 'Illinois', 'United States', '60601', 41.8781, -87.6298]
  ];

  const insertClinic = db.prepare(`
    INSERT OR IGNORE INTO clinics (id, clinic_name, business_name, street_address, city, state, country, zip_code, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleClinics.forEach(clinic => {
    insertClinic.run(clinic);
  });

  insertClinic.finalize();

  // Insert sample clinic services
  const sampleClinicServices = [
    ['CL202200001', 'SRV001', 150, 1],
    ['CL202200001', 'SRV003', 100, 1],
    ['CL202200002', 'SRV002', 200, 1],
    ['CL202200002', 'SRV005', 800, 1],
    ['CL202200003', 'SRV001', 120, 1],
    ['CL202200003', 'SRV004', 75, 1]
  ];

  const insertClinicService = db.prepare(`
    INSERT OR IGNORE INTO clinic_services (clinic_id, service_id, price, is_active)
    VALUES (?, ?, ?, ?)
  `);

  sampleClinicServices.forEach(cs => {
    insertClinicService.run(cs);
  });

  insertClinicService.finalize();
});

// Utility function to log system events
const logEvent = (message, priority = 'Low', type = 'Info', className = 'Server', method = 'Unknown') => {
  const logId = uuidv4();
  db.run(`
    INSERT INTO system_logs (id, message, priority, type, project, class_name, method)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [logId, message, priority, type, 'CMD-Telehealth', className, method]);
  
  console.log(`[${type}] ${className}.${method}: ${message}`);
};

// Generate unique clinic ID
const generateClinicId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `CL${year}${random}`;
};

// API Routes

// Get all services (master data)
app.get('/api/services', (req, res) => {
  logEvent('Fetching all services', 'Low', 'Info', 'ServicesController', 'getAllServices');
  
  db.all('SELECT * FROM services WHERE is_active = 1', (err, rows) => {
    if (err) {
      logEvent(`Error fetching services: ${err.message}`, 'High', 'Error', 'ServicesController', 'getAllServices');
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
    
    const services = rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      averagePrice: row.average_price,
      isActive: Boolean(row.is_active)
    }));
    
    res.json(services);
  });
});

// Get all clinics with their services
app.get('/api/clinics', (req, res) => {
  logEvent('Fetching all clinics', 'Low', 'Info', 'ClinicsController', 'getAllClinics');
  
  const query = `
    SELECT 
      c.*,
      s.id as service_id,
      s.name as service_name,
      s.code as service_code,
      s.description as service_description,
      cs.price as service_price,
      cs.is_active as service_is_active
    FROM clinics c
    LEFT JOIN clinic_services cs ON c.id = cs.clinic_id
    LEFT JOIN services s ON cs.service_id = s.id
    ORDER BY c.date_created DESC, s.name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      logEvent(`Error fetching clinics: ${err.message}`, 'High', 'Error', 'ClinicsController', 'getAllClinics');
      return res.status(500).json({ error: 'Failed to fetch clinics' });
    }
    
    // Group services by clinic
    const clinicsMap = new Map();
    
    rows.forEach(row => {
      if (!clinicsMap.has(row.id)) {
        clinicsMap.set(row.id, {
          id: row.id,
          clinicName: row.clinic_name,
          businessName: row.business_name,
          streetAddress: row.street_address,
          city: row.city,
          state: row.state,
          country: row.country,
          zipCode: row.zip_code,
          latitude: row.latitude,
          longitude: row.longitude,
          dateCreated: row.date_created,
          services: []
        });
      }
      
      if (row.service_id) {
        clinicsMap.get(row.id).services.push({
          serviceId: row.service_id,
          serviceName: row.service_name,
          serviceCode: row.service_code,
          description: row.service_description,
          price: row.service_price,
          isActive: Boolean(row.service_is_active)
        });
      }
    });
    
    const clinics = Array.from(clinicsMap.values());
    res.json(clinics);
  });
});

// Create a new clinic
app.post('/api/clinics', (req, res) => {
  const {
    clinicName,
    businessName,
    streetAddress,
    city,
    state,
    country,
    zipCode,
    latitude,
    longitude,
    services
  } = req.body;
  
  logEvent(`Creating new clinic: ${clinicName}`, 'Medium', 'Info', 'ClinicsController', 'createClinic');
  
  // Validation
  if (!clinicName || !businessName || !streetAddress || !city || !state || !zipCode) {
    logEvent('Clinic creation failed: Missing required fields', 'Medium', 'Warning', 'ClinicsController', 'createClinic');
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!services || services.length === 0) {
    logEvent('Clinic creation failed: No services provided', 'Medium', 'Warning', 'ClinicsController', 'createClinic');
    return res.status(400).json({ error: 'At least one service must be provided' });
  }
  
  const clinicId = generateClinicId();
  
  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Insert clinic
    db.run(`
      INSERT INTO clinics (id, clinic_name, business_name, street_address, city, state, country, zip_code, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [clinicId, clinicName, businessName, streetAddress, city, state, country, zipCode, latitude || 0, longitude || 0], function(err) {
      if (err) {
        db.run('ROLLBACK');
        logEvent(`Error creating clinic: ${err.message}`, 'High', 'Error', 'ClinicsController', 'createClinic');
        return res.status(500).json({ error: 'Failed to create clinic' });
      }
      
      // Insert clinic services
      const insertService = db.prepare(`
        INSERT INTO clinic_services (clinic_id, service_id, price, is_active)
        VALUES (?, ?, ?, ?)
      `);
      
      let servicesInserted = 0;
      let hasError = false;
      
      services.forEach(service => {
        insertService.run([clinicId, service.serviceId, service.price, service.isActive ? 1 : 0], function(err) {
          if (err && !hasError) {
            hasError = true;
            db.run('ROLLBACK');
            logEvent(`Error adding clinic service: ${err.message}`, 'High', 'Error', 'ClinicsController', 'createClinic');
            return res.status(500).json({ error: 'Failed to add clinic services' });
          }
          
          servicesInserted++;
          
          if (servicesInserted === services.length && !hasError) {
            db.run('COMMIT');
            logEvent(`Clinic created successfully: ${clinicId}`, 'Low', 'Info', 'ClinicsController', 'createClinic');
            
            res.status(201).json({
              id: clinicId,
              clinicName,
              businessName,
              streetAddress,
              city,
              state,
              country,
              zipCode,
              latitude: latitude || 0,
              longitude: longitude || 0,
              dateCreated: new Date().toISOString(),
              services: services
            });
          }
        });
      });
      
      insertService.finalize();
    });
  });
});

// Search clinics
app.get('/api/clinics/search', (req, res) => {
  const { city, state, services: serviceIds, searchTerm } = req.query;
  
  logEvent(`Searching clinics with filters: ${JSON.stringify(req.query)}`, 'Low', 'Info', 'ClinicsController', 'searchClinics');
  
  let query = `
    SELECT DISTINCT
      c.*,
      s.id as service_id,
      s.name as service_name,
      s.code as service_code,
      s.description as service_description,
      cs.price as service_price,
      cs.is_active as service_is_active
    FROM clinics c
    LEFT JOIN clinic_services cs ON c.id = cs.clinic_id
    LEFT JOIN services s ON cs.service_id = s.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (city) {
    query += ' AND LOWER(c.city) LIKE LOWER(?)';
    params.push(`%${city}%`);
  }
  
  if (state) {
    query += ' AND LOWER(c.state) LIKE LOWER(?)';
    params.push(`%${state}%`);
  }
  
  if (searchTerm) {
    query += ' AND (LOWER(c.clinic_name) LIKE LOWER(?) OR LOWER(c.business_name) LIKE LOWER(?))';
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }
  
  if (serviceIds) {
    const serviceArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
    const placeholders = serviceArray.map(() => '?').join(',');
    query += ` AND c.id IN (
      SELECT DISTINCT clinic_id FROM clinic_services 
      WHERE service_id IN (${placeholders})
    )`;
    params.push(...serviceArray);
  }
  
  query += ' ORDER BY c.date_created DESC, s.name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      logEvent(`Error searching clinics: ${err.message}`, 'High', 'Error', 'ClinicsController', 'searchClinics');
      return res.status(500).json({ error: 'Failed to search clinics' });
    }
    
    // Group services by clinic
    const clinicsMap = new Map();
    
    rows.forEach(row => {
      if (!clinicsMap.has(row.id)) {
        clinicsMap.set(row.id, {
          id: row.id,
          clinicName: row.clinic_name,
          businessName: row.business_name,
          streetAddress: row.street_address,
          city: row.city,
          state: row.state,
          country: row.country,
          zipCode: row.zip_code,
          latitude: row.latitude,
          longitude: row.longitude,
          dateCreated: row.date_created,
          services: []
        });
      }
      
      if (row.service_id) {
        clinicsMap.get(row.id).services.push({
          serviceId: row.service_id,
          serviceName: row.service_name,
          serviceCode: row.service_code,
          description: row.service_description,
          price: row.service_price,
          isActive: Boolean(row.service_is_active)
        });
      }
    });
    
    const clinics = Array.from(clinicsMap.values());
    res.json(clinics);
  });
});

// Get system logs
app.get('/api/logs', (req, res) => {
  const { type, priority, limit = 100 } = req.query;
  
  let query = 'SELECT * FROM system_logs WHERE 1=1';
  const params = [];
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  
  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      logEvent(`Error fetching logs: ${err.message}`, 'High', 'Error', 'LogsController', 'getLogs');
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
    
    const logs = rows.map(row => ({
      id: row.id,
      message: row.message,
      priority: row.priority,
      type: row.type,
      timestamp: row.timestamp,
      project: row.project,
      className: row.class_name,
      method: row.method
    }));
    
    res.json(logs);
  });
});

// Clear system logs
app.delete('/api/logs', (req, res) => {
  logEvent('Clearing all system logs', 'Medium', 'Info', 'LogsController', 'clearLogs');
  
  db.run('DELETE FROM system_logs', (err) => {
    if (err) {
      logEvent(`Error clearing logs: ${err.message}`, 'High', 'Error', 'LogsController', 'clearLogs');
      return res.status(500).json({ error: 'Failed to clear logs' });
    }
    
    logEvent('System logs cleared successfully', 'Low', 'Info', 'LogsController', 'clearLogs');
    res.json({ message: 'Logs cleared successfully' });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logEvent(`Unhandled error: ${err.message}`, 'Critical', 'Error', 'Server', 'errorHandler');
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logEvent(`CMD Telehealth API Server started on port ${PORT}`, 'Low', 'Info', 'Server', 'startup');
  console.log(`🚀 CMD Telehealth API Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logEvent('Server shutting down gracefully', 'Medium', 'Info', 'Server', 'shutdown');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});