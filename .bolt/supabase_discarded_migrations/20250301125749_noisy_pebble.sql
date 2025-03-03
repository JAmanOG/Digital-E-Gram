/*
  # Create application form schema

  1. New Tables
    - `application_forms`
      - `id` (uuid, primary key)
      - `service_id` (uuid, references services)
      - `form_schema` (jsonb)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `application_forms` table
    - Add policy for authenticated users to read application forms
    - Add policy for admins to modify application forms
*/

CREATE TABLE IF NOT EXISTS application_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  form_schema jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view application forms"
  ON application_forms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify application forms"
  ON application_forms
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Insert sample application forms
INSERT INTO application_forms (service_id, form_schema)
SELECT 
  id,
  CASE 
    WHEN name = 'Birth Certificate' THEN 
      '{
        "fields": [
          {"name": "child_name", "label": "Child Name", "type": "text", "required": true},
          {"name": "date_of_birth", "label": "Date of Birth", "type": "date", "required": true},
          {"name": "place_of_birth", "label": "Place of Birth", "type": "text", "required": true},
          {"name": "father_name", "label": "Father Name", "type": "text", "required": true},
          {"name": "mother_name", "label": "Mother Name", "type": "text", "required": true},
          {"name": "address", "label": "Address", "type": "textarea", "required": true}
        ]
      }'::jsonb
    WHEN name = 'Death Certificate' THEN 
      '{
        "fields": [
          {"name": "deceased_name", "label": "Name of Deceased", "type": "text", "required": true},
          {"name": "date_of_death", "label": "Date of Death", "type": "date", "required": true},
          {"name": "place_of_death", "label": "Place of Death", "type": "text", "required": true},
          {"name": "cause_of_death", "label": "Cause of Death", "type": "text", "required": true},
          {"name": "informant_name", "label": "Informant Name", "type": "text", "required": true},
          {"name": "informant_relation", "label": "Relation to Deceased", "type": "text", "required": true}
        ]
      }'::jsonb
    WHEN name = 'Property Tax' THEN 
      '{
        "fields": [
          {"name": "owner_name", "label": "Property Owner Name", "type": "text", "required": true},
          {"name": "property_address", "label": "Property Address", "type": "textarea", "required": true},
          {"name": "property_type", "label": "Property Type", "type": "select", "required": true, "options": ["Residential", "Commercial", "Agricultural"]},
          {"name": "property_area", "label": "Property Area (sq ft)", "type": "number", "required": true},
          {"name": "previous_receipt", "label": "Previous Tax Receipt Number", "type": "text", "required": false}
        ]
      }'::jsonb
    ELSE 
      '{
        "fields": [
          {"name": "applicant_name", "label": "Applicant Name", "type": "text", "required": true},
          {"name": "application_details", "label": "Details", "type": "textarea", "required": true}
        ]
      }'::jsonb
  END
FROM services
ON CONFLICT DO NOTHING;