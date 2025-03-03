/*
  # Create application data schema

  1. New Tables
    - `application_data`
      - `id` (uuid, primary key)
      - `application_id` (uuid, references applications)
      - `form_data` (jsonb)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `application_data` table
    - Add policy for users to view their own application data
    - Add policy for staff and admins to view all application data
*/

CREATE TABLE IF NOT EXISTS application_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application data"
  ON application_data
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (
      SELECT user_id FROM applications WHERE id = application_id
    )
  );

CREATE POLICY "Staff and admins can view all application data"
  ON application_data
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Users can create application data"
  ON application_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM applications WHERE id = application_id
    )
  );

CREATE POLICY "Staff and admins can update application data"
  ON application_data
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin')
  );