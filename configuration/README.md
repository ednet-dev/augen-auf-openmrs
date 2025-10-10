# Augen Auf OpenMRS Configuration

Metadata imported from Azure workshop instance for local development.

## Contents

### Locations
- **Augen Auf** (Parent location) - Guatemala
- **QU01** - Quetzaltenango Outpatient Clinic

### Location Tags
- Login Location
- Queue Location
- Appointment Location
- Facility Location

### Forms
1. **AUA Registration** - Patient registration form
2. **Augen Auf Test** - Test form
3. **Ophthalmological Visit** - Comprehensive eye examination form

## Import to Local OpenMRS

### Prerequisites

You need a local OpenMRS instance running. The frontend dev server (`yarn start`) proxies to `dev3.openmrs.org` by default, so you'll need to either:

**Option A: Run Local OpenMRS Backend**
```bash
# Using Docker
docker run -d --name openmrs \
  -p 8080:8080 \
  -e DB_DATABASE=openmrs \
  -e DB_USERNAME=openmrs \
  -e DB_PASSWORD=openmrs \
  openmrs/openmrs-reference-application:latest

# Wait for startup (~2 minutes)
# Default credentials: admin / Admin123
```

**Option B: Use SDK**
```bash
# Install OpenMRS SDK
mvn org.openmrs.maven.plugins:openmrs-sdk-maven-plugin:setup-platform

# Run server
cd openmrs-server
mvn openmrs-sdk:run
```

### Import Metadata

Once your local OpenMRS is running at `http://localhost:8080/openmrs`:

```bash
# 1. Import locations and tags
./scripts/import-metadata.sh

# 2. Import forms
./scripts/import-forms.sh

# 3. Verify in browser
# Locations: http://localhost:8080/openmrs/spa/login/location
# Forms: http://localhost:8080/openmrs/spa/forms
```

### Custom Import

To import to a different OpenMRS instance:

```bash
./scripts/import-metadata.sh "https://your-instance.com/openmrs" "username:password"
./scripts/import-forms.sh "https://your-instance.com/openmrs" "username:password"
```

## Persistence

Once imported via REST API, metadata is persisted in the OpenMRS database and will be available after restarts.

For containerized deployments, ensure database volume is mounted:
```bash
docker run -v openmrs-data:/var/lib/mysql ...
```

## Manual Import (Alternative)

If scripts don't work, you can manually import:

### Via OpenMRS Admin UI
1. Navigate to: `http://localhost:8080/openmrs/admin`
2. Go to "Manage Global Properties"
3. Use the metadata import tools

### Via OpenMRS Initializer Module
1. Copy CSV files to OpenMRS configuration directory:
   ```
   cp -r locationtags/ locations/ ~/openmrs/configuration/
   ```
2. Restart OpenMRS - Initializer will auto-import

## Files

```
configuration/
├── README.md                          # This file
├── locationtags.json                  # Location tags (JSON)
├── locations.json                     # Locations (JSON)
├── forms.json                         # Forms metadata
├── locationtags/
│   └── locationtags.csv              # Location tags (CSV)
├── locations/
│   └── locations.csv                 # Locations (CSV)
└── forms/
    ├── form-aua-registration.json
    ├── schema-aua-registration.json
    ├── form-augen-auf-test.json
    ├── schema-augen-auf-test.json
    ├── form-ophthalmological.json
    └── schema-ophthalmological.json
```

## Source

Metadata exported from: `http://augen-auf-workshop.westeurope.cloudapp.azure.com/openmrs`

Export date: 2025-10-10

---

**Note**: Forms use OpenMRS 3.x JSON schema format. Ensure your OpenMRS instance supports form schema resources.
